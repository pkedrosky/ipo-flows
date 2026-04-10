# Deploy Runbook

## Scope

Deploy latest `main` to production and publish static app assets behind Ghost paid-member gating.
No live data fetching — no systemd service needed.

## Server

- Host access: `ssh pk`
- Repo path: `/srv/repos/ipo-flows`
- Build output: `/srv/repos/ipo-flows/dist`
- Nginx include dir: `/etc/nginx/sites-available/paulkedrosky.com.d`

## First-Time Setup

Clone the repo on the server:

```bash
ssh pk
cd /srv/repos
git clone https://github.com/pkedrosky/ipo-flows.git
cd ipo-flows
npm ci
npm run build
```

## App Build (subsequent deploys)

```bash
ssh pk
cd /srv/repos/ipo-flows
git pull --ff-only origin main
npm ci
npm run build
```

## Ghost Theme

Install template:

```bash
cp /srv/repos/ipo-flows/ops/ghost/ipo-flows.hbs /srv/www/paulkedrosky.com/content/themes/brief-pk/ipo-flows.hbs
```

Add route entry from `ops/ghost/routes-snippet.yaml` to:

```text
/srv/www/paulkedrosky.com/content/settings/routes.yaml
```

You also need a Ghost page with the slug `ipo-flows` for `data: page.ipo-flows` to resolve.

## Nginx

Install paywall-gated location block:

```bash
sudo cp /srv/repos/ipo-flows/ops/nginx/44-tools-ipo-flows.conf /etc/nginx/sites-available/paulkedrosky.com.d/44-tools-ipo-flows.conf
sudo nginx -t
sudo systemctl reload nginx
```

Ensure `/_ghost_paid_proxy` is already configured (same as gas-sim/token-sim).

## Verification

Anonymous checks:

```bash
curl -I https://paulkedrosky.com/tools/ipo-flows/
curl -I https://paulkedrosky.com/tools/ipo-flows/app/
```

Expected:

- `/tools/ipo-flows/` returns `200`
- `/tools/ipo-flows/app/` returns `302` to signup when not authenticated

Member check:

- Logged-in paid member can load `/tools/ipo-flows/` and sees the iframe app.
