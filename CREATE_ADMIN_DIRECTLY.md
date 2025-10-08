# 🔑 إنشاء حساب المدير - الطريقة المباشرة

## استخدمي هذا الأمر مباشرة:

### في Terminal (على جهازك):

```bash
curl -X POST https://osdm-platform.vercel.app/api/setup/create-admin
```

أو افتحي هذا الرابط مباشرة في المتصفح:

```
https://osdm-platform.vercel.app/api/setup/create-admin
```

**سيرد عليكِ بهذا:**

```json
{
  "success": true,
  "message": "Admin user created successfully! ✅",
  "credentials": {
    "username": "Razan@OSDM",
    "password": "RazanOSDM@056300",
    "email": "admin@osdm.com"
  }
}
```

---

## بعدها سجلي دخول:

**الرابط:**
```
https://osdm-platform.vercel.app/ar/auth/login
```

**البيانات:**
- Username: `Razan@OSDM`
- Password: `RazanOSDM@056300`

---

## إذا قال "Admin موجود بالفعل":

معناه الحساب موجود! فقط سجلي دخول مباشرة.

---

**ملاحظة:** حذفت صفحة /setup لأنها كانت تسبب أخطاء.
الطريقة المباشرة أسهل وأضمن.
