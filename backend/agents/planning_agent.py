import random


missions = [
    {
        "title": "Clean blocked drain",
        "difficulty": "Medium",
        "xp": 50
    },
    {
        "title": "Plant a tree",
        "difficulty": "Easy",
        "xp": 40
    },
    {
        "title": "Report illegal garbage dumping",
        "difficulty": "Hard",
        "xp": 70
    },
    {
        "title": "Clean plastic waste from street",
        "difficulty": "Easy",
        "xp": 35
    }
]


def generate_mission():
    return random.choice(missions)