import logging
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from ..db.models import Alert

logger = logging.getLogger(__name__)

def acknowledge_alert(db: Session, alert_id: int, user: str, note: str) -> bool:
    """
    Safely acknowledges an alert, appending an audit trail of who dismissed it and why.
    """
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        return False
        
    if alert.acknowledged_at:
        logger.warning(f"Alert {alert_id} already acknowledged by {alert.acknowledged_by}.")
        return False
        
    alert.acknowledged_by = user
    alert.acknowledged_at = datetime.utcnow()
    alert.is_active = False
    
    audit_entry = {
        "action": "acknowledge",
        "timestamp": datetime.utcnow().isoformat(),
        "user": user,
        "note": note
    }
    
    if alert.audit_log is None:
        alert.audit_log = [audit_entry]
    else:
        # In SQLAlchemy JSONB mutations, we must reassign or use flag_modified
        log = list(alert.audit_log)
        log.append(audit_entry)
        alert.audit_log = log
        
    db.commit()
    logger.info(f"Alert {alert_id} acknowledged by {user}.")
    return True

def expire_stale_alerts(db: Session):
    """
    Background job to automatically close alerts that have passed their expires_at date.
    """
    now = datetime.utcnow()
    stale_alerts = db.query(Alert).filter(Alert.is_active == True, Alert.expires_at <= now).all()
    
    for alert in stale_alerts:
        alert.is_active = False
        audit_entry = {
            "action": "auto_expire",
            "timestamp": now.isoformat(),
            "note": "Alert automatically expired based on TTL."
        }
        if alert.audit_log is None:
            alert.audit_log = [audit_entry]
        else:
            log = list(alert.audit_log)
            log.append(audit_entry)
            alert.audit_log = log
            
    db.commit()
    logger.info(f"Auto-expired {len(stale_alerts)} stale alerts.")
