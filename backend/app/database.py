import os
import logging

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

logger = logging.getLogger("backend-database")
logging.basicConfig(level=logging.INFO)

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/land_records"
)

Base = declarative_base()


# ==========================================
# DATABASE CONNECTION
# ==========================================

def get_engine_and_session():
    """Create database engine and session with graceful SQLite fallback."""

    # Dynamic path to land_records.db in backend folder
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sqlite_file = os.path.join(base_dir, "land_records.db")
    sqlite_url = f"sqlite:///{sqlite_file.replace(os.sep, '/')}"

    if "postgres" in DATABASE_URL:
        try:
            safe_url = (
                DATABASE_URL.split("@")[-1]
                if "@" in DATABASE_URL
                else DATABASE_URL
            )

            logger.info(f"Connecting to database at: {safe_url}")

            engine = create_engine(
                DATABASE_URL,
                pool_pre_ping=True,
                connect_args={"connect_timeout": 3}
            )

            with engine.connect():
                logger.info("Successfully connected to PostgreSQL!")

            return engine, sessionmaker(
                autocommit=False,
                autoflush=False,
                bind=engine
            )

        except Exception as e:
            logger.exception(f"PostgreSQL connection failed: {e}. Falling back to SQLite at {sqlite_url}.")

            engine = create_engine(
                sqlite_url,
                connect_args={"check_same_thread": False}
            )

            return engine, sessionmaker(
                autocommit=False,
                autoflush=False,
                bind=engine
            )

    engine = create_engine(
        DATABASE_URL,
        connect_args=(
            {"check_same_thread": False}
            if "sqlite" in DATABASE_URL else {}
        )
    )

    return engine, sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine
    )


engine, SessionLocal = get_engine_and_session()


# ==========================================
# DATABASE SESSION
# ==========================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ==========================================
# INITIALIZE DATABASE
# ==========================================

def init_db():
    from app.models import sql_models

    Base.metadata.create_all(bind=engine)

    logger.info("Database tables verified or created.")

    db = SessionLocal()

    try:
        user_count = db.query(sql_models.User).count()

        if user_count == 0:
            logger.info("Seeding initial sample data...")
            _seed_data(db)

    except Exception as e:
        logger.exception(f"Database initialization failed: {e}")
        db.rollback()

    finally:
        db.close()


# ==========================================
# SEED SAMPLE DATA
# ==========================================

def _seed_data(db: Session):
    from app.models import sql_models

    # --------------------------------------
    # 1. USERS
    # --------------------------------------

    admin = sql_models.User(
        email="admin@landrecords.gov.in",
        hashed_password="240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",
        full_name="Rajesh Sharma (Admin)",
        role="admin",
        department="State Land Administration Directorate",
        is_active=True
    )

    officer = sql_models.User(
        email="officer@landrecords.gov.in",
        hashed_password="3e3d64fe3fa03f56d4ddb59c4a85fa06669eeff12933d3c7e3f88fdfb5eb7dd9",
        full_name="Priya Deshmukh (Verification Officer)",
        role="officer",
        department="Taluk Revenue Office - Bengaluru North",
        is_active=True
    )

    db.add_all([admin, officer])
    db.commit()
    db.refresh(admin)
    db.refresh(officer)

    # ==========================================
    # 2. CREATE 10 SAMPLE LAND RECORDS
    # ==========================================

    sample_records = [
        sql_models.LandRecord(
            id=1,
            owner_name="Ramesh Kumar Gowda",
            survey_number="142/3A",
            ulpin="KA-BLR-2024-981021",
            district="Bengaluru Urban",
            taluk="Bengaluru North",
            village="Yelahanka",
            land_area=3.75,
            land_unit="Acres",
            land_type="Agricultural",
            document_number="DOC-2024-REG-7819",
            status="Verified",
            notes="All boundaries matching survey GIS coordinates. Clear title deed.",
            created_by_id=admin.id
        ),
        sql_models.LandRecord(
            id=2,
            owner_name="Ananya Sundaram",
            survey_number="88/1B",
            ulpin="KA-BLR-2024-441920",
            district="Bengaluru Urban",
            taluk="Bengaluru South",
            village="Begur",
            land_area=1.20,
            land_unit="Acres",
            land_type="Residential Conversion",
            document_number="DOC-2024-REG-8821",
            status="Verified",
            notes="Converted to NA residential vide DC order dated 14/02/2024.",
            created_by_id=officer.id
        ),
        sql_models.LandRecord(
            id=3,
            owner_name="Mohammed Farooq Khan",
            survey_number="215/4",
            ulpin="KA-MYS-2024-110293",
            district="Mysuru",
            taluk="Hunsur",
            village="Bilagula",
            land_area=4.50,
            land_unit="Acres",
            land_type="Agricultural",
            document_number="DOC-2024-REG-9012",
            status="Pending",
            notes="Awaiting field surveyor cross-verification for sub-division 4.",
            created_by_id=officer.id
        ),
        sql_models.LandRecord(
            id=4,
            owner_name="Suresh Chandra Patel",
            survey_number="33/2C",
            ulpin="KA-TUM-2024-554201",
            district="Tumakuru",
            taluk="Tiptur",
            village="Kibbanahalli",
            land_area=6.80,
            land_unit="Acres",
            land_type="Plantation / Commercial",
            document_number="DOC-2024-REG-9430",
            status="Pending",
            notes="OCR extracted area 6.80 acres matches document; mutation pending.",
            created_by_id=officer.id
        ),
        sql_models.LandRecord(
            id=5,
            owner_name="Sunita Devi Yadav",
            survey_number="109/X",
            ulpin="KA-BLR-2024-001928",
            district="Bengaluru Urban",
            taluk="Anekal",
            village="Sarjapura",
            land_area=-2.50,
            land_unit="Acres",
            land_type="Agricultural",
            document_number="INV-DOC-000",
            status="Rejected",
            notes="Negative land area and invalid survey sub-division. Document rejected.",
            created_by_id=admin.id
        ),
        sql_models.LandRecord(
            id=6,
            owner_name="Vikramaditya Rao",
            survey_number="52/1A",
            ulpin="KA-BLR-2024-772189",
            district="Bengaluru Rural",
            taluk="Devanahalli",
            village="Vijayapura",
            land_area=5.25,
            land_unit="Acres",
            land_type="Industrial Zone",
            document_number="DOC-2024-REG-9801",
            status="Verified",
            notes="KIADB clearance certified and verified against survey record.",
            created_by_id=admin.id
        ),
        sql_models.LandRecord(
            id=7,
            owner_name="Lakshmi Narayana Swamy",
            survey_number="142/3A",
            ulpin="KA-BLR-2024-998811",
            district="Bengaluru Urban",
            taluk="Bengaluru North",
            village="Yelahanka",
            land_area=2.10,
            land_unit="Acres",
            land_type="Agricultural",
            document_number="DOC-2024-REG-9911",
            status="Rejected",
            notes="Conflict: Duplicate Survey Number 142/3A already assigned in Yelahanka village.",
            created_by_id=officer.id
        ),
        sql_models.LandRecord(
            id=8,
            owner_name="Gurpreet Singh Gill",
            survey_number="304/6",
            ulpin="KA-BEL-2024-332901",
            district="Belagavi",
            taluk="Chikkodi",
            village="Nipani Rural",
            land_area=8.40,
            land_unit="Acres",
            land_type="Agricultural",
            document_number="DOC-2024-REG-1014",
            status="Verified",
            notes="Duly signed Patta and Encumbrance Certificate uploaded.",
            created_by_id=admin.id
        ),
        sql_models.LandRecord(
            id=9,
            owner_name="Kavitha Radhakrishnan",
            survey_number="19/7D",
            ulpin="KA-MYS-2024-664410",
            district="Mysuru",
            taluk="Nanjangud",
            village="Hadinaru",
            land_area=2.85,
            land_unit="Acres",
            land_type="Agricultural",
            document_number="DOC-2024-REG-1055",
            status="Pending",
            notes="Recently submitted for digitisation; OCR processing completed.",
            created_by_id=officer.id
        ),
        sql_models.LandRecord(
            id=10,
            owner_name="Deepak Varma",
            survey_number="77/3",
            ulpin="KA-BLR-2024-889922",
            district="Bengaluru Urban",
            taluk="Bengaluru East",
            village="Varthur",
            land_area=0.95,
            land_unit="Acres",
            land_type="Commercial",
            document_number="DOC-2024-REG-1089",
            status="Verified",
            notes="Clear survey map and tax receipts validated.",
            created_by_id=admin.id
        )
    ]

    db.add_all(sample_records)
    db.commit()

    # ==========================================
    # 3. VALIDATION RESULTS
    # ==========================================

    val_1 = sql_models.ValidationResult(
        record_id=1,
        status="Verified",
        error_count=0,
        warning_count=0,
        errors_json=[],
        warnings_json=[],
        suggestions_json=[],
        rules_evaluated_json=[
            {"rule": "Owner Name Check", "passed": True, "details": "Valid owner name provided."},
            {"rule": "Survey Number Check", "passed": True, "details": "Survey number 142/3A is valid."},
            {"rule": "Duplicate Survey Check", "passed": True, "details": "No existing conflicting survey number in Yelahanka."},
            {"rule": "Land Area Positive Check", "passed": True, "details": "Land area is positive (3.75 Acres)."},
            {"rule": "Location Completeness", "passed": True, "details": "District, Taluk, Village specified."},
            {"rule": "OCR Cross-Match", "passed": True, "details": "OCR text matches form inputs with 96% confidence."}
        ]
    )

    val_2 = sql_models.ValidationResult(
        record_id=2,
        status="Verified",
        error_count=0,
        warning_count=0,
        errors_json=[],
        warnings_json=[],
        suggestions_json=[],
        rules_evaluated_json=[
            {"rule": "Owner Name Check", "passed": True},
            {"rule": "Survey Number Check", "passed": True},
            {"rule": "Duplicate Survey Check", "passed": True},
            {"rule": "Land Area Positive Check", "passed": True},
            {"rule": "Location Completeness", "passed": True},
            {"rule": "OCR Text Cross-Match", "passed": True}
        ]
    )

    val_3 = sql_models.ValidationResult(
        record_id=3,
        status="Pending",
        error_count=0,
        warning_count=1,
        errors_json=[],
        warnings_json=["Sub-division boundary requires secondary survey GIS inspection."],
        suggestions_json=["Field inspection scheduled by verification officer."],
        rules_evaluated_json=[
            {"rule": "Owner Name Check", "passed": True},
            {"rule": "Survey Number Check", "passed": True},
            {"rule": "Duplicate Survey Check", "passed": True},
            {"rule": "Land Area Positive Check", "passed": True},
            {"rule": "Location Completeness", "passed": True},
            {"rule": "OCR Text Cross-Match", "passed": True, "note": "Minor punctuation difference in Owner initial"}
        ]
    )

    val_5 = sql_models.ValidationResult(
        record_id=5,
        status="Rejected",
        error_count=2,
        warning_count=0,
        errors_json=[
            "Land area cannot be negative (-2.50 Acres).",
            "Invalid document number format (INV-DOC-000)."
        ],
        warnings_json=[],
        suggestions_json=[
            "Correct the land area in Form 7A to a positive real value.",
            "Upload a registered sale deed or RTC certificate with standard DOC-YYYY-REG-XXXX format."
        ],
        rules_evaluated_json=[
            {"rule": "Owner Name Check", "passed": True},
            {"rule": "Survey Number Check", "passed": True},
            {"rule": "Duplicate Survey Check", "passed": True},
            {"rule": "Land Area Positive Check", "passed": False},
            {"rule": "Location Completeness", "passed": True},
            {"rule": "Document Number Format Check", "passed": False}
        ]
    )

    val_7 = sql_models.ValidationResult(
        record_id=7,
        status="Rejected",
        error_count=1,
        warning_count=0,
        errors_json=[
            "Duplicate Survey Number 142/3A detected in Village Yelahanka, District Bengaluru Urban. Already registered under Record #1."
        ],
        warnings_json=[],
        suggestions_json=[
            "Check if this parcel is a sub-plot (e.g., 142/3A-1) or resolve title overlap dispute."
        ],
        rules_evaluated_json=[
            {"rule": "Owner Name Check", "passed": True},
            {"rule": "Survey Number Check", "passed": True},
            {"rule": "Duplicate Survey Check", "passed": False},
            {"rule": "Land Area Positive Check", "passed": True},
            {"rule": "Location Completeness", "passed": True}
        ]
    )

    # --------------------------------------
    # 4. ACTIVITY LOGS
    # --------------------------------------
    activity_items = [
        sql_models.ActivityLog(
            user_email="admin@landrecords.gov.in",
            action="SYSTEM_INITIALIZATION",
            details="System tables and default government schemas initialized",
            ip_address="127.0.0.1"
        ),
        sql_models.ActivityLog(
            user_email="officer@landrecords.gov.in",
            action="RECORD_CREATED",
            details="Created Record #1 for Ramesh Kumar Gowda (Survey 142/3A)",
            ip_address="192.168.1.104"
        ),
        sql_models.ActivityLog(
            user_email="officer@landrecords.gov.in",
            action="VALIDATION_COMPLETED",
            details="Intelligent validation completed for Record #1 (Status: Verified)",
            ip_address="192.168.1.104"
        ),
        sql_models.ActivityLog(
            user_email="officer@landrecords.gov.in",
            action="RECORD_CREATED",
            details="Created Record #5 for Sunita Devi Yadav",
            ip_address="192.168.1.104"
        ),
        sql_models.ActivityLog(
            user_email="officer@landrecords.gov.in",
            action="VALIDATION_FAILED",
            details="Validation detected negative area and invalid document on Record #5 (Status: Rejected)",
            ip_address="192.168.1.104"
        ),
        sql_models.ActivityLog(
            user_email="officer@landrecords.gov.in",
            action="RECORD_CREATED",
            details="Attempted duplicate record registration Survey 142/3A (Record #7)",
            ip_address="192.168.1.104"
        ),
        sql_models.ActivityLog(
            user_email="admin@landrecords.gov.in",
            action="RECORD_REJECTED",
            details="Administrator confirmed rejection of conflicting Record #7",
            ip_address="192.168.1.101"
        )
    ]

    db.add_all([val_1, val_2, val_3, val_5, val_7] + activity_items)
    db.commit()

    if "postgres" in DATABASE_URL:
        try:
            from sqlalchemy import text
            db.execute(text("SELECT setval('land_records_id_seq', COALESCE((SELECT MAX(id) FROM land_records), 1));"))
            db.commit()
        except Exception:
            pass

    logger.info("Sample seed data committed successfully.")
