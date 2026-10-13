"""
FastAPI REST API Server for Quantum Reservoir Computing Qrc.
"""
from pathlib import Path
import hmac
import os
from typing import Optional
from fastapi import FastAPI, HTTPException, Header
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from .base import AuditLogger, SecurityException
from .models import SystemTaskPayload, ConsensusDossier
from .supervisor import SystemSupervisor

supervisor = SystemSupervisor(model_provider="mock")

app = FastAPI(
    title="Quantum Reservoir Computing Qrc API",
    description="Three-worker, deterministic threshold-rule evaluation API",
    version="3.0.0-ENTERPRISE",
)


class ChatRequest(BaseModel):
    query: str


@app.get("/health")
def health():
    return {"status": "HEALTHY", "service": "quantum-reservoir-computing-qrc", "domain": "Threshold-rule evaluation", "standard": "Repository-defined rules; not a formal compliance test", "version": "3.0.0-ENTERPRISE"}


@app.get("/metrics")
def metrics():
    return {
        "dossiers_processed_total": len(supervisor.dossier_registry),
        "audit_blocks_total": len(AuditLogger.get_trail()),
        "system_status": "NOMINAL_OPTIMAL"
    }


@app.post("/api/audit")
def api_audit(payload: SystemTaskPayload):
    try:
        dossier = supervisor.process_task(payload)
    except SecurityException:
        raise HTTPException(status_code=400, detail="Input contains a blocked sensitive identifier") from None
    return dossier.to_dict()


@app.post("/api/chat")
def api_chat(req: ChatRequest):
    try:
        ans = supervisor.query_supervisory_chat(req.query)
        return {"response": ans}
    except SecurityException:
        raise HTTPException(status_code=400, detail="Input contains a blocked sensitive identifier") from None


@app.get("/api/audit/logs")
def api_audit_logs(authorization: Optional[str] = Header(default=None)):
    token = os.getenv("AUDIT_READ_TOKEN")
    if not token:
        raise HTTPException(status_code=503, detail="Audit-log reading is disabled")
    supplied = authorization or ""
    if not hmac.compare_digest(supplied, "Bearer " + token):
        raise HTTPException(status_code=403, detail="Not authorized to read audit logs")
    return {"audit_trail": AuditLogger.get_trail(), "verified": AuditLogger.verify_integrity()}


_web_dir = Path(__file__).resolve().parent.parent / "web"
if _web_dir.is_dir():
    app.mount("/", StaticFiles(directory=str(_web_dir), html=True), name="web")
