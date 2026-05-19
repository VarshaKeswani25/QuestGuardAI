from agents.coordinator_agent import CoordinatorAgent


def run_workflow():

    state = {
        "child_name": "Rakhi",
        "child_location": "Karachi",
        "mission": "",
        "parent_approved": False,
        "mission_completed": False,
        "reward_points": 0
    }

    coordinator = CoordinatorAgent()

    state = coordinator.start_quest(state)

    state = coordinator.request_parent_approval(state)

    state = coordinator.complete_mission(state)

    print("\nFinal State:")
    print(state)