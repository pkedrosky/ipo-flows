# Deploy Runbook

Deploy latest `main` to production and publish static app assets behind Ghost paid-member gating.

No live data jobs, worker processes, or `systemd` timer/services are required for this repo.

## Server + Paths

- Host: `ssh pk`
- Repo checkout: `/srv/repos/ipo-flows`
- Build output: `/srv/repos/ipo-flows/dist`
- Ghost theme path: `/srv/www/paulkedrosky.com/content/themes/brief-pk/`
- Ghost routes file: `/srv/www/paulkedrosky.com/content/settings/routes.yaml`
- nginx include dir: `/etc/nginx/sites-available/paulkedrosky.com.d`

## Route Contract

- Shell page: `/tools/ipo-flows/`
- Frontend app: `/tools/ipo-flows/app/`
- Data endpoint namespace: `/tools/ipo-flows/data/` (reserved; not used currently)

## One-Time Setup

### 1) Server checkout

```bash
ssh pk
cd /srv/repos
git clone https://github.com/pkedrosky/ipo-flows.git
cd ipo-flows
npm ci
npm run build
```

### 2) Ghost template + route

```bash
cp /srv/repos/ipo-flows/ops/ghost/ipo-flows.hbs \
  /srv/www/paulkedrosky.com/content/themes/brief-pk/ipo-flows.hbs
```

Add snippet from [`ops/ghost/routes-snippet.yaml`](/Users/pk/dev/ipo-flows/ops/ghost/routes-snippet.yaml) under `routes:` in:

```text
/srv/www/paulkedrosky.com/content/settings/routes.yaml
```

Ensure a Ghost page exists with slug `ipo-flows` (for `data: page.ipo-flows`).

### 3) nginx include

```bash
sudo cp /srv/repos/ipo-flows/ops/nginx/44-tools-ipo-flows.conf \
  /etc/nginx/sites-available/paulkedrosky.com.d/44-tools-ipo-flows.conf
sudo nginx -t
sudo systemctl reload nginx
```

`/_ghost_paid_proxy` must already be configured (same pattern as other sims).

## Standard Deploy (each release)

### 1) Local gate checks

Run locally and stop if any fail:

```bash
npm ci
npm run build
```

### 2) Publish `main`

```bash
git add -A
git commit -m "<message>"
git push origin main
```

### 3) Update server checkout + rebuild

```bash
ssh pk
cd /srv/repos/ipo-flows
git pull --ff-only origin main
npm ci
npm run build
```

### 4) Verify routes

Anonymous:

```bash
curl -I https://paulkedrosky.com/tools/ipo-flows/
curl -I https://paulkedrosky.com/tools/ipo-flows/app/
curl -I https://paulkedrosky.com/tools/ipo-flows/data/
```

Expected:

- `/tools/ipo-flows/` -> `200`
- `/tools/ipo-flows/app/` -> `302` to signup when anonymous
- `/tools/ipo-flows/data/` -> expected `404` until data endpoints are introduced

Member check:

- Logged-in paid member can load `/tools/ipo-flows/` and see the iframe app render.

## Rollback

On server:

```bash
ssh pk
cd /srv/repos/ipo-flows
git log --oneline -n 10
# choose previous known-good commit
git checkout <good_sha>
npm ci
npm run build
```

Then return to `main` once fixed:

```bash
git checkout main
git pull --ff-only origin main
npm ci
npm run build
```
