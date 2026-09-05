# Quantum Reservoir Computing QRC

> **Domain:** Post-Quantum Cryptography & Zero-Knowledge Architecture
> **Reference Guidelines & Standards:** `NIST FIPS 203/204/205, NIST SP 800-90B & ISO/IEC Standards`

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12-3776AB.svg?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688.svg?logo=fastapi&logoColor=white)
![Audit Trail](https://img.shields.io/badge/Audit-HMAC--SHA256_Tamper--Evident-brightgreen.svg)
![Zero-PHI Guard](https://img.shields.io/badge/Guard-Zero--PHI_Outbound-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker&logoColor=white)

</div>

---

## 📖 What It Does

Quantum Reservoir Computing QRC is an enterprise-grade analytical platform that combines quantum reservoir computing concepts with multi-agent consensus evaluation. It processes task payloads through specialized worker agents to produce cryptographically signed consensus dossiers with tamper-evident audit trails.

---

## ⚙️ Key Capabilities & Algorithmic Modules

- **Multi-Agent Consensus Engine**: Three specialized workers (InvariantQC, SafetyEscalation, ProtocolConformance) evaluate tasks independently
- **Deterministic Calculation Engine**: Strict compliance with standard reference formulations and thresholds
- **Risk & Urgency Classification**: Multi-tier categorization (ROUTINE, ELEVATED_RISK, CRITICAL_STAT_PANIC) with automated action recommendations
- **Validation & Guardrails**: Rigorous input bounds checking, NaN/Inf detection, and anomaly detection
- **Zero-PHI Outbound Interceptor**: Active regex inspection blocking SSNs, MRNs, phone numbers, and patient identifiers
- **HMAC-SHA256 Audit Trail**: Chained, cryptographically signed logs for every evaluation

---

## 💻 Installation

```bash
# Clone the repository
git clone https://github.com/abusuraihsakhri/quantum-reservoir-computing-qrc.git
cd quantum-reservoir-computing-qrc

# Install dependencies
pip install fastapi uvicorn pydantic pytest
```

---

## 💻 CLI Quickstart & Usage

### 1. Single Task Evaluation
```bash
python cli.py audit --task-id TASK-001 --target KEY-01 --primary 28.5 --secondary 14.2 --critical --status DISCORDANT
```

### 2. System Configuration Query
```bash
python cli.py chat "What is the system status?"
```

### 3. Batch Processing
```bash
python cli.py batch -i sample.csv -o results.csv
```

### 4. Verify Audit Trail Integrity
```bash
python cli.py verify-audit
```

### 5. Launch REST API Server
```bash
python cli.py serve --host 127.0.0.1 --port 8000
```

### Parameter Reference
- `--task-id`: Unique task identifier (required)
- `--target`: Target entity identifier (required)
- `--primary`: Primary metric value (float, required)
- `--secondary`: Secondary metric value (float, default: 0.0)
- `--critical`: Flag for critical/emergency status
- `--status`: Status descriptor (NOMINAL, DISCORDANT, ANOMALY, etc.)

### Input Data Schema

| Field | Description | Requirement |
|:------|:------------|:------------|
| `task_id` | Unique task identifier | Required |
| `target_identifier` | Target entity identifier | Required |
| `primary_metric` | Primary measurement value | Required |
| `secondary_metric` | Secondary measurement value | Optional |
| `is_critical_flag` | Emergency escalation flag | Optional |
| `status_descriptor` | Status code descriptor | Optional |

---

## 🛡️ Security & Enterprise Architecture

* **Zero-PHI Outbound Interceptor:** Active regex inspection blocking SSNs, MRNs, phone numbers, and patient identifiers
* **Tamper-Evident HMAC-SHA256 Audit Trail:** Chained, cryptographically signed logs for every evaluation and state transition
* **Input Validation:** Finite metric validation (NaN/Inf rejection), non-empty identifier enforcement
* **Secure Key Management:** Audit signing key sourced from `AUDIT_SECRET_KEY` environment variable with secure fallback

### Environment Variables
- `AUDIT_SECRET_KEY`: Secret key for HMAC-SHA256 audit signing (generate with `python -c "import secrets; print(secrets.token_hex(32))"`)
- `MODEL_PROVIDER`: LLM provider selection (mock, ollama, claude, openai)

---

## 🧪 Testing & Verification

Run the automated test suite:

```bash
pytest -v
```

Execute high-throughput batch simulation benchmarks:

```bash
python simulator.py 1000
```

---

## 🐳 Container Deployment

```bash
# Build and run with Docker
docker build -t quantum-reservoir-computing-qrc .
docker run -p 8000:8000 -e AUDIT_SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))") quantum-reservoir-computing-qrc

# Or use docker-compose
AUDIT_SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))") docker-compose up
```

---

## 📁 Project Structure

```
quantum-reservoir-computing-qrc/
├── agents/                  # Core multi-agent system
│   ├── api.py              # FastAPI REST endpoints
│   ├── base.py             # Security, PHI guard, audit trail
│   ├── models.py           # Pydantic data models
│   ├── supervisor.py       # Master orchestrator
│   ├── workers.py          # Specialized worker agents
│   ├── llm_factory.py      # LLM provider factory
│   ├── learning.py         # Bayesian calibration engine
│   ├── metrics.py          # Prometheus metrics collector
│   └── streamer.py         # WebSocket telemetry broadcaster
├── quantum_reservoir/       # Quantum reservoir computing module
│   ├── agents.py           # QRC coordinator and sub-agents
│   ├── engine.py           # Core algorithmic engine
│   ├── models.py           # QRC data models
│   ├── server.py           # QRC FastAPI server
│   └── cli.py              # QRC CLI interface
├── tests/                   # Test suite
├── web/                     # Web operations console
├── cli.py                   # Main CLI entry point
├── simulator.py             # High-throughput simulation
├── enrichment.py            # Enrichment feature modules
├── pyproject.toml           # Project configuration
├── Dockerfile               # Container build
└── docker-compose.yml       # Container orchestration
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
