# Quantum Reservoir Computing QRC

A Python research repository with **deterministic threshold-rule evaluators**, command-line batch processing, and a FastAPI service. It also includes a standalone browser console for previewing those rules without a server.

**Scientific scope:** Despite its historical name, the current implementation does **not** simulate interacting quantum spins, perform quantum-state evolution, train a reservoir readout, calculate memory capacity, or demonstrate a quantum advantage. The enrichment modules are placeholder threshold checks, not implementations of their quantum-computing names. The alert thresholds are repository-defined examples; they are **not** NIST, ISO, clinical, or cryptographic conformance criteria.

## Browser interface

Open `web/index.html` in a modern browser for a local, unsigned evaluation, or serve the project using FastAPI to access the interface at `http://127.0.0.1:8000/`.

- **Local preview:** All evaluation logic runs in JavaScript in the browser. No backend, Pyodide, or external API is required. Inputs remain on the device, and outputs are explicitly unsigned.
- **Connected API:** Select the API mode only when the Python backend is running at the same origin. Requests are sent to `/api/audit`; the server returns a dossier and in-memory HMAC audit entry.
- **JSON export:** Save the displayed result from either execution mode.

The `web/` directory is also deployed by `.github/workflows/pages.yml` when GitHub Pages is enabled and configured to use GitHub Actions. A public live URL is not listed here until verified.

## Python setup

Requires Python 3.10+ (the package metadata accepts Python 3.9+, but the CI matrix currently checks 3.10–3.13).

```bash
git clone https://github.com/abusuraihsakhri/quantum-reservoir-computing-qrc.git
cd quantum-reservoir-computing-qrc
python -m venv .venv
source .venv/bin/activate
python -m pip install -e ".[server,dev]"
```

Windows: activate with `.venv\Scripts\activate`.

### CLI workflows

```bash
quantum-reservoir-computing-qrc audit --task-id TASK-001 --target KEY-01 --primary 28.5 --secondary 14.2 --status DISCORDANT
quantum-reservoir-computing-qrc batch -i sample.csv -o results.csv
quantum-reservoir-computing-qrc chat "What is the system status?"
quantum-reservoir-computing-qrc verify-audit
quantum-reservoir-computing-qrc serve --host 127.0.0.1 --port 8000
```

Equivalent local CLI: `python cli.py`. An older, independent rule evaluator remains accessible through `python -m quantum_reservoir.cli`; its thresholds and output schema differ from the main `agents/` pipeline.

**Main worker rules:** Primary metric greater than 25 generates an elevated alert. Secondary metric greater than 12 generates an elevated alert; a critical flag produces a critical alert. Status descriptors containing `DISCORDANT`, `ANOMALY`, `MUTANT`, `VIOLATION`, `FAIL`, or `REJECT` generate a conformance alert. Critical alerts take priority.

Input CSV columns are `task_id`, `target_identifier`, `primary_metric`, `secondary_metric`, `status_descriptor`, and `is_critical_flag`. Invalid and pattern-blocked rows are skipped with a warning; other valid rows are exported with summary fields. For the HTTP schema and interactive API docs, run the server and open `/docs`.

### API and Docker

```bash
python cli.py serve --host 127.0.0.1 --port 8000
# or
docker build -t qrc-evaluator .
docker run --rm -p 127.0.0.1:8000:8000 -e AUDIT_SECRET_KEY="your-random-secret" qrc-evaluator
```

The service provides `GET /health`, `GET /metrics`, `POST /api/audit`, `POST /api/chat`, and an optionally enabled `GET /api/audit/logs`. To read audit logs, set `AUDIT_READ_TOKEN` on the server and send `Authorization: Bearer <token>`. If the variable is unset the log endpoint is disabled. The mock chat responder does not run inference; model providers other than `mock` are not implemented.

## Privacy and security

Use only synthetic or nonsensitive identifiers. The server has basic pattern screening for certain identifiers, **not comprehensive de-identification or HIPAA compliance**. The API has no general authentication, and is intended for trusted local use rather than public exposure.

HMAC-SHA256 signs **in-memory** audit-chain entries when `AUDIT_SECRET_KEY` is configured. Without it, a randomly generated ephemeral key is used and an initialization warning is emitted. Integrity verification recalculates signatures and linked hashes, but it cannot detect deletion of the entire log, independently prove completeness, or recover events after restart. `verify-audit` checks only the log in the current process; running it as a separate command starts with an empty log.

The browser preview performs **no cryptographic signing**, stores no results remotely, and does not represent a validated quantum computation.

## Quality checks

```bash
python -m pytest -q
python -m compileall -q agents quantum_reservoir cli.py enrichment.py simulator.py
node --check web/app.mjs
node --test tests/web.test.mjs
python simulator.py 100
```

GitHub Actions runs Python tests on 3.10–3.13, browser evaluator tests on Node 22, and a Python dependency vulnerability audit.

## Repository structure

- `agents/` — main Pydantic schemas, three deterministic workers, supervisor, in-memory audit log, FastAPI application.
- `quantum_reservoir/` — independent legacy rule engine, CLI, and optional server.
- `enrichment.py` — named enrichment placeholders (threshold tests, not QRC dynamics).
- `cli.py` and `simulator.py` — main command line and synthetic traffic generator.
- `web/` — responsive standalone HTML/JavaScript evaluation console.
- `tests/` — Python and JavaScript regression tests.
- `Dockerfile` and `docker-compose.yml` — local container deployment.

## Browser compatibility

The static console uses modern standard JavaScript modules, Fetch, and Blob downloads. It is designed for current Chromium, Firefox, and Safari. JavaScript must be enabled; connected mode requires a reachable same-origin backend.

## License

MIT. See [LICENSE](LICENSE).
