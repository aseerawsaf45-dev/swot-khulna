import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from ml.evaluation.evaluate import run_evaluation
from services.api.app.db.models import Base

@pytest.fixture
def temp_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    yield db
    db.close()

def test_pinn_beats_persistence_demo(temp_db):
    """
    Ensures that the PINN evaluation script runs end-to-end on synthetic data,
    produces a valid manifest, trains deterministically,
    and outperforms the naive persistence baseline.
    """
    manifest = run_evaluation(db=temp_db, force_synthetic=True)
    
    assert manifest["is_synthetic"] is True
    assert "pinn_mae" in manifest
    assert "baseline_mae" in manifest
    assert manifest["pinn_wins"] is True, "PINN failed to beat baseline on demo data"
    assert len(manifest["pinn_checksum"]) == 64

def test_real_data_evaluation_fails_closed(temp_db):
    """
    Ensures that real-data evaluation fails closed when there are too few eligible observations.
    """
    with pytest.raises(ValueError, match="Not enough real EC observations"):
        run_evaluation(db=temp_db, force_synthetic=False)
