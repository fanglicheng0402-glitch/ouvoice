from __future__ import annotations

import hashlib
import io
import json
import wave
from pathlib import Path

from fastapi.testclient import TestClient

from ouvoice_audio_api.main import create_app


def make_silent_wav(duration_seconds: float, sample_rate: int = 8_000) -> bytes:
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(b"\x00\x00" * int(duration_seconds * sample_rate))
    return buffer.getvalue()


def test_rejects_audio_shorter_than_five_seconds(tmp_path: Path) -> None:
    client = TestClient(create_app(storage_dir=tmp_path))
    response = client.post(
        "/api/v1/audio/upload",
        data={"user_id": "user-wz-001", "dialect_tag": "温州话-鹿城区"},
        files={"file": ("short.wav", make_silent_wav(4.9), "audio/wav")},
    )

    assert response.status_code == 400
    assert response.json() == {"status": "error", "code": "AUDIO_TOO_SHORT", "message": "发现录音中断/过短"}


def test_stores_valid_audio_and_returns_fingerprint(tmp_path: Path) -> None:
    client = TestClient(create_app(storage_dir=tmp_path))
    audio = make_silent_wav(15.4)
    response = client.post(
        "/api/v1/audio/upload",
        data={"user_id": "user-wz-001", "dialect_tag": "温州话-鹿城区"},
        files={"file": ("valid.wav", audio, "audio/wav")},
    )

    assert response.status_code == 200
    body = response.json()
    assert body == {
        "status": "success",
        "asset_id": "REC-WZ-0012",
        "fingerprint": hashlib.sha256(audio).hexdigest(),
        "duration": 15.4,
    }
    assert (tmp_path / "REC-WZ-0012.wav").read_bytes() == audio
    assert (tmp_path / "REC-WZ-0012.json").is_file()


def test_archives_short_audio_when_user_explicitly_overrides_warning(tmp_path: Path) -> None:
    client = TestClient(create_app(storage_dir=tmp_path))
    audio = make_silent_wav(1.8)
    response = client.post(
        "/api/v1/audio/upload",
        data={
            "user_id": "user-wz-001",
            "dialect_tag": "温州话-鹿城区",
            "allow_short_archive": "true",
        },
        files={"file": ("short-override.wav", audio, "audio/wav")},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["asset_id"] == "REC-WZ-0012"
    assert body["duration"] == 1.8
    assert body["fingerprint"] == hashlib.sha256(audio).hexdigest()
    metadata = json.loads((tmp_path / "REC-WZ-0012.json").read_text(encoding="utf-8"))
    assert metadata["length_override"] is True
