def _clip(value: float) -> float:
    return max(0.0, min(1.0, value))


def calculate_anomaly_score(payload: dict) -> float:
    score_parts: list[tuple[float, float]] = []

    voltage = payload.get("voltage")
    if voltage is not None:
        score_parts.append((_clip(abs(float(voltage) - 220.0) / 40.0), 0.30))

    current = payload.get("current")
    if current is not None:
        score_parts.append((_clip(max(0.0, float(current) - 5.0) / 3.0), 0.20))

    temp = payload.get("temperature_internal")
    if temp is not None:
        score_parts.append((_clip(max(0.0, float(temp) - 45.0) / 35.0), 0.20))

    battery = payload.get("battery_level")
    if battery is not None:
        score_parts.append((_clip(max(0.0, 50.0 - float(battery)) / 50.0), 0.20))

    solar = payload.get("solar_power")
    if solar is not None:
        score_parts.append((_clip(max(0.0, 5.0 - float(solar)) / 5.0), 0.10))

    if not score_parts:
        return 0.0
    weighted = sum(value * weight for value, weight in score_parts)
    total_weight = sum(weight for _, weight in score_parts)
    return round(_clip(weighted / total_weight), 3)
