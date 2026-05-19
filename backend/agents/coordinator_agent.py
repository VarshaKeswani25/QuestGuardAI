from agents.planning_agent import generate_mission


class CoordinatorAgent:

    def start_quest(self, state):

        mission = generate_mission()

        state["mission"] = mission["title"]

        state["reward_points"] = mission["xp"]

        state["mission_status"] = "assigned"

        return state

    def approve_mission(self, state, approval=True):

        if approval:

            state["parent_approved"] = True

            state["mission_status"] = "approved"

        else:

            state["parent_approved"] = False

            state["mission_status"] = "rejected"

        return state

    def verify_mission(self, state):

        state["verification_status"] = "verified"

        return state

    def complete_mission(self, state):

        if state["parent_approved"]:

            state["mission_completed"] = True

            state["mission_status"] = "completed"

            state["badges"].append("Community Hero")

        return state
    
    def retry_mission(self, state):

        state["mission_status"] = "retrying"

        state["verification_status"] = "retry_required"

        return state