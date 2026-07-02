from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field


class AudioUploadSuccess(BaseModel):
    status: Literal["success"] = "success"
    asset_id: str = Field(pattern=r"^REC-WZ-\d{4}$")
    fingerprint: str = Field(min_length=64, max_length=64)
    duration: float = Field(gt=0)


class ApiError(BaseModel):
    status: Literal["error"] = "error"
    code: Optional[str] = None
    message: str
