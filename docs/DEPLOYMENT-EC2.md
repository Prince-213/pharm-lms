# Pharm LMS — EC2 Deployment Guide

**Audience:** Developer deploying Pharm LMS on AWS EC2  
**Strategy:** Clone from your personal repo; push updates to **both** your repo and the company repo  
**Last updated:** March 2026

---

## Overview

| Piece | Choice |
|-------|--------|
| **Server** | AWS EC2 t3.micro (Amazon Linux 2023) |
| **Clone source (EC2)** | `https://github.com/Prince-213/pharm-lms.git` |
| **Push targets (your laptop)** | `origin` (personal) + `company` (PharmAnalytics) |
| **Database** | Neon PostgreSQL (`DATABASE_URL`) |
| **File storage** | Cloudflare R2 |
| **Process manager** | PM2 |
| **Web proxy** | Nginx (ports 80 / 443) |

EC2 does **not** auto-deploy when you push to GitHub. After each push, SSH to the server and run **`~/deploy-pharm-lms.sh`**.

---

## Part 1 — Git setup on your laptop (dual push)

Your machine already has two remotes:

| Remote | Repository |
|--------|------------|
| `origin` | `https://github.com/Prince-213/pharm-lms.git` |
| `company` | `https://github.com/PharmAnalytics/PharmAnalytics-LMS-.git` |

### Push to both repos after every release

```bash
git add .
git commit -m "your message"
git push origin main
git push company main
```

### Optional: one command alias

```bash
git config alias.pushall "!git push origin main && git push company main"
```

Then: `git pushall`

**Rule:** Keep both repos on the same `main` commit so the company always has your latest code, even though the server clones from **your** repo.

---

## Part 2 — Create the EC2 instance

1. AWS Console → **EC2** → **Launch instance**
2. **Name:** `pharm-lms`
3. **AMI:** Amazon Linux 2023
4. **Instance type:** `t3.micro` (free tier)
5. **Key pair:** Create or use existing (or use EC2 Instance Connect without PEM)
6. **Network settings — check both:**
   - Allow **HTTP** traffic from the internet (port 80)
   - Allow **HTTPS** traffic from the internet (port 443)
7. **Storage:** 20–30 GB
8. **Launch instance**

### Elastic IP (recommended)

1. EC2 → **Elastic IPs** → **Allocate**
2. **Associate** with your `pharm-lms` instance
3. Note the IP as **YOUR_IP** (e.g. `3.15.xxx.xxx`)

### Budget alert

AWS Billing → Budgets → alert at **$10** and **$25** (protect your $100 credit).

---

## Part 3 — Connect to the server

### Option A — EC2 Instance Connect (no PEM)

1. EC2 → Instances → select instance → **Connect**
2. Tab: **EC2 Instance Connect**
3. User: **`ec2-user`**
4. **Connect**

### Option B — SSH with key

```powershell
ssh -i "path\to\your-key.pem" ec2-user@YOUR_IP
```

---

## Part 4 — First-time server setup

Run all commands on the EC2 instance.

### 4.1 System packages

```bash
sudo dnf update -y
sudo dnf install -y git nginx
```

### 4.2 Node.js 22 + pnpm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
nvm alias default 22

corepack enable
corepack prepare pnpm@9.15.9 --activate

node -v
pnpm -v
```

### 4.3 Swap (required on 1 GB RAM for `pnpm build`)

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h
```

### 4.4 PM2

```bash
pnpm add -g pm2
```

---

## Part 5 — Clone your personal repo on EC2

Clone from **Prince-213/pharm-lms** (not the company repo — avoids org token issues).

### If the repo is public

```bash
cd ~
git clone https://github.com/Prince-213/pharm-lms.git pharm-lms
cd pharm-lms
```

### If the repo is private

**Option A — Personal Access Token (HTTPS)**

1. GitHub → Settings → Developer settings → Personal access tokens
2. Create token with **Contents: Read** on `Prince-213/pharm-lms`
3. Clone:

```bash
git clone https://github.com/Prince-213/pharm-lms.git pharm-lms
```

- Username: `Prince-213`
- Password: paste the **token** (not your GitHub password)

**Option B — Deploy key (SSH)**

```bash
ssh-keygen -t ed25519 -C "pharm-lms-ec2" -f ~/.ssh/pharm_lms_deploy -N ""
cat ~/.ssh/pharm_lms_deploy.pub
```

Add the public key in **your** repo: Settings → Deploy keys → Add deploy key.

```bash
nano ~/.ssh/config
```

```
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/pharm_lms_deploy
  IdentitiesOnly yes
```

```bash
chmod 600 ~/.ssh/config ~/.ssh/pharm_lms_deploy
git clone git@github.com:Prince-213/pharm-lms.git pharm-lms
cd pharm-lms
```

---

## Part 6 — Production environment file

```bash
cd ~/pharm-lms
nano .env
```

Paste production values. **Minimum required:**

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
AUTH_SECRET=long-random-secret-here
AUTH_TRUST_HOST=true

AUTH_URL=http://YOUR_IP
NEXTAUTH_URL=http://YOUR_IP
NEXT_PUBLIC_SITE_URL=http://YOUR_IP

R2_ENDPOINT=https://....r2.cloudflarestorage.com
R2_REGION=auto
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=pharm-lms-files
R2_CORS_ORIGINS=http://YOUR_IP,http://localhost:3000

RESEND_API_KEY=...
EMAIL_FROM=Pharm LMS <noreply@yourdomain.com>
PAYSTACK_SECRET_KEY=...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...

PG_POOL_MAX=5
```

Save: `Ctrl+O`, Enter, `Ctrl+X`.

**Never commit `.env` to GitHub.**

When you add a domain and HTTPS, change the three URL variables to `https://yourdomain.com` and run `pm2 restart pharm-lms`.

---

## Part 7 — First deploy (build and start)

```bash
cd ~/pharm-lms
pnpm install --frozen-lockfile
pnpm db:migrate:deploy
pnpm build

pm2 start "pnpm exec next start" --name pharm-lms
pm2 save
pm2 startup
```

Run the `sudo env PATH=...` command that `pm2 startup` prints, then:

```bash
pm2 save
```

Verify:

```bash
curl -I http://127.0.0.1:3000
pm2 logs pharm-lms --lines 30
```

---

## Part 8 — Nginx (public HTTP)

```bash
sudo nano /etc/nginx/conf.d/pharm-lms.conf
```

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx
```

Open in browser: **http://YOUR_IP**

---

## Part 9 — Install the deploy script (one-time)

The repo includes `scripts/deploy-pharm-lms.sh`. Copy it to your home directory:

```bash
cp ~/pharm-lms/scripts/deploy-pharm-lms.sh ~/deploy-pharm-lms.sh
chmod +x ~/deploy-pharm-lms.sh
```

---

## Part 10 — Update the live site (every release)

### On your laptop

1. Make code changes
2. Commit and push to **both** remotes:

```bash
git add .
git commit -m "describe your change"
git push origin main
git push company main
```

### On EC2

1. Connect (Instance Connect or SSH)
2. Run:

```bash
~/deploy-pharm-lms.sh
```

That script will:

1. `git pull origin main` from `~/pharm-lms`
2. `pnpm install --frozen-lockfile`
3. `pnpm db:migrate:deploy`
4. `pnpm build`
5. `pm2 restart pharm-lms`

### Verify

```bash
pm2 status
pm2 logs pharm-lms --lines 50
```

Refresh the site in your browser.

### When you only changed `.env`

```bash
nano ~/pharm-lms/.env
pm2 restart pharm-lms
```

No need to pull or build.

---

## Part 11 — HTTPS and custom domain (optional)

1. Point DNS **A record** → YOUR_IP
2. On server:

```bash
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d app.yourdomain.com
```

3. Update `.env`:

```env
AUTH_URL=https://app.yourdomain.com
NEXTAUTH_URL=https://app.yourdomain.com
NEXT_PUBLIC_SITE_URL=https://app.yourdomain.com
R2_CORS_ORIGINS=https://app.yourdomain.com,http://localhost:3000
```

4. `pm2 restart pharm-lms`

---

## Part 12 — External services to update

Replace `YOUR_URL` with your IP or domain.

| Service | What to configure |
|---------|-------------------|
| **Google OAuth** | Authorized origin: `YOUR_URL` |
| | Redirect: `YOUR_URL/api/auth/callback/google` |
| **R2 CORS** | Allow `GET`, `PUT`, `HEAD` from `YOUR_URL` |
| **Paystack** | Webhook: `YOUR_URL/api/paystack/webhook` |
| **Resend** | Verified domain for `EMAIL_FROM` |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `pnpm build` killed | Ensure 2 GB swap is enabled (Part 4.3) |
| 502 Bad Gateway | `pm2 logs pharm-lms`; check app on port 3000 |
| Auth broken | `AUTH_URL` must match what users open in the browser |
| DB errors | Check `DATABASE_URL`; run `pnpm db:migrate:deploy` |
| Upload fails | Add site URL to R2 CORS |
| `git pull` fails | Check deploy key / PAT on **your** repo |

---

## Quick reference

| Task | Command |
|------|---------|
| Push code (laptop) | `git push origin main && git push company main` |
| Deploy (server) | `~/deploy-pharm-lms.sh` |
| View logs | `pm2 logs pharm-lms` |
| App status | `pm2 status` |
| Restart only | `pm2 restart pharm-lms` |
| Reconnect | EC2 → Connect → Instance Connect |

---

## Architecture

```
[Laptop]  git push → GitHub (Prince-213/pharm-lms)
                 → GitHub (PharmAnalytics/PharmAnalytics-LMS-)

[EC2]     git pull ← Prince-213/pharm-lms only
          nginx :80/443 → Next.js :3000 (PM2)
                ↓
          Neon (DATABASE_URL)
          Cloudflare R2 (files)
          Paystack / Resend / Google OAuth
```

---

*Pharm LMS — EC2 deployment guide*
