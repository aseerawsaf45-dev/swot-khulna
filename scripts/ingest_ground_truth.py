import os
import sys
import uuid
import pandas as pd
from datetime import datetime

# Add root directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.api.app.db.session import SessionLocal
from services.api.app.db.models import GroundTruthMeasurement, Site

def ingest_ground_truth():
    db = SessionLocal()
    csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "ground_truth_upload_ready.csv")
    if not os.path.exists(csv_path):
        print(f"File not found: {csv_path}")
        return

    df = pd.read_csv(csv_path)
    df['timestamp'] = pd.to_datetime(df['timestamp'], utc=True)
    
    inserted = 0
    skipped = 0

    print(f"Ingesting {len(df)} ground truth records into database...")
    for _, row in df.iterrows():
        # Check idempotency
        exists = db.query(GroundTruthMeasurement).filter(
            GroundTruthMeasurement.site_id == row['site_id'],
            GroundTruthMeasurement.timestamp == row['timestamp'],
            GroundTruthMeasurement.target_variable == row['target_variable']
        ).first()

        if exists:
            skipped += 1
            continue

        measurement = GroundTruthMeasurement(
            id=str(uuid.uuid4()),
            site_id=row['site_id'],
            timestamp=row['timestamp'],
            target_variable=row['target_variable'],
            value=float(row['value']),
            unit=row['unit'],
            medium=row['medium'],
            measurement_method=row.get('measurement_method'),
            quality_flag=str(row.get('quality_flag', '1')),
            source=row['source']
        )
        db.add(measurement)
        inserted += 1

    db.commit()
    db.close()
    print(f"Ingestion complete: {inserted} inserted, {skipped} skipped.")

if __name__ == "__main__":
    ingest_ground_truth()
