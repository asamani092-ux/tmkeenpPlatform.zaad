#!/bin/sh
set -eu

# جذر التخزين الدائم — يجب أن يكون مربوطاً من Coolify (لا تكتفِ بـ mkdir)
APP_STORAGE="${APP_STORAGE:-${UPLOAD_DIR:-/app/storage}}"
export APP_STORAGE
export UPLOAD_DIR="${UPLOAD_DIR:-$APP_STORAGE}"

if [ -d "$APP_STORAGE" ]; then
  mkdir -p "$APP_STORAGE/evidence" "$APP_STORAGE/cv" "$APP_STORAGE/certificates" "$APP_STORAGE/data" || true
  chmod 750 "$APP_STORAGE" "$APP_STORAGE/evidence" 2>/dev/null || true
else
  echo "WARNING: $APP_STORAGE غير موجود — اربط Persistent Storage في Coolify ثم أعد النشر."
fi

if [ -n "${DATABASE_URL:-}" ]; then
  echo "Running prisma migrate deploy..."
  if prisma migrate deploy; then
    echo "Migrations applied successfully."
  else
    echo "WARNING: prisma migrate deploy failed — starting app anyway."
    echo "Check DATABASE_URL and that PostgreSQL is on the same Coolify project network."
  fi
else
  echo "WARNING: DATABASE_URL is not set — skipping migrations"
fi

exec "$@"
