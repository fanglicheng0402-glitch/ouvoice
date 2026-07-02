from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    storage_dir: Path
    minimum_duration_seconds: float
    maximum_upload_bytes: int
    asset_sequence_start: int
    web_origins: tuple[str, ...]

    @classmethod
    def from_environment(cls) -> "Settings":
        default_storage = Path(__file__).resolve().parents[1] / "mock_storage"
        origins = tuple(
            origin.strip()
            for origin in os.getenv("OUVOICE_WEB_ORIGINS", "http://localhost:5173").split(",")
            if origin.strip()
        )
        return cls(
            storage_dir=Path(os.getenv("OUVOICE_STORAGE_DIR", str(default_storage))).expanduser().resolve(),
            minimum_duration_seconds=float(os.getenv("OUVOICE_MINIMUM_DURATION_SECONDS", "5")),
            maximum_upload_bytes=int(os.getenv("OUVOICE_MAXIMUM_UPLOAD_BYTES", str(50 * 1024 * 1024))),
            asset_sequence_start=int(os.getenv("OUVOICE_ASSET_SEQUENCE_START", "12")),
            web_origins=origins,
        )

