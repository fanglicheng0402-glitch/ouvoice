# OuVoice Audio Processing API

## Install and run

Python 3.9+ is supported. Create an isolated environment and install the service dependencies:

```bash
cd apps/audio-api
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
uvicorn ouvoice_audio_api.main:app --host 0.0.0.0 --port 8790 --reload
```

OpenAPI documentation is available at `http://localhost:8790/docs`.

The frontend should send the WAV Blob with the multipart field name `file`:

```ts
const form = new FormData()
form.append('file', wavBlob, 'recording.wav')
form.append('user_id', 'user-wz-001')
form.append('dialect_tag', '温州话-鹿城区')
// Only send true after the user explicitly chooses “坚持提交归档”.
form.append('allow_short_archive', 'true')
await fetch('http://localhost:8790/api/v1/audio/upload', { method: 'POST', body: form })
```

Audio shorter than five seconds still returns `AUDIO_TOO_SHORT` by default. The
`allow_short_archive=true` field records an explicit user override and archives
the file with `length_override: true` in its metadata.

WAV files are decoded without an external binary. Install FFmpeg when MP3, WebM, OGG, or M4A input is required:

```bash
brew install ffmpeg       # macOS
sudo apt install ffmpeg   # Debian / Ubuntu
```

## Test

```bash
python -m pip install -r requirements-dev.txt
pytest
mypy ouvoice_audio_api
```

Accepted environment variables:

- `OUVOICE_STORAGE_DIR`: local storage directory.
- `OUVOICE_WEB_ORIGINS`: comma-separated CORS origins.
- `OUVOICE_MINIMUM_DURATION_SECONDS`: defaults to `5`.
- `OUVOICE_MAXIMUM_UPLOAD_BYTES`: defaults to 50 MB.
- `OUVOICE_ASSET_SEQUENCE_START`: defaults to `12` for the demo serial sequence.
