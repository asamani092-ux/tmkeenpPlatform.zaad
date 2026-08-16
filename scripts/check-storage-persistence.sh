#!/bin/sh
# فحص ثبات مسار التخزين داخل حاوية التطبيق — إلزامي قبل اعتبار النشر جاهزاً.
# الاستخدام: sh scripts/check-storage-persistence.sh
# أو داخل Coolify Terminal: APP_STORAGE=/app/storage sh /app/scripts/check-storage-persistence.sh

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

if mountpoint -q "$APP_STORAGE" 2>/dev/null; then
  echo "النتيجة: ثابت — يبدو ثابتاً (مربوط بمجلد دائم — mountpoint)"
  findmnt -T "$APP_STORAGE" 2>/dev/null || true
  exit 0
fi

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

# لا أدوات mount: افحص إن كان تحت طبقة الجذر فقط
echo "النتيجة: غير ثابت — سيُستبدل عند إعادة النشر (لا دليل على volume/bind)"
echo "findmnt: غير متوفر أو بلا تطابق bind|volume|nfs"
exit 1
