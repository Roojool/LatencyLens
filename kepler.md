# Kepler Operations — W1 Roojool

Kepler is our separate AI SRE/development IDE, NOT an embedded LatencyLens JavaScript SDK.
Read `docs/KEPLER-OPERATIONS.md` and `prompts/05-kepler-operations.md`.

Scope: inspect Next server, Temporal local dev service/Worker and errors; aid evidence-based incident recovery after human approval.

Basic commands (read-only unless explicitly approved):
```powershell
git status --short
Get-Command node,npm,gh,temporal -ErrorAction SilentlyContinue
Test-NetConnection 127.0.0.1 -Port 3000 -InformationLevel Quiet
Test-NetConnection 127.0.0.1 -Port 7233 -InformationLevel Quiet
Test-NetConnection 127.0.0.1 -Port 8233 -InformationLevel Quiet
```
Never reveal `.env.local`, keys, personal IPs. Never kill unrelated processes or modify router/firewall/OS network settings. Only demo the controlled Worker outage after a healthy run and with operator approval.
