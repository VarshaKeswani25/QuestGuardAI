from fastapi import APIRouter
from workflow.graph import run_workflow

router = APIRouter()


@router.get("/")
def home():
    return {
        "message": "QuestGuard AI Backend Running"
    }


@router.get("/start-mission")
def start_mission(approve: bool = True):

    result = run_workflow(approve)

    return {
        "message": "Mission workflow executed",
        "data": result
    }


@router.get("/approve-mission")
def approve_mission():

    return {
        "message": "Parent approved the mission"
    }


@router.get("/workflow-status")
def workflow_status():

    return {
        "status": "Workflow operational",
        "agents": [
            "Planning Agent",
            "Coordinator Agent"
        ]
    }