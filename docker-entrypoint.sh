#!/bin/sh
set -eu

# جذر التخزين — Coolify يربط volume كـ root فيُفقد chown من البناء
UPLOAD_DIR="${UPLOAD_DIR:-${APP_STORAGE:-/app/uploads}}"
APP_STORAGE="${APP_STORAGE:-$UPLOAD_DIR}"
export UPLOAD_DIR APP_STORAGE

fix_storage_dir() {
  d="$1"
  [ -n "$d" ] || return 0
  [ -d "$d" ] || return 0
  mkdir -p "$d/cv" "$d/certificates" "$d/data" "$d/evidence"
  chown -R nextjs:nodejs "$d"
  chmod 750 "$d" "$d/cv" "$d/certificates" "$d/data" "$d/evidence" 2>/dev/null || true
}

if [ "$(id -u)" = "0" ]; then
  fix_storage_dir "$UPLOAD_DIR"
  if [ "$APP_STORAGE" != "$UPLOAD_DIR" ]; then
    fix_storage_dir "$APP_STORAGE"
  fi
  # مسارات شائعة إن رُبطت من Coolify
  fix_storage_dir /app/uploads
  fix_storage_dir /app/storage
else
  echo "WARNING: entrypoint ليس root — تعذّر chown على مجلد الرفع. نفّذ كـ root: chown -R nextjs:nodejs $UPLOAD_DIR"
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

if [ "$(id -u)" = "0" ]; then
  exec su-exec nextjs "$@"
fi

exec "$@"
