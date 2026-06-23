# منصة تمكين — TMKEEN

منصة رقمية لتمكين المستفيدين: تسجيل → إرشاد → تدريب → توظيف → متابعة.

## المتطلبات

- Node.js 20+
- PostgreSQL 16 — أحد الخيارات:
  - **Windows بدون Docker:** `npx prisma dev --detach --name tmkeen` (راجع [docs/LOCAL-WINDOWS.md](docs/LOCAL-WINDOWS.md))
  - Docker: `docker compose up -d`
  - PostgreSQL مثبت محلياً

## التشغيل المحلي

### Windows (بدون Docker)

```powershell
Copy-Item .env.example .env
npx prisma dev --detach --name tmkeen
# ضع DATABASE_URL من: npx prisma dev ls
npx prisma migrate deploy
npm run db:seed
npm run dev
```

راجع [docs/LOCAL-WINDOWS.md](docs/LOCAL-WINDOWS.md) للتفاصيل.

### Docker / Linux / macOS

```bash
cp .env.example .env
docker compose up -d
npm ci
npx prisma migrate deploy
npm run db:seed
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000)

## حسابات تجريبية

| الدور | البريد |
|-------|--------|
| مدير | admin@alzaad.org |
| مرشد | guide@alzaad.org |
| مستفيد | beneficiary1@alzaad.org |

كلمة المرور: `Zaad@2024` (راجع `credentials.md`)

## النشر

راجع [docs/DEPLOY.md](docs/DEPLOY.md) — Hostinger VPS بيئة واحدة.

## البنية

- **Next.js 15** App Router + TypeScript
- **Prisma 7** + PostgreSQL
- **Tailwind** RTL عربي
- أدوار: ADMIN, GUIDE, BENEFICIARY

## السكربتات

| الأمر | الوصف |
|-------|--------|
| `npm run dev` | تطوير |
| `npm run build` | بناء إنتاج |
| `npm run db:migrate` | migrations |
| `npm run db:seed` | بيانات تجريبية |

## التوثيق

- [BRD Baseline](docs/BRD-baseline.md)
- [UAT Checklist](docs/UAT-checklist.md)
- [Deploy Guide](docs/DEPLOY.md)
