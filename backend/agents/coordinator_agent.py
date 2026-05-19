from agents.planning_agent import generate_mission


class CoordinatorAgent:

    def start_quest(self, state):

        print("\nQuest Session Started")

        mission = generate_mission()

        state["mission"] = mission

        print(f"Mission Generated: {mission}")

        return state

    def request_parent_approval(self, state):

        print("\nWaiting for Parent Approval...")

        approval = input("Approve mission? (yes/no): ")

        if approval.lower() == "yes":
            state["parent_approved"] = True
            print("Mission Approved")
        else:
            state["parent_approved"] = False
            print("Mission Rejected")

        return state

    def complete_mission(self, state):

        if state["parent_approved"]:

            print("\nMission Completed Successfully")

            state["mission_completed"] = True

            state["reward_points"] += 50

            print(f"Reward Earned: {state['reward_points']} XP")

        else:
            print("\nMission cannot start without approval")

        return state