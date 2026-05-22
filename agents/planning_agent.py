import os
import time
import json
import urllib.request
import urllib.error
import urllib.parse
from pinecone import Pinecone
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
GEMINI_API_KEY   = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY     = os.getenv("GROQ_API_KEY")
WEATHER_API_KEY  = os.getenv("WEATHER_API_KEY")
INDEX_NAME       = "questguard-kcap"


# ─────────────────────────────────────────
# 1. OPENSTREETMAP - Location Context
# ─────────────────────────────────────────
def get_location_context(location_name):
    try:
        query = urllib.parse.quote(f"{location_name}, Karachi, Pakistan")
        url   = f"https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=1&addressdetails=1&accept-language=en"
        req   = urllib.request.Request(url, headers={"User-Agent": "QuestGuardAI/1.0"})

        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())

        if not data:
            return {
                "found":       False,
                "display":     location_name,
                "area_type":   "residential area",
                "description": "residential area of Karachi"
            }

        result   = data[0]
        address  = result.get("addressdetails", {})
        osm_type = result.get("type", "")

        area_desc = []
        if osm_type in ["park", "garden", "recreation_ground"]:
            area_desc.append("near a park or green space")
        elif osm_type in ["residential", "suburb"]:
            area_desc.append("residential neighborhood")
        elif osm_type in ["industrial", "commercial"]:
            area_desc.append("industrial or commercial area")
        elif "road" in osm_type or "street" in osm_type:
            area_desc.append("street or road area")
        else:
            area_desc.append("urban area of Karachi")

        suburb    = address.get("suburb", "")
        quarter   = address.get("quarter", "")
        area_name = suburb or quarter or location_name

        return {
            "found":       True,
            "display":     location_name,
            "lat":         result.get("lat"),
            "lon":         result.get("lon"),
            "area_type":   osm_type,
            "description": f"{', '.join(area_desc)} in {area_name}, Karachi"
        }

    except Exception as e:
        print(f"OpenStreetMap lookup failed: {e}")
        return {
            "found":       False,
            "display":     location_name,
            "area_type":   "residential area",
            "description": "residential area of Karachi"
        }


# ─────────────────────────────────────────
# 2. WEATHER - Live Karachi Data
# ─────────────────────────────────────────
def get_karachi_weather():
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?q=Karachi&appid={WEATHER_API_KEY}&units=metric"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())

        temp    = data["main"]["temp"]
        humid   = data["main"]["humidity"]
        cond    = data["weather"][0]["description"]
        is_rain = "rain" in cond.lower()
        is_heat = temp > 35
        is_low_humidity = humid < 30
        is_indoor = is_rain or is_heat or is_low_humidity

        reason = []
        if is_rain:         reason.append("heavy rain")
        if is_heat:         reason.append(f"extreme heat {temp}°C")
        if is_low_humidity: reason.append(f"very low humidity {humid}%")

        return {
            "condition":     cond,
            "temp_c":        temp,
            "humidity":      humid,
            "is_raining":    is_rain,
            "is_indoor":     is_indoor,
            "indoor_reason": " and ".join(reason) if reason else ""
        }
    except Exception as e:
        print(f"Weather fetch failed: {e}")
        return {
            "condition":     "unknown",
            "temp_c":        None,
            "humidity":      None,
            "is_raining":    False,
            "is_indoor":     False,
            "indoor_reason": ""
        }


# ─────────────────────────────────────────
# 3. EMBEDDING - Gemini
# ─────────────────────────────────────────
def embed_query(query):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={GEMINI_API_KEY}"
    data = json.dumps({
        "model": "models/gemini-embedding-001",
        "content": {"parts": [{"text": query}]},
        "taskType": "RETRIEVAL_QUERY"
    }).encode("utf-8")
    while True:
        try:
            req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req) as resp:
                result = json.loads(resp.read())
            return result["embedding"]["values"]
        except urllib.error.HTTPError as e:
            if e.code == 429:
                print("Gemini embedding rate limit. Waiting 30s...")
                time.sleep(30)
            else:
                raise


# ─────────────────────────────────────────
# 4. TEXT GENERATION - Groq
# ─────────────────────────────────────────
def generate_text(prompt):
    client = Groq(api_key=GROQ_API_KEY)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content


# ─────────────────────────────────────────
# 5. PINECONE SEARCH
# ─────────────────────────────────────────
def get_index():
    try:
        pc = Pinecone(api_key=PINECONE_API_KEY)
        return pc.Index(INDEX_NAME)
    except Exception as e:
        print(f"Pinecone connection failed: {e}")
        return None

index = get_index()

def search_kcap(query, top_k=5):
    if index is None:
        raise ConnectionError("Pinecone index is not available.")
    vector  = embed_query(query)
    results = index.query(vector=vector, top_k=top_k, include_metadata=True)
    chunks  = []
    for match in results["matches"]:
        chunks.append({
            "text":  match["metadata"]["text"],
            "page":  match["metadata"]["page"],
            "score": round(match["score"], 3)
        })
    return chunks


# ─────────────────────────────────────────
# 6. USER QUESTION - Smart Chat
# ─────────────────────────────────────────
def answer_user_question(question, location="Karachi"):
    weather      = get_karachi_weather()
    weather_info = f"Current Karachi weather: {weather['condition']}, {weather['temp_c']}°C, humidity {weather['humidity']}%"

    chunks  = search_kcap(question, top_k=3)
    context = "\n\n".join([f"[Page {c['page']}]: {c['text']}" for c in chunks])

    prompt = f"""You are QuestGuard AI, a helpful assistant for children in Karachi about civic and environmental issues.

REAL-TIME DATA:
{weather_info}

CONTEXT FROM KARACHI CLIMATE ACTION PLAN:
{context}

USER QUESTION: {question}

IMPORTANT RULES:
- You can ONLY answer questions about:
  1. Karachi civic issues (waste, drainage, environment, greening)
  2. Current weather in Karachi
  3. How children can help their community
  4. QuestGuard missions and XP
- If the question is about anything else (politics, people names, homework,
  sports, entertainment, mohalla head/leader names, future predictions etc),
  reply EXACTLY with:
  "Yeh meri knowledge se bahar hai! Main sirf Karachi ke civic aur
   environmental masail ke baare mein madad kar sakta hun. Koi aur
   sawaal poochho! 😊"
- Answer in simple friendly Urdu/English mix a child can understand
- Keep answer under 100 words"""

    return generate_text(prompt)


# ─────────────────────────────────────────
# 7. INDOOR MISSIONS
# FIX: Ab description field properly surface hoti hai
# FIX: indoor_reason bhi har mission mein add hota hai
# ─────────────────────────────────────────
def generate_indoor_missions(child_age, reason):
    prompt = f"""You are QuestGuard AI Planning Agent for Karachi.

SITUATION: Outside weather is unsafe due to: {reason}
The child must stay indoors for safety.

Generate exactly 3 INDOOR home-based civic missions for a {child_age}-year-old child.

Indoor mission ideas:
- Turn off extra lights, fans, switches wasting electricity
- Clean their room or a shared space at home
- Help parent clean stagnant water in buckets, pots, or roof
- Sort household waste into recyclable and non-recyclable
- Check home for dripping taps or water leaks with parent help
- Make an awareness poster about saving water or electricity
- Count unnecessary electrical switches left on and turn them off
- Help organize a recycling corner at home

RULES:
- All missions must be done INSIDE the home only
- Hard missions must involve parent or family member
- Each must have a clear before and after photo opportunity
- Safe for a {child_age}-year-old child
- Make all 3 missions DIFFERENT difficulty: one Easy, one Medium, one Hard

DIFFICULTY & XP RULES:
- Easy: child does alone → xp_reward: 50, estimated_minutes: 10-15
- Medium: some effort needed → xp_reward: 75, estimated_minutes: 15-20
- Hard: needs parent help → xp_reward: 100, estimated_minutes: 20-25

CIVIC ISSUE CATEGORIES:
- energy_saving → turning off switches, fans, AC
- home_cleanliness → cleaning room, shared spaces
- water_conservation → fixing leaks, removing stagnant water with parent
- recycling → sorting waste at home
- awareness → making posters, educating family

Return ONLY valid JSON, no explanation, no markdown, no backticks:
{{
  "missions": [
    {{
      "title": "Short mission title",
      "description": "What the child does in 2 sentences.",
      "civic_issue": "energy_saving | home_cleanliness | water_conservation | recycling | awareness",
      "xp_reward": 50,
      "difficulty": "Easy",
      "estimated_minutes": 15,
      "indoor": true
    }}
  ]
}}"""

    raw = generate_text(prompt)
    raw = raw.replace("```json", "").replace("```", "").strip()
    try:
        missions = json.loads(raw)["missions"]

        # FIX: Ensure description field exists in every indoor mission
        # Agar LLM ne description nahi di toh fallback set karo
        for mission in missions:
            if "description" not in mission or not mission["description"].strip():
                mission["description"] = f"Complete this indoor {mission.get('civic_issue', 'home')} task safely at home."
            # FIX: indoor_reason tag karo taake front-end display kar sake
            mission["indoor_reason"] = reason

        return missions

    except json.JSONDecodeError as e:
        raise ValueError(f"JSON parse failed: {e}\nRaw:\n{raw}")


# ─────────────────────────────────────────
# 8. MISSION GENERATION - Smart + OSM
# FIX: Indoor aur outdoor ka return structure ab same hai
# FIX: Indoor mein bhi description properly aati hai
# ─────────────────────────────────────────
def generate_missions(location, child_age):
    weather      = get_karachi_weather()
    location_ctx = get_location_context(location)

    print(f"Weather  : {weather['condition']}, {weather['temp_c']}°C, humidity {weather['humidity']}%")
    print(f"Location : {location_ctx['display']}")
    print(f"Area Type: {location_ctx['description']}")
    print(f"Indoor?  : {'YES ⚠️  — ' + weather['indoor_reason'] if weather['is_indoor'] else 'No ☀️  — outdoor missions'}")

    # ── INDOOR PATH ──────────────────────────────────────────────────────────
    if weather["is_indoor"]:
        missions = generate_indoor_missions(child_age, weather["indoor_reason"])

        # FIX: context_used ab khali list nahi — ek informational entry hoti hai
        # taake front-end ko pata chale indoor_reason kya tha
        indoor_context = [{
            "text":  f"Indoor mode activated due to: {weather['indoor_reason']}. "
                     f"All missions are home-based and safe for a {child_age}-year-old.",
            "page":  "indoor",
            "score": 1.0
        }]

        return {
            "missions":      missions,        # description ab har mission mein hai
            "context_used":  indoor_context,  # FIX: ab empty nahi, reason visible hai
            "location":      location,
            "location_info": location_ctx,
            "child_age":     child_age,
            "weather":       weather,
            "mode":          "indoor"
        }

    # ── OUTDOOR PATH ─────────────────────────────────────────────────────────
    query   = f"civic problems waste drainage water environment recycling heat children community Karachi {location}"
    chunks  = search_kcap(query, top_k=5)
    context = "\n\n".join([f"[Page {c['page']}]: {c['text']}" for c in chunks])
    weather_context = f"Current weather: {weather['condition']}, {weather['temp_c']}°C"

    prompt = f"""You are the QuestGuard AI Planning Agent for Karachi.

REAL-TIME WEATHER:
{weather_context}

LOCATION INFO (from OpenStreetMap):
Child is in: {location}, Karachi
Area description: {location_ctx['description']}
Generate missions SPECIFIC to this area type.

CONTEXT FROM KARACHI CLIMATE ACTION PLAN:
{context}

TASK:
Generate exactly 3 civic missions for a {child_age}-year-old child in {location}, Karachi.

RULES:
- Physically safe for a {child_age}-year-old
- Match the area: {location_ctx['description']}
- If park nearby → greening or cleanliness mission
- If street/road → drain or waste mission
- If residential → water or recycling mission
- If industrial → pollution reporting mission
- Before and after photo for each mission
- Completable under 30 minutes
- DIFFERENT difficulty: one Easy, one Medium, one Hard
- DIFFERENT civic_issue categories

DIFFICULTY & XP RULES:
- Easy → xp_reward: 50, estimated_minutes: 10-15
- Medium → xp_reward: 75, estimated_minutes: 20-25
- Hard → xp_reward: 100, estimated_minutes: 25-30

CIVIC ISSUE CATEGORIES:
- waste | drainage | greening | water_conservation | recycling | heat_island

Return ONLY valid JSON, no explanation, no markdown, no backticks:
{{
  "missions": [
    {{
      "title": "Short mission title",
      "description": "What the child needs to do in 2 sentences.",
      "civic_issue": "waste | drainage | greening | water_conservation | recycling | heat_island",
      "xp_reward": 50,
      "difficulty": "Easy",
      "estimated_minutes": 15,
      "indoor": false
    }}
  ]
}}"""

    raw = generate_text(prompt)
    raw = raw.replace("```json", "").replace("```", "").strip()

    try:
        missions_data = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"JSON parse failed: {e}\nRaw:\n{raw}")

    # FIX: Outdoor missions mein bhi description fallback ensure karo
    for mission in missions_data["missions"]:
        if "description" not in mission or not mission["description"].strip():
            mission["description"] = f"Complete this {mission.get('civic_issue', 'civic')} task in your neighbourhood."

    return {
        "missions":      missions_data["missions"],
        "context_used":  chunks,
        "location":      location,
        "location_info": location_ctx,
        "child_age":     child_age,
        "weather":       weather,
        "mode":          "outdoor"
    }