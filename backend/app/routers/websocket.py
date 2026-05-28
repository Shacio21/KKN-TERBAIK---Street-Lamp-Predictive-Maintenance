from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.security import generate_opaque_token
from app.services.websocket_service import websocket_manager

router = APIRouter(tags=["websocket"])


@router.get("/ws/ticket")
async def websocket_ticket() -> dict:
    return {"ticket": generate_opaque_token(), "expires_in_seconds": 60}


async def _ws_loop(channel: str, websocket: WebSocket) -> None:
    await websocket_manager.connect(channel, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        websocket_manager.disconnect(channel, websocket)


@router.websocket("/ws/dashboard")
async def dashboard_ws(websocket: WebSocket, ticket: str | None = None) -> None:
    await _ws_loop("dashboard", websocket)


@router.websocket("/ws/map")
async def map_ws(websocket: WebSocket, ticket: str | None = None) -> None:
    await _ws_loop("map", websocket)


@router.websocket("/ws/lamp/{lamp_id}")
async def lamp_ws(lamp_id: str, websocket: WebSocket, ticket: str | None = None) -> None:
    await _ws_loop(f"lamp:{lamp_id}", websocket)
