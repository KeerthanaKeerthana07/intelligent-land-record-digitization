from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# ----------------- Auth Schemas -----------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "officer"
    department: Optional[str] = "Department of Land Revenue"
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# ----------------- Document Schemas -----------------
class DocumentResponse(BaseModel):
    id: int
    record_id: Optional[int]
    file_name: str
    original_file_name: str
    file_path: str
    file_type: str
    file_size: int
    ocr_raw_text: Optional[str] = None
    ocr_extracted_data: Optional[Dict[str, Any]] = None
    uploaded_at: datetime
    model_config = ConfigDict(from_attributes=True)

# ----------------- Validation Schemas -----------------
class ValidationRuleItem(BaseModel):
    rule: str
    passed: bool
    details: Optional[str] = None
    note: Optional[str] = None

class ValidationReportResponse(BaseModel):
    id: Optional[int] = None
    record_id: int
    status: str  # 'Verified', 'Pending', 'Rejected'
    error_count: int = 0
    warning_count: int = 0
    errors: List[str] = []
    warnings: List[str] = []
    suggestions: List[str] = []
    rules_evaluated: List[ValidationRuleItem] = []
    validated_at: datetime
    disclaimer: str = "Rule-based technical verification for digitization prototyping. Does not constitute judicial ownership certification."
    model_config = ConfigDict(from_attributes=True)

# ----------------- Land Record Schemas -----------------
class LandRecordBase(BaseModel):
    owner_name: str = Field(..., min_length=2, max_length=255)
    survey_number: str = Field(..., min_length=1, max_length=100)
    ulpin: str = Field(..., min_length=5, max_length=100)
    district: str = Field(..., min_length=2, max_length=100)
    taluk: str = Field(..., min_length=2, max_length=100)
    village: str = Field(..., min_length=2, max_length=100)
    land_area: float
    land_unit: str = "Acres"
    land_type: str = "Agricultural"
    document_number: str = Field(..., min_length=3, max_length=100)
    notes: Optional[str] = None

class LandRecordCreate(LandRecordBase):
    # Optional document ID previously uploaded via /api/documents/upload
    document_id: Optional[int] = None

class LandRecordUpdate(BaseModel):
    owner_name: Optional[str] = None
    survey_number: Optional[str] = None
    ulpin: Optional[str] = None
    district: Optional[str] = None
    taluk: Optional[str] = None
    village: Optional[str] = None
    land_area: Optional[float] = None
    land_unit: Optional[str] = None
    land_type: Optional[str] = None
    document_number: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class LandRecordResponse(LandRecordBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime
    created_by_id: Optional[int] = None
    validation_result: Optional[ValidationReportResponse] = None
    documents: List[DocumentResponse] = []
    model_config = ConfigDict(from_attributes=True)

class LandRecordListResponse(BaseModel):
    total: int
    page: int
    limit: int
    records: List[LandRecordResponse]

# ----------------- Dashboard Schemas -----------------
class MonthlyUploadStat(BaseModel):
    month: str
    count: int

class ValidationBreakdownStat(BaseModel):
    name: str
    value: int
    color: str

class RecentDocumentItem(BaseModel):
    id: int
    record_id: Optional[int]
    file_name: str
    owner_name: Optional[str]
    survey_number: Optional[str]
    status: str
    uploaded_at: datetime

class DashboardStatsResponse(BaseModel):
    total_records: int
    verified_records: int
    pending_records: int
    rejected_records: int
    total_land_area: float
    validation_breakdown: List[ValidationBreakdownStat]
    monthly_uploads: List[MonthlyUploadStat]
    recent_documents: List[RecentDocumentItem]
    recent_activity: List[Dict[str, Any]]

# ----------------- Monitoring & Health -----------------
class ServiceHealthItem(BaseModel):
    service: str
    status: str  # 'healthy', 'degraded', 'offline'
    latency_ms: float
    details: Optional[str] = None

class SystemHealthResponse(BaseModel):
    status: str
    uptime_seconds: float
    services: Dict[str, ServiceHealthItem]
    environment: Dict[str, Any]

# ----------------- Admin Schemas -----------------
class StatusUpdateRequest(BaseModel):
    status: str = Field(..., pattern="^(Verified|Rejected|Pending)$")
    reason: Optional[str] = None

class ActivityLogResponse(BaseModel):
    id: int
    user_email: str
    action: str
    details: Optional[str]
    ip_address: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
