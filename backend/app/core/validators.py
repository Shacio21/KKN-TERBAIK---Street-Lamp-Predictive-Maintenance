from fastapi import HTTPException


def validate_indonesia_coordinates(latitude: float | None, longitude: float | None) -> None:
    if latitude is None or longitude is None:
        return
    if not (-11.0 <= latitude <= 6.5 and 95.0 <= longitude <= 141.0):
        raise HTTPException(400, "Koordinat harus berada dalam wilayah Indonesia")
