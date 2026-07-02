from __future__ import annotations

from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, Request, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.concurrency import run_in_threadpool

from .audio_service import (
    AudioDecodeError,
    AudioProcessor,
    AudioTooShortError,
    StorageCapacityError,
)
from .config import Settings
from .models import ApiError, AudioUploadSuccess


class UploadTooLargeError(Exception):
    pass


def create_app(storage_dir: Optional[Path] = None) -> FastAPI:
    settings = Settings.from_environment()
    processor = AudioProcessor(
        storage_dir=storage_dir or settings.storage_dir,
        minimum_duration_seconds=settings.minimum_duration_seconds,
        asset_sequence_start=settings.asset_sequence_start,
    )
    application = FastAPI(
        title="OuVoice Audio Processing API",
        version="1.0.0",
        description="Validates regional dialect audio and creates digital fingerprints.",
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=list(settings.web_origins),
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    )

    @application.exception_handler(AudioTooShortError)
    async def handle_short_audio(_request: Request, _error: AudioTooShortError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"status": "error", "code": "AUDIO_TOO_SHORT", "message": "发现录音中断/过短"},
        )

    @application.exception_handler(AudioDecodeError)
    async def handle_decode_error(_request: Request, error: AudioDecodeError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=ApiError(message=str(error)).model_dump(),
        )

    @application.exception_handler(UploadTooLargeError)
    async def handle_large_upload(_request: Request, _error: UploadTooLargeError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            content=ApiError(message="音频文件超过 50MB 上传限制。").model_dump(),
        )

    @application.exception_handler(StorageCapacityError)
    async def handle_storage_error(_request: Request, error: StorageCapacityError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_507_INSUFFICIENT_STORAGE,
            content=ApiError(message=str(error)).model_dump(),
        )

    @application.get("/health", tags=["system"])
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    @application.post(
        "/api/v1/audio/upload",
        response_model=AudioUploadSuccess,
        responses={
            400: {"model": ApiError, "description": "Audio is shorter than five seconds"},
            413: {"model": ApiError, "description": "Upload exceeds the configured limit"},
            422: {"model": ApiError, "description": "Audio cannot be decoded"},
        },
        tags=["audio"],
    )
    async def upload_audio(
        file: UploadFile = File(..., description="Browser audio Blob, preferably 48kHz WAV"),
        user_id: str = Form(..., min_length=1, max_length=128, examples=["user-wz-001"]),
        dialect_tag: str = Form(..., min_length=2, max_length=100, examples=["温州话-鹿城区"]),
        allow_short_archive: bool = Form(False, description="Explicit user override for archiving audio under five seconds"),
    ) -> AudioUploadSuccess:
        try:
            audio_bytes = await read_upload_with_limit(file, settings.maximum_upload_bytes)
            filename = file.filename or "recording.wav"
            content_type = file.content_type or "application/octet-stream"
        finally:
            await file.close()

        asset_id, analysis = await run_in_threadpool(
            processor.process_and_store,
            audio_bytes,
            user_id,
            dialect_tag,
            filename,
            content_type,
            allow_short_archive,
        )
        return AudioUploadSuccess(
            asset_id=asset_id,
            fingerprint=analysis.fingerprint,
            duration=round(analysis.duration_seconds, 3),
        )

    return application


async def read_upload_with_limit(upload: UploadFile, maximum_bytes: int) -> bytes:
    chunks: list[bytes] = []
    total_bytes = 0
    while chunk := await upload.read(1024 * 1024):
        total_bytes += len(chunk)
        if total_bytes > maximum_bytes:
            await upload.close()
            raise UploadTooLargeError
        chunks.append(chunk)
    if total_bytes == 0:
        raise AudioDecodeError("上传的音频文件为空。")
    return b"".join(chunks)


app = create_app()
