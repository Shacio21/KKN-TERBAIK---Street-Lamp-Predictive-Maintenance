from app.services.anomaly_service import calculate_anomaly_score
from app.services.mqtt_service import MQTTService


def test_anomaly_score_stays_in_range() -> None:
    score = calculate_anomaly_score(
        {
            "voltage": 260,
            "current": 8,
            "temperature_internal": 90,
            "battery_level": 5,
            "solar_power": 0,
        }
    )
    assert 0 <= score <= 1
    assert score > 0.7


def test_mqtt_payload_decode_accepts_bytes() -> None:
    service = MQTTService()
    decoded = service._decode_payload(b'{"lamp_code":"SL-001","battery_level":88}')
    assert decoded["lamp_code"] == "SL-001"
    assert decoded["battery_level"] == 88
