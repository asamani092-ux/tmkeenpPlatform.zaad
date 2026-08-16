#!/bin/sh
# فحص ثبات مسار التخزين داخل حاوية التطبيق — إلزامي قبل اعتبار النشر جاهزاً.
# Coolify Terminal (بعد نشر هذا الفرع):
#   sh /app/check-storage-persistence.sh
# أو بدون ملف (أي صورة): الصق محتوى الفحص مباشرة.

set -eu

APP_STORAGE="${APP_STORAGE:-${UPLOAD_DIR:-/app/storage}}"

echo "=== فحص: $APP_STORAGE ==="

if [ ! -d "$APP_STORAGE" ]; then
  echo "النتيجة: غير ثابت — المجلد غير موجود — أنشئه واربطه كتخزين دائم في Coolify"
  echo "Coolify Persistent Storage:"
  echo "  مسار السيرفر: /data/tmkeen/storage"
  echo "  مسار الحاوية: /app/storage"
  exit 2
fi

# 1) mountpoint إن وُجد
if command -v mountpoint >/dev/null 2>&1 && mountpoint -q "$APP_STORAGE" 2>/dev/null; then
  echo "النتيجة: ثابت — يبدو ثابتاً (مربوط بمجلد دائم — mountpoint)"
  if command -v findmnt >/dev/null 2>&1; then
    findmnt -T "$APP_STORAGE" 2>/dev/null || true
  else
    grep -E "[[:space:]]${APP_STORAGE}([[:space:]]|$)" /proc/mounts 2>/dev/null || true
  fi
  exit 0
fi

# 2) findmnt
if command -v findmnt >/dev/null 2>&1; then
  FINDMNT_OUT="$(findmnt -T "$APP_STORAGE" 2>/dev/null || true)"
  if printf '%s\n' "$FINDMNT_OUT" | grep -Eq 'bind|volume|nfs'; then
    echo "النتيجة: ثابت — يبدو ثابتاً (مربوط بمجلد دائم — findmnt)"
    printf '%s\n' "$FINDMNT_OUT"
    exit 0
  fi
  if [ -n "$FINDMNT_OUT" ]; then
    echo "النتيجة: غير ثابت — سيُستبدل عند إعادة النشر"
    printf '%s\n' "$FINDMNT_OUT"
    exit 1
  fi
fi

# 3) /proc/mounts (Alpine بدون util-linux)
if grep -E "[[:space:]]${APP_STORAGE}([[:space:]]|$)" /proc/mounts >/dev/null 2>&1; then
  echo "النتيجة: ثابت — يبدو ثابتاً (مربوط بمجلد دائم — /proc/mounts)"
  grep -E "[[:space:]]${APP_STORAGE}([[:space:]]|$)" /proc/mounts || true
  exit 0
fi

echo "النتيجة: غير ثابت — سيُستبدل عند إعادة النشر (لا دليل على volume/bind)"
echo "--- findmnt ---"
if command -v findmnt >/dev/null 2>&1; then
  findmnt -T "$APP_STORAGE" 2>/dev/null || echo "(لا مخرجات)"
else
  echo "(findmnt غير مثبت)"
fi
echo "--- /proc/mounts (storage) ---"
grep -i storage /proc/mounts 2>/dev/null || echo "(لا سطر storage)"
exit 1
