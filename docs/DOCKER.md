# Docker local demonstration

This runs the verified sample/import dashboard, Temporal dev service and worker in separate containers. Live measurement is deliberately excluded. The original laptop demo on ports 3000/8233 can keep running.

From the repository, with Docker Desktop's Linux engine running:

```powershell
docker compose --env-file .env.local up --build -d --wait
```

Open the dashboard at **http://127.0.0.1:3002** and Temporal UI at **http://127.0.0.1:8234**. Click **Run diagnosis**. A successful model report names its real model; a completed Temporal result includes its actual workflow ID.

`.env.local` stays private and unchanged. Compose reads its values into container runtime environment variables; the file and credentials are excluded from the image/build context. Do not publish `docker compose config` output or container environment dumps. Use `docker compose config --quiet` for configuration validation.

Without model credentials, `docker compose up --build -d --wait` runs a visibly labelled rule-based result. Never describe this as AI success.

With the existing local Node dependencies installed, verify the Docker endpoint:

```powershell
node --import tsx scripts/verify-demo.mjs --docker --require-ai --require-temporal
```

This sends only the synthetic fixture, checks malformed input and unchanged scoring, and fails unless real model/Temporal success is returned.

```powershell
docker compose ps
docker compose logs --tail 30 worker
docker compose exec temporal temporal workflow list
docker compose down
```

`down` stops only this Compose project. App and worker run as the image's non-root `node` user. The image build runs test, typecheck and production build before packaging the runtime.

This is a loopback-only development/demo host, not an internet production deployment. Temporal dev history is in memory and disappears when its container restarts. Existing dependency advisories remain tracked; no major upgrade or application feature change is included.
