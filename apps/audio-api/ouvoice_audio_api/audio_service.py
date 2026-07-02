from __future__ import annotations

import hashlib
import io
import json
import os
import threading
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Final, Optional

from pydub import AudioSegment
from pydub.exceptions import CouldntDecodeError


FORMAT_BY_CONTENT_TYPE: Final[dict[str, tuple[str, str]]] = {
    "audio/wav": ("wav", ".wav"),
    "audio/x-wav": ("wav", ".wav"),
    "audio/wave": ("wav", ".wav"),
    "audio/mpeg": ("mp3", ".mp3"),
    "audio/mp3": ("mp3", ".mp3"),
    "audio/webm": ("webm", ".webm"),
    "audio/ogg": ("ogg", ".ogg"),
    "audio/mp4": ("mp4", ".m4a"),
    "audio/x-m4a": ("mp4", ".m4a"),
}

FORMAT_BY_SUFFIX: Final[dict[str, tuple[str, str]]] = {
    ".wav": ("wav", ".wav"),
    ".mp3": ("mp3", ".mp3"),
    ".webm": ("webm", ".webm"),
    ".ogg": ("ogg", ".ogg"),
    ".m4a": ("mp4", ".m4a"),
    ".mp4": ("mp4", ".m4a"),
}


class AudioServiceError(Exception):
    """Base exception that can be safely mapped to an API response."""


class AudioDecodeError(AudioServiceError):
    pass


class AudioTooShortError(AudioServiceError):
    def __init__(self, duration_seconds: float) -> None:
        super().__init__("发现录音中断/过短")
        self.duration_seconds = duration_seconds


class StorageCapacityError(AudioServiceError):
    pass


@dataclass(frozen=True)
class AudioAnalysis:
    duration_seconds: float
    fingerprint: str
    format_name: str
    file_extension: str


@dataclass(frozen=True)
class StoredAudioMetadata:
    asset_id: str
    user_id: str
    dialect_tag: str
    fingerprint: str
    duration: float
    original_filename: str
    content_type: str
    stored_filename: str
    created_at: str
    length_override: bool


class AudioProcessor:
    def __init__(self, storage_dir: Path, minimum_duration_seconds: float, asset_sequence_start: int = 12) -> None:
        self.storage_dir = storage_dir
        self.minimum_duration_seconds = minimum_duration_seconds
        self.asset_sequence_start = asset_sequence_start
        self._allocation_lock = threading.Lock()
        self.storage_dir.mkdir(parents=True, exist_ok=True)

    def process_and_store(
        self,
        audio_bytes: bytes,
        user_id: str,
        dialect_tag: str,
        original_filename: str,
        content_type: str,
        allow_short_archive: bool = False,
    ) -> tuple[str, AudioAnalysis]:
        analysis = self.analyze(audio_bytes, original_filename, content_type)
        if analysis.duration_seconds < self.minimum_duration_seconds and not allow_short_archive:
            raise AudioTooShortError(analysis.duration_seconds)

        asset_id, reservation = self._reserve_asset_id()
        audio_path = self.storage_dir / f"{asset_id}{analysis.file_extension}"
        metadata_path = self.storage_dir / f"{asset_id}.json"
        temporary_audio_path = self.storage_dir / f".{asset_id}{analysis.file_extension}.part"
        temporary_metadata_path = self.storage_dir / f".{asset_id}.json.part"

        metadata = StoredAudioMetadata(
            asset_id=asset_id,
            user_id=user_id,
            dialect_tag=dialect_tag,
            fingerprint=analysis.fingerprint,
            duration=round(analysis.duration_seconds, 3),
            original_filename=original_filename,
            content_type=content_type,
            stored_filename=audio_path.name,
            created_at=datetime.now(timezone.utc).isoformat(),
            length_override=allow_short_archive and analysis.duration_seconds < self.minimum_duration_seconds,
        )

        try:
            temporary_audio_path.write_bytes(audio_bytes)
            temporary_metadata_path.write_text(
                json.dumps(asdict(metadata), ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
            os.replace(temporary_audio_path, audio_path)
            os.replace(temporary_metadata_path, metadata_path)
            reservation.unlink(missing_ok=True)
        except Exception:
            temporary_audio_path.unlink(missing_ok=True)
            temporary_metadata_path.unlink(missing_ok=True)
            reservation.unlink(missing_ok=True)
            raise

        return asset_id, analysis

    @staticmethod
    def analyze(audio_bytes: bytes, original_filename: str, content_type: str) -> AudioAnalysis:
        format_name, extension = resolve_audio_format(original_filename, content_type)
        try:
            segment = AudioSegment.from_file(io.BytesIO(audio_bytes), format=format_name)
        except (CouldntDecodeError, EOFError, ValueError) as error:
            raise AudioDecodeError("无法解析音频文件，请上传有效的 WAV、MP3、WebM、OGG 或 M4A 文件。") from error

        frame_rate = segment.frame_rate
        if frame_rate <= 0:
            raise AudioDecodeError("音频采样率无效，无法进行时长分析。")
        duration_seconds = float(segment.frame_count()) / float(frame_rate)
        return AudioAnalysis(
            duration_seconds=duration_seconds,
            fingerprint=hashlib.sha256(audio_bytes).hexdigest(),
            format_name=format_name,
            file_extension=extension,
        )

    def _reserve_asset_id(self) -> tuple[str, Path]:
        with self._allocation_lock:
            for offset in range(10_000):
                sequence = ((self.asset_sequence_start - 1 + offset) % 10_000) + 1
                asset_id = f"REC-WZ-{sequence:04d}"
                if any(self.storage_dir.glob(f"{asset_id}.*")):
                    continue
                reservation = self.storage_dir / f"{asset_id}.reserved"
                try:
                    reservation.touch(exist_ok=False)
                except FileExistsError:
                    continue
                return asset_id, reservation
        raise StorageCapacityError("本地模拟资产编号空间已满。")


def resolve_audio_format(original_filename: str, content_type: str) -> tuple[str, str]:
    normalized_content_type = content_type.split(";", 1)[0].strip().lower()
    by_content_type = FORMAT_BY_CONTENT_TYPE.get(normalized_content_type)
    if by_content_type:
        return by_content_type

    suffix = Path(original_filename).suffix.lower()
    by_suffix: Optional[tuple[str, str]] = FORMAT_BY_SUFFIX.get(suffix)
    if by_suffix:
        return by_suffix
    raise AudioDecodeError("不支持的音频格式，请上传 WAV、MP3、WebM、OGG 或 M4A 文件。")
