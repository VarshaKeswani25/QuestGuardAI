import random


missions = [
    "Clean blocked drain",
    "Plant a tree",
    "Report illegal garbage dumping",
    "Clean plastic waste from street"
]


def generate_mission():
    return random.choice(missions)