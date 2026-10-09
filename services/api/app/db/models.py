from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Site(Base):
    __tablename__ = "sites"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class SourceDataset(Base):
    __tablename__ = "source_datasets"
    
    id = Column(String, primary_key=True)
    provider = Column(String, nullable=False)
    dataset_name = Column(String, nullable=False)
    version = Column(String, nullable=True)
    description = Column(String, nullable=True)

class IngestionJob(Base):
    __tablename__ = "ingestion_jobs"
    
    id = Column(String, primary_key=True)
    status = Column(String, nullable=False)
    requested_period_start = Column(DateTime(timezone=True), nullable=False)
    requested_period_end = Column(DateTime(timezone=True), nullable=False)
    records_inserted = Column(Integer, default=0)
    records_rejected = Column(Integer, default=0)
    errors = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class HydroObservation(Base):
    __tablename__ = "hydro_observations"
    
    id = Column(String, primary_key=True)
    site_id = Column(String, ForeignKey("sites.id"), nullable=False)
    dataset_id = Column(String, ForeignKey("source_datasets.id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    retrieval_timestamp = Column(DateTime(timezone=True), nullable=False)
    source_variable = Column(String, nullable=False)
    value = Column(Float, nullable=False)
    original_unit = Column(String, nullable=False)
    quality_flag = Column(String, nullable=True)
    is_missing = Column(Boolean, default=False)
    
    site = relationship("Site")
    dataset = relationship("SourceDataset")

class GroundTruthMeasurement(Base):
    __tablename__ = "ground_truth_measurements"
    
    id = Column(String, primary_key=True)
    site_id = Column(String, ForeignKey("sites.id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    target_variable = Column(String, nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    medium = Column(String, nullable=False)
    measurement_method = Column(String, nullable=True)
    quality_flag = Column(String, nullable=True)
    source = Column(String, nullable=False)
    
    site = relationship("Site")

class DatasetSnapshot(Base):
    __tablename__ = "dataset_snapshots"
    
    id = Column(String, primary_key=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    snapshot_metadata = Column(JSON, nullable=False)

class ModelVersion(Base):
    __tablename__ = "model_versions"
    
    id = Column(String, primary_key=True)
    version = Column(String, nullable=False)
    configuration = Column(JSON, nullable=False)
    artifact_path = Column(String, nullable=False)
    code_revision = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class Experiment(Base):
    __tablename__ = "experiments"
    
    id = Column(String, primary_key=True)
    model_version_id = Column(String, ForeignKey("model_versions.id"), nullable=False)
    dataset_snapshot_id = Column(String, ForeignKey("dataset_snapshots.id"), nullable=False)
    status = Column(String, nullable=False)
    metrics = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    model_version = relationship("ModelVersion")
    dataset_snapshot = relationship("DatasetSnapshot")

class Forecast(Base):
    __tablename__ = "forecasts"
    
    id = Column(String, primary_key=True)
    site_id = Column(String, ForeignKey("sites.id"), nullable=False)
    model_version_id = Column(String, ForeignKey("model_versions.id"), nullable=False)
    issue_time = Column(DateTime(timezone=True), nullable=False)
    target_time = Column(DateTime(timezone=True), nullable=False)
    target_variable = Column(String, nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    validation_status = Column(String, nullable=False)
    
    site = relationship("Site")
    model_version = relationship("ModelVersion")

class ThresholdPolicy(Base):
    __tablename__ = "threshold_policies"
    
    id = Column(String, primary_key=True)
    target_variable = Column(String, nullable=False)
    medium = Column(String, nullable=False)
    threshold_value = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    source = Column(String, nullable=False)
    description = Column(String, nullable=True)
