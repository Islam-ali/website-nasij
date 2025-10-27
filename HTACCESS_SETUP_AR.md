# إعداد ملف .htaccess لـ Angular

## 🔴 المشكلة

عند عمل Reload للصفحة في تطبيق Angular، يظهر خطأ 404:
```
Error 404 - Not Found
The document you are looking for may have been removed or re-named.
```

**السبب:**
- Angular يستخدم Client-Side Routing (توجيه من جانب العميل)
- عند الضغط على Reload، المتصفح يطلب الصفحة من السيرفر مباشرةً
- السيرفر لا يجد الصفحة المطلوبة (مثل `/products/123`) لأنها route في Angular وليست ملف حقيقي
- يعيد السيرفر خطأ 404

## ✅ الحل

استخدام ملف `.htaccess` لإعادة توجيه جميع الطلبات إلى `index.html` حتى يتمكن Angular Router من معالجة الـ routing.

## 📝 الملفات المعدلة

### 1. ملف `.htaccess`
الموقع: `src/.htaccess`

#### الميزات:
```apache
# ✅ إعادة توجيه جميع الطلبات إلى index.html
RewriteRule ^ /index.html [L]

# ✅ ضغط GZIP للملفات (تسريع التحميل)
AddOutputFilterByType DEFLATE text/html text/css application/javascript

# ✅ Browser Caching (التخزين المؤقت)
- الصور: سنة واحدة
- CSS/JS: شهر واحد
- HTML: بدون تخزين مؤقت

# ✅ رؤوس الأمان (Security Headers)
- X-Frame-Options: حماية من Clickjacking
- X-XSS-Protection: حماية من XSS
- X-Content-Type-Options: منع MIME sniffing

# ✅ تعطيل عرض محتويات المجلدات
Options -Indexes

# ✅ صفحات الأخطاء
- 404, 403, 500 → تحويل إلى index.html
```

### 2. ملف `angular.json`
تم إضافة `.htaccess` إلى قائمة الـ assets ليتم نسخه إلى مجلد `dist`:

```json
"assets": [
  { "glob": "**/*", "input": "public" },
  { "glob": "**/*", "input": "src/assets" },
  { "glob": ".htaccess", "input": "src", "output": "/" }
],
```

## 🚀 كيفية الاستخدام

### 1. التطوير المحلي (Development)
```bash
ng serve
```
لا حاجة لـ .htaccess في وضع التطوير - Angular CLI يتعامل مع الـ routing تلقائياً.

### 2. البناء (Build)
```bash
# Build للإنتاج
ng build --configuration=production

# أو Build للتطوير
ng build --configuration=development
```

### 3. الرفع على السيرفر (Deployment)
بعد البناء، ارفع محتويات مجلد `dist/pledge-website/browser/` إلى السيرفر.

تأكد أن ملف `.htaccess` موجود في الجذر (root) مع `index.html`.

**هيكل الملفات على السيرفر:**
```
public_html/
├── .htaccess          ← مهم جداً!
├── index.html
├── main.*.js
├── polyfills.*.js
├── styles.*.css
└── assets/
```

## 🔧 متطلبات السيرفر

### Apache Server
تأكد أن `mod_rewrite` مفعّل:
```bash
sudo a2enmod rewrite
sudo service apache2 restart
```

### cPanel / Shared Hosting
ملف `.htaccess` يعمل تلقائياً (غالباً).

### Nginx Server
استخدم هذا في ملف الإعداد:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## ✨ الميزات الإضافية

### 1. ضغط GZIP
يقلل حجم الملفات بنسبة 60-70%:
- HTML, CSS, JS, JSON, XML → جميعها مضغوطة

### 2. Browser Caching
يحسن السرعة للزوار المتكررين:
- **الصور**: تخزين لمدة سنة
- **CSS/JS**: تخزين لمدة شهر
- **HTML**: بدون تخزين (للحصول على آخر تحديث)

### 3. رؤوس الأمان
حماية إضافية لموقعك:
- **X-Frame-Options**: يمنع Clickjacking
- **X-XSS-Protection**: حماية من هجمات XSS
- **X-Content-Type-Options**: يمنع MIME type sniffing
- **Referrer-Policy**: يتحكم في معلومات الـ referrer

### 4. إخفاء محتويات المجلدات
`Options -Indexes` يمنع عرض قائمة الملفات إذا تم الوصول لمجلد مباشرة.

## 🧪 الاختبار

### 1. اختبر محلياً (Local Testing)
بعد البناء، استخدم سيرفر محلي:
```bash
# باستخدام http-server
npx http-server dist/pledge-website/browser -p 8080

# أو باستخدام serve
npx serve -s dist/pledge-website/browser
```

### 2. اختبر Routes مختلفة
- افتح `http://localhost:8080/products`
- اعمل Reload (F5 أو Ctrl+R)
- يجب أن تعمل بدون خطأ 404!

### 3. اختبر ضغط GZIP
```bash
curl -H "Accept-Encoding: gzip" -I http://your-domain.com/main.js
```
يجب أن ترى: `Content-Encoding: gzip`

## 🐛 حل المشاكل (Troubleshooting)

### المشكلة: لا يزال خطأ 404 موجوداً
**الحلول:**
1. تأكد أن `.htaccess` موجود في نفس مجلد `index.html`
2. تحقق أن `mod_rewrite` مفعّل على Apache
3. تحقق من أذونات الملف: `chmod 644 .htaccess`
4. راجع error logs السيرفر

### المشكلة: "Internal Server Error 500"
**الحلول:**
1. تحقق من syntax الـ `.htaccess`
2. قد يكون السيرفر لا يدعم بعض الـ directives
3. حاول تعطيل أجزاء من الملف واحدة تلو الأخرى

### المشكلة: الملف لم ينسخ إلى dist/
**الحلول:**
1. تأكد من تحديث `angular.json`
2. احذف مجلد `dist/` واعمل build جديد
3. تحقق من المسار في assets configuration

## 📚 موارد إضافية

- [Angular Deployment Guide](https://angular.io/guide/deployment)
- [Apache mod_rewrite Documentation](https://httpd.apache.org/docs/current/mod/mod_rewrite.html)
- [Web Security Headers Guide](https://owasp.org/www-project-secure-headers/)

## ✅ Checklist قبل الرفع

- [ ] ملف `.htaccess` في `src/`
- [ ] تحديث `angular.json` لنسخ `.htaccess`
- [ ] عمل build للمشروع: `ng build --configuration=production`
- [ ] التأكد من وجود `.htaccess` في `dist/pledge-website/browser/`
- [ ] رفع جميع ملفات `dist/pledge-website/browser/` إلى السيرفر
- [ ] اختبار Routes مختلفة
- [ ] اختبار Reload على Routes مختلفة
- [ ] التحقق من عمل الأمان Headers
- [ ] اختبار GZIP compression

## 🎉 النتيجة

الآن يمكنك:
- ✅ عمل Reload لأي صفحة بدون خطأ 404
- ✅ مشاركة روابط مباشرة للصفحات
- ✅ موقع أسرع (GZIP + Caching)
- ✅ أمان أفضل (Security Headers)
- ✅ تجربة مستخدم محسّنة

---

**ملاحظة:** إذا كنت تستخدم Nginx بدلاً من Apache، ستحتاج إلى ملف إعداد مختلف. راجع التوثيق أعلاه للحصول على التفاصيل.
