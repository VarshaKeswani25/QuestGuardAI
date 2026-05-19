from fastapi import APIRouter
from workflow.graph import run_workflow

router = APIRouter()


@router.get("/start-mission")
def start_mission():

    result = run_workflow()

    return {
        "message": "Mission workflow executed",
        "data": result
    }