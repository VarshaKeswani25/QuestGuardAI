from agents.coordinator_agent import CoordinatorAgent


def run_workflow():

    state = {
        "child_name": "Rakhi",
        "child_location": "Karachi",
        "mission": "",
        "parent_approved": True,
        "mission_completed": False,
        "reward_points": 0
    }

    coordinator = CoordinatorAgent()

    state = coordinator.start_quest(state)

    state = coordinator.complete_mission(state)

    return state