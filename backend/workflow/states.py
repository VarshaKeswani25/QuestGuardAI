from typing import TypedDict, List


class QuestState(TypedDict):
    child_name: str
    child_location: str
    mission: str
    parent_approved: bool
    mission_completed: bool
    reward_points: int