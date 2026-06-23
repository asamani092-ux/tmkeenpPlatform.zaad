# التشغيل المحلي على Windows (بدون Docker)

المنصة تحتاج **PostgreSQL**. إذا ظهرت رسالة `docker is not recognized` فـ Docker غير مثبت — استخدم أحد الخيارات التالية.

## الخيار 1 — Prisma Dev (الأسهل، بدون تثبيت)

```powershell
cd C:\Users\asama\Projects\tmkeen
Copy-Item .env.example .env
npx prisma dev --detach --name tmkeen
```

انسخ `DATABASE_URL` الذي يظهر في المخرجات (أو شغّل `npx prisma dev ls`) إلى ملف `.env`، ثم:

```powershell
npm ci
npx prisma migrate deploy
npm run db:seed
npm run dev
```

لإيقاف قاعدة البيانات لاحقاً:

```powershell
npx prisma dev stop --name tmkeen
```

## الخيار 2 — PostgreSQL مثبت على Windows

1. ثبّت [PostgreSQL 16](https://www.postgresql.org/download/windows/) أو عبر winget:
   ```powershell
   winget install PostgreSQL.PostgreSQL.16
   ```
2. أثناء التثبيت: اختر كلمة مرور للمستخدم `postgres` واحفظها.
3. أنشئ قاعدة البيانات (من **SQL Shell (psql)** أو pgAdmin):

```sql
CREATE USER tmkeen WITH PASSWORD 'tmkeen_dev';
CREATE DATABASE tmkeen OWNER tmkeen;
GRANT ALL PRIVILEGES ON DATABASE tmkeen TO tmkeen;
```

4. في `.env`:

```
DATABASE_URL="postgresql://tmkeen:tmkeen_dev@localhost:5432/tmkeen?schema=public"
SESSION_SECRET="any-long-random-string"
```

5. ثم:

```powershell
npm ci
npx prisma migrate deploy
npm run db:seed
npm run dev
```

## الخيار 3 — Docker Desktop (اختياري)

1. ثبّت [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. أعد تشغيل PowerShell
3. `docker compose up -d`
4. تابع خطوات README العادية

## استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| `docker is not recognized` | استخدم الخيار 1 أو 2 أعلاه |
| `DATABASE_URL is not set` | أنشئ `.env` من `.env.example` |
| `ECONNREFUSED localhost:5432` | PostgreSQL غير شغّال — شغّل `prisma dev` أو خدمة PostgreSQL |
| خطأ `.next` / lucide | احذف `.next` ثم `npm run dev` |
