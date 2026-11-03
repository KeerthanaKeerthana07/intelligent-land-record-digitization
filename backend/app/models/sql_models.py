import json
from datetime import datetime, timezone
from typing import Any, List, Dict, Optional

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Float,
    Text,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.types import TypeDecorator
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.database import Base


class SafeJSON(TypeDecorator):
    """
    TypeDecorator that supports PostgreSQL JSONB and SQLite JSON/TEXT seamlessly.
    - If passed a JSON string, it automatically deserializes to Python dict/list
      before binding, preventing PostgreSQL DatatypeMismatch (character varying into jsonb).
    - If retrieved, it ensures result is a deserialized Python dict or list.
    """
    impl = JSON
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(JSONB())
        else:
            return dialect.type_descriptor(JSON())

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, str):
            try:
                return json.loads(value)
            except Exception:
                return value
        return value

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, str):
            try:
                return json.loads(value)
            except Exception:
                return value
        return value


# Uses SafeJSON which variants to JSONB in PostgreSQL and JSON in SQLite
JSON_TYPE = SafeJSON


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="officer")
    department = Column(
        String(255),
        default="Department of Land Revenue"
    )
    is_active = Column(Boolean, default=True)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    records = relationship("LandRecord", back_populates="creator")


class LandRecord(Base):
    __tablename__ = "land_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    owner_name = Column(String(255), nullable=False, index=True)
    survey_number = Column(String(100), nullable=False, index=True)
    ulpin = Column(String(100), unique=True, index=True, nullable=False)
    district = Column(String(100), nullable=False, index=True)
    taluk = Column(String(100), nullable=False)
    village = Column(String(100), nullable=False)
    land_area = Column(Float, nullable=False)
    land_unit = Column(String(50), default="Acres")
    land_type = Column(String(100), default="Agricultural")
    document_number = Column(String(100), nullable=False)
    status = Column(String(50), default="Pending", index=True)
    notes = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    created_by_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    creator = relationship("User", back_populates="records")

    documents = relationship(
        "UploadedDocument",
        back_populates="record",
        cascade="all, delete-orphan"
    )

    validation_result = relationship(
        "ValidationResult",
        back_populates="record",
        uselist=False,
        cascade="all, delete-orphan"
    )


class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    record_id = Column(
        Integer,
        ForeignKey("land_records.id", ondelete="CASCADE"),
        nullable=True
    )

    file_name = Column(String(255), nullable=False)
    original_file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)

    ocr_raw_text = Column(Text, nullable=True)

    # Store extracted OCR data safely as JSON/JSONB
    ocr_extracted_data = Column(JSON_TYPE, nullable=True)

    uploaded_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    record = relationship(
        "LandRecord",
        back_populates="documents"
    )

    @property
    def extracted_data(self) -> Optional[Dict[str, Any]]:
        val = self.ocr_extracted_data
        if val is None:
            return None
        if isinstance(val, dict):
            return val
        if isinstance(val, str):
            try:
                res = json.loads(val)
                return res if isinstance(res, dict) else None
            except Exception:
                return None
        return dict(val)


class ValidationResult(Base):
    __tablename__ = "validation_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    record_id = Column(
        Integer,
        ForeignKey("land_records.id", ondelete="CASCADE"),
        nullable=False,
        unique=True
    )

    status = Column(String(50), nullable=False)
    error_count = Column(Integer, default=0)
    warning_count = Column(Integer, default=0)

    # Store actual JSON data using JSONB in PostgreSQL / JSON in SQLite
    errors_json = Column(JSON_TYPE, default=list)
    warnings_json = Column(JSON_TYPE, default=list)
    suggestions_json = Column(JSON_TYPE, default=list)
    rules_evaluated_json = Column(JSON_TYPE, default=list)

    validated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    record = relationship(
        "LandRecord",
        back_populates="validation_result"
    )

    @property
    def errors(self) -> List[str]:
        val = self.errors_json
        if val is None:
            return []
        if isinstance(val, list):
            return val
        if isinstance(val, str):
            try:
                res = json.loads(val)
                return res if isinstance(res, list) else [str(res)]
            except Exception:
                return [val]
        return list(val)

    @property
    def warnings(self) -> List[str]:
        val = self.warnings_json
        if val is None:
            return []
        if isinstance(val, list):
            return val
        if isinstance(val, str):
            try:
                res = json.loads(val)
                return res if isinstance(res, list) else [str(res)]
            except Exception:
                return [val]
        return list(val)

    @property
    def suggestions(self) -> List[str]:
        val = self.suggestions_json
        if val is None:
            return []
        if isinstance(val, list):
            return val
        if isinstance(val, str):
            try:
                res = json.loads(val)
                return res if isinstance(res, list) else [str(res)]
            except Exception:
                return [val]
        return list(val)

    @property
    def rules_evaluated(self) -> List[Dict[str, Any]]:
        val = self.rules_evaluated_json
        if val is None:
            return []
        if isinstance(val, list):
            return val
        if isinstance(val, str):
            try:
                res = json.loads(val)
                return res if isinstance(res, list) else []
            except Exception:
                return []
        return list(val)


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_email = Column(String(255), nullable=False)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), default="127.0.0.1")

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )
