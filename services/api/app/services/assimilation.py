import logging
import uuid
from datetime import datetime
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from ..db.models import GroundTruthMeasurement, Site

logger = logging.getLogger(__name__)

class DatumPolicy:
    """
    Centralized policy for handling vertical datums.
    For the Khulna delta, gauge data is often recorded in PWD (Public Works Datum).
    SWOT KaRIn data is natively referenced to the EGM2008 geoid or WGS84 ellipsoid.
    This mapping must be strictly applied before assimilation.
    """
    # Empirical offset to be verified by field survey; 
    # Example placeholder based on regional delta conventions.
    PWD_TO_WGS84_OFFSET_M = 0.46  

    @staticmethod
    def pwd_to_wgs84(pwd_elevation: float) -> float:
        return pwd_elevation + DatumPolicy.PWD_TO_WGS84_OFFSET_M

class GaugeSiteMapper:
    """
    Maps point gauge observations to the nearest spatial Site.
    """
    def __init__(self, db: Session):
        self.db = db

    def map_gauge_to_site(self, gauge_lat: float, gauge_lon: float) -> Optional[str]:
        """
        Stub: In a real system with PostGIS enabled, this would execute a 
        ST_Distance or ST_DWithin query between the gauge geometry point 
        and the SWOT site linestrings.
        """
        # MVP Placeholder: Attach to the primary active site for demo
        site = self.db.query(Site).first()
        return site.id if site else None

def assimilate_observations(db: Session, gauge_records: List[Dict[str, float]], source_dataset_id: str):
    """
    Ingests raw gauge observations, corrects the vertical datum, maps them to a spatial site, 
    and inserts them as GroundTruthMeasurement.
    """
    mapper = GaugeSiteMapper(db)
    assimilated_count = 0

    for record in gauge_records:
        site_id = mapper.map_gauge_to_site(record.get('lat', 0.0), record.get('lon', 0.0))
        if not site_id:
            continue

        raw_wse = record.get('water_elevation_pwd')
        corrected_wse = DatumPolicy.pwd_to_wgs84(raw_wse) if raw_wse is not None else None
        
        timestamp = record.get('timestamp', datetime.utcnow())

        if corrected_wse is not None:
            wse_obs = GroundTruthMeasurement(
                id=str(uuid.uuid4()),
                site_id=site_id,
                timestamp=timestamp,
                target_variable="water_elevation",
                value=corrected_wse,
                unit="m",
                medium="water",
                measurement_method="Gauge_PWD_to_WGS84",
                quality_flag="1",
                source=f"Assimilated:{source_dataset_id}"
            )
            db.add(wse_obs)
            assimilated_count += 1
            
        if record.get('salinity_ppt') is not None:
            sal_obs = GroundTruthMeasurement(
                id=str(uuid.uuid4()),
                site_id=site_id,
                timestamp=timestamp,
                target_variable="salinity",
                value=record.get('salinity_ppt'),
                unit="ppt",
                medium="water",
                measurement_method="Gauge",
                quality_flag="1",
                source=f"Assimilated:{source_dataset_id}"
            )
            db.add(sal_obs)
            assimilated_count += 1

    db.commit()
    logger.info(f"Assimilated {assimilated_count} gauge measurements into ground truth states.")

