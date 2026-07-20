# UAT checklist

## Fillable form (recommended)

Open while the app runs on **`master` / latest wave3** (not old RTL-only branches):

**http://localhost:3000/uat-checklist**

Progress is saved in `localStorage` (`tmkeen-uat-checklist-v1`).

## Verified on this branch

- PENDING_APPROVAL: banner + profile + stage only — «من مرشدك» / tasks / opportunities hidden
- CSV export: UTF-8 BOM + `sep=;` + expanded beneficiary columns
- Login: hard redirect after auth; role dashboards have `loading.tsx`

Static reference: [uat-tools-checklist.md](./uat-tools-checklist.md)
