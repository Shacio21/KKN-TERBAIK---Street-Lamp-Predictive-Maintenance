import asyncio
import json
from datetime import UTC, datetime

from aiomqtt import Client, MqttError
from loguru import logger
from pydantic import ValidationError

from app.core.config import get_settings
from app.core.database import AsyncSessionLocal
from app.schemas.iot import DeviceLogPayload, HeartbeatPayload, OtaStatusPayload
from app.schemas.telemetry import TelemetryCreate
from app.services.iot_ingestion_service import ingest_device_log_payload, ingest_heartbeat_payload, ingest_ota_status_payload, ingest_telemetry_payload


class MQTTService:
    def __init__(self) -> None:
        self._connected = False
        self._client = None
        self._loop_task = None
        self.settings = get_settings()

    def is_connected(self) -> bool:
        return self._connected

    async def start(self) -> None:
        self._connected = False
        self._loop_task = asyncio.create_task(self._connection_loop())
        logger.info("MQTT service background loop started for {}:{}", self.settings.mqtt_host, self.settings.mqtt_port)

    async def stop(self) -> None:
        self._connected = False
        if self._loop_task:
            self._loop_task.cancel()
            try:
                await self._loop_task
            except asyncio.CancelledError:
                pass
        self._client = None
        logger.info("MQTT service background loop stopped")

    async def _connection_loop(self) -> None:
        while True:
            try:
                username = self.settings.mqtt_username
                password = self.settings.mqtt_password
                
                async with Client(
                    hostname=self.settings.mqtt_host,
                    port=self.settings.mqtt_port,
                    username=username,
                    password=password,
                    timeout=10,
                ) as client:
                    self._client = client
                    self._connected = True
                    logger.info("Successfully connected to MQTT broker at {}:{}", self.settings.mqtt_host, self.settings.mqtt_port)
                    
                    topic = self.settings.mqtt_base_topic or "pju/#"
                    await client.subscribe(topic)
                    logger.info("Subscribed to MQTT topic: {}", topic)
                    
                    async for message in client.messages:
                        topic_str = str(message.topic)
                        payload_bytes = message.payload
                        asyncio.create_task(self.handle_message(topic_str, payload_bytes))
                        
            except MqttError as exc:
                self._connected = False
                self._client = None
                logger.warning("MQTT connection error: {}. Retrying in 5 seconds...", exc)
                await asyncio.sleep(5)
            except asyncio.CancelledError:
                self._connected = False
                self._client = None
                break
            except Exception as exc:
                self._connected = False
                self._client = None
                logger.error("Unexpected error in MQTT loop: {}. Retrying in 5 seconds...", exc)
                await asyncio.sleep(5)

    async def handle_message(self, topic: str, payload: bytes | str | dict) -> None:
        try:
            data = self._decode_payload(payload)
        except Exception as exc:
            logger.warning("Failed to decode MQTT payload on topic {}: {}", topic, exc)
            return

        parts = topic.split("/")
        if len(parts) < 4 or parts[0] != "pju":
            logger.warning("Ignoring MQTT topic with unexpected format: {}", topic)
            return
        lamp_code = data.get("lamp_code") or parts[2]
        event_type = parts[3]
        data["lamp_code"] = lamp_code
        try:
            async with AsyncSessionLocal() as db:
                if event_type == "telemetry":
                    await ingest_telemetry_payload(db, TelemetryCreate(**data))
                elif event_type == "heartbeat":
                    await ingest_heartbeat_payload(db, HeartbeatPayload(**data))
                elif event_type == "device-log":
                    await ingest_device_log_payload(db, DeviceLogPayload(**data))
                elif event_type == "ota-status":
                    await ingest_ota_status_payload(db, OtaStatusPayload(**data))
                else:
                    logger.warning("Ignoring MQTT event type: {}", event_type)
        except ValidationError as exc:
            logger.warning("Invalid MQTT payload on {}: {}", topic, exc)
        except Exception as exc:
            logger.error("Failed to process MQTT payload on {}: {}", topic, exc)

    def _decode_payload(self, payload: bytes | str | dict) -> dict:
        if isinstance(payload, dict):
            return payload
        if isinstance(payload, bytes):
            payload = payload.decode("utf-8")
        return json.loads(payload)

    async def publish_brightness(self, place_id: str | None, lamp_code: str, brightness: float, issued_by: str) -> dict:
        topic = f"pju/{place_id or 'default'}/{lamp_code}/cmd/brightness"
        payload = {"brightness": brightness, "issued_by": issued_by, "timestamp": datetime.now(UTC).isoformat()}
        published = False
        if self._connected and self._client:
            try:
                await self._client.publish(topic, json.dumps(payload))
                published = True
                logger.info("MQTT publish success to {}: {}", topic, payload)
            except Exception as exc:
                logger.error("Failed to publish to MQTT topic {}: {}", topic, exc)
        else:
            logger.warning("MQTT client not connected, skipping publish to {}: {}", topic, payload)
        return {"topic": topic, "payload": payload, "published": published}

    async def publish_schedule(self, place_id: str | None, lamp_code: str, schedule: dict) -> dict:
        topic = f"pju/{place_id or 'default'}/{lamp_code}/cmd/schedule"
        payload = {**schedule, "timestamp": datetime.now(UTC).isoformat()}
        published = False
        if self._connected and self._client:
            try:
                await self._client.publish(topic, json.dumps(payload))
                published = True
                logger.info("MQTT publish success to {}: {}", topic, payload)
            except Exception as exc:
                logger.error("Failed to publish to MQTT topic {}: {}", topic, exc)
        else:
            logger.warning("MQTT client not connected, skipping publish to {}: {}", topic, payload)
        return {"topic": topic, "payload": payload, "published": published}

    async def publish_ota(self, place_id: str | None, lamp_code: str, job: dict) -> dict:
        topic = f"pju/{place_id or 'default'}/{lamp_code}/cmd/ota"
        payload = {**job, "timestamp": datetime.now(UTC).isoformat()}
        published = False
        if self._connected and self._client:
            try:
                await self._client.publish(topic, json.dumps(payload))
                published = True
                logger.info("MQTT publish success to {}: {}", topic, payload)
            except Exception as exc:
                logger.error("Failed to publish to MQTT topic {}: {}", topic, exc)
        else:
            logger.warning("MQTT client not connected, skipping publish to {}: {}", topic, payload)
        return {"topic": topic, "payload": payload, "published": published}


mqtt_service = MQTTService()
