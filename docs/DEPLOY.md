# نشر منصة تمكين على Hostinger VPS (بيئة واحدة)

## المتطلبات على السيرفر

- Ubuntu 22.04+ (Hostinger KVM VPS — 2 vCPU / 4 GB RAM موصى به)
- نطاق مربوط بـ A record → IP السيرفر
- صندوق بريد على نفس النطاق (Hostinger Email)

## 1. تثبيت الاعتماديات

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx postgresql postgresql-contrib certbot python3-certbot-nginx git

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 20
npm install -g pm2
```

## 2. PostgreSQL

```bash
sudo -u postgres psql <<EOF
CREATE DATABASE tmkeen;
CREATE USER tmkeen WITH ENCRYPTED PASSWORD 'STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE tmkeen TO tmkeen;
\c tmkeen
GRANT ALL ON SCHEMA public TO tmkeen;
EOF
```

## 3. استنساخ المشروع

```bash
sudo mkdir -p /var/www/tmkeen
sudo chown $USER:$USER /var/www/tmkeen
git clone https://github.com/YOUR_ORG/tmkeen.git /var/www/tmkeen
cd /var/www/tmkeen
cp .env.example .env
# عدّل .env: DATABASE_URL, SESSION_SECRET, SMTP_*, UPLOAD_DIR=/var/www/tmkeen/uploads
mkdir -p uploads
npm ci
npx prisma migrate deploy
npm run db:seed
npm run build
pm2 start npm --name tmkeen -- start
pm2 save
pm2 startup
```

## 4. Nginx

```nginx
# /etc/nginx/sites-available/tmkeen
server {
    listen 80;
    server_name tmkeen.example.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/tmkeen /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d tmkeen.example.com
```

## 5. SMTP (Hostinger)

في `.env`:

```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=mailbox-password
```

## 6. النسخ الاحتياطي (cron)

```bash
crontab -e
# يومياً 2:00 ص
0 2 * * * pg_dump -U tmkeen tmkeen | gzip > /var/backups/tmkeen-$(date +\%F).sql.gz
0 2 * * * tar -czf /var/backups/tmkeen-uploads-$(date +\%F).tar.gz /var/www/tmkeen/uploads
```

## 7. GitHub Actions (اختياري)

أضف secrets في GitHub: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` — workflow `deploy.yml` ينشر تلقائياً عند push لـ `main`.

## التطوير المحلي

```bash
docker compose up -d
cp .env.example .env
npm ci
npx prisma migrate dev
npm run db:seed
npm run dev
```
