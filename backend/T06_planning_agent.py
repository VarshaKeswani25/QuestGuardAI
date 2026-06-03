import json
import sys
from agents.planning_agent import (
    generate_missions,
    search_kcap,
    get_karachi_weather,
    get_location_context,
    answer_user_question,
)


def test_search():
    print("TEST 1: Pinecone Search")
    print("-" * 40)
    try:
        chunks = search_kcap("waste drainage problems Karachi", top_k=3)
        print(f"Chunks found: {len(chunks)}")
        for i, c in enumerate(chunks):
            print(f"  [{i+1}] Page {c['page']} | Score {c['score']}")
            print(f"       {c['text'][:120]}...")
    except Exception as e:
        print(f"⚠️  Skipped — {e}")
    print()


def test_weather():
    print("TEST 2: Live Weather")
    print("-" * 40)
    try:
        weather = get_karachi_weather()
        print(f"Condition  : {weather['condition']}")
        print(f"Temperature: {weather['temp_c']}°C")
        print(f"Humidity   : {weather['humidity']}%")
        print(f"Raining?   : {'Yes 🌧️' if weather['is_raining'] else 'No ☀️'}")
        print(f"Indoor Mode: {'YES ⚠️  — ' + weather['indoor_reason'] if weather['is_indoor'] else 'No — outdoor safe'}")
    except Exception as e:
        print(f"⚠️  Skipped — {e}")
    print()


def test_chat():
    print("TEST 3: User Questions")
    print("-" * 40)
    questions = [
        "Karachi mein barish ho rahi hai kya?",
        "Meri gali mein paani kyun bharta hai?",
        "Main apne mohalle ki madad kaise kar sakta hun?",
    ]
    for q in questions:
        print(f"Q: {q}")
        try:
            answer = answer_user_question(q)
            if answer:
                print(f"A: {answer}")
            else:
                print("⚠️  No response returned.")
        except Exception as e:
            print(f"⚠️  Skipped — {e}")
        print()


def test_location(location):
    print("TEST 4: Location Context (OpenStreetMap)")
    print("-" * 40)
    try:
        ctx = get_location_context(location)
        status = "✅ Found" if ctx["found"] else "❌ Not found (default used)"
        print(f"  {location:<22} → {status}")
        print(f"  {'':22}   Area type  : {ctx['area_type']}")
        print(f"  {'':22}   Description: {ctx['description']}")
    except Exception as e:
        print(f"⚠️  Skipped — {e}")
    print()


def test_missions(location, child_age):
    print("TEST 5: Mission Generation")
    print("-" * 40)
    print(f"Location : {location}")
    print(f"Age      : {child_age}")
    print("Generating missions, please wait...\n")

    try:
        result = generate_missions(location, child_age)

        w    = result.get("weather", {})
        loc  = result.get("location_info", {})
        mode = result.get("mode", "unknown")

        print(f"Weather  : {w.get('condition')}, {w.get('temp_c')}°C, humidity {w.get('humidity')}%")
        print(f"Location : {loc.get('display', location)}")
        print(f"Area Type: {loc.get('description', 'N/A')}")

        if mode == "indoor":
            print(f"Indoor?  : YES ⚠️  — {w.get('indoor_reason', '')}")
        else:
            print(f"Indoor?  : No ☀️  — outdoor missions")

        print(f"Weather at generation time: {w.get('condition')} {w.get('temp_c')}°C")
        print()

        for i, m in enumerate(result["missions"]):
            print(f"Mission {i+1}: {m['title']}")
            print(f"  Description : {m.get('description', '[No description]')}")
            print(f"  Issue       : {m['civic_issue']}")
            print(f"  XP Reward   : {m['xp_reward']}")
            print(f"  Difficulty  : {m['difficulty']}")
            print(f"  Time        : {m['estimated_minutes']} minutes")
            if mode == "indoor":
                print(f"  Indoor Reason: {m.get('indoor_reason', 'N/A')}")
            print()

        print(f"Context chunks used: {len(result.get('context_used', []))}")
        for c in result.get("context_used", []):
            print(f"  Page {c['page']} | Score {c['score']} | {str(c['text'])[:80]}...")
        print()

        import os
        os.makedirs("data", exist_ok=True)
        output_file = f"data/missions_output_{location.replace(' ', '_')}_age{child_age}.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        print(f"✅ Output saved to {output_file}")

    except Exception as e:
        print(f"⚠️  Mission generation failed — {e}")
    print()


def test_indoor_missions(child_age):
    print("TEST 6: Indoor Mission Path Check")
    print("-" * 40)
    try:
        weather = get_karachi_weather()

        if not weather["is_indoor"]:
            print(f"⚠️  Current weather ({weather['condition']}, {weather['temp_c']}°C) does NOT trigger indoor mode.")
            print("   Indoor path activates when: temp > 35°C OR rain OR humidity < 30%")
            print("   Skipping indoor assertion.")
            print()
            return

        print(f"✅ Indoor mode triggered — reason: {weather['indoor_reason']}")
        from agents.planning_agent import generate_indoor_missions
        missions = generate_indoor_missions(child_age, weather["indoor_reason"])

        for i, m in enumerate(missions):
            print(f"  Indoor Mission {i+1}: {m['title']}")
            assert "description" in m and m["description"].strip(), f"❌ FAIL: Mission {i+1} missing description!"
            assert "indoor_reason" in m, f"❌ FAIL: Mission {i+1} missing indoor_reason!"
            print(f"    Description   : {m['description']}")
            print(f"    indoor_reason : {m['indoor_reason']}")
            print(f"    XP / Difficulty: {m['xp_reward']} XP | {m['difficulty']}")
            print()

        print("✅ All indoor missions have description + indoor_reason fields.")

    except Exception as e:
        print(f"⚠️  Skipped — {e}")
    print()


if __name__ == "__main__":
    # Usage: python T06_planning_agent.py "Lyari" 12
    # Default: Gulshan-e-Iqbal, age 12
    if len(sys.argv) == 3:
        location  = sys.argv[1]
        child_age = int(sys.argv[2])
    else:
        location  = "Gulshan-e-Iqbal"
        child_age = 12

    print(f"\n{'='*50}")
    print(f"  QuestGuard AI — Planning Agent Test Suite")
    print(f"  Location: {location} | Age: {child_age}")
    print(f"{'='*50}\n")

    test_search()
    test_weather()
    test_chat()
    test_location(location)
    test_missions(location, child_age)
    test_indoor_missions(child_age)