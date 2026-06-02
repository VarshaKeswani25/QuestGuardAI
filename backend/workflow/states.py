from typing import TypedDict, List


class QuestState(TypedDict):
    child_name: str
    child_location: str

    mission: str
    mission_status: str

    parent_approved: bool

    mission_completed: bool

    reward_points: int

    badges: List[str]

    verification_status: str