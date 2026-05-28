from fastapi import HTTPException, UploadFile


ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024


async def validate_ticket_attachment(file: UploadFile) -> bytes:
    content = await file.read()
    await file.seek(0)
    if len(content) > MAX_ATTACHMENT_SIZE:
        raise HTTPException(400, "Ukuran file melebihi 10MB")
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(400, "Tipe file lampiran tidak diizinkan")
    return content
