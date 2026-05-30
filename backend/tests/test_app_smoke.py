from app.main import app


def test_app_registers_expected_routes() -> None:
    routes = {route.path for route in app.routes}
    assert "/health" in routes
    assert "/auth/login" in routes
    assert "/lamps/{lamp_id}/brightness" in routes
    assert "/iot/telemetry" in routes
    assert "/public/dashboard" in routes
    assert "/ws/dashboard" in routes


def test_openapi_schema_builds() -> None:
    schema = app.openapi()
    assert schema["info"]["title"] == "PJU IoT Monitoring API"
    assert "/iot/telemetry" in schema["paths"]
    assert "/public/dashboard" in schema["paths"]
