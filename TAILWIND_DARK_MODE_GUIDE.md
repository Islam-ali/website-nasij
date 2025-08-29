# دليل استخدام Tailwind CSS مع Dark Mode

## نظرة عامة
تم تحويل مكون Hero Section ليعمل بالكامل مع Tailwind CSS مع دعم dark mode المدمج. هذا النهج يوفر:
- سهولة الصيانة والتطوير
- أداء أفضل
- دعم كامل للـ dark mode
- تصميم متجاوب

## كيفية عمل Dark Mode مع Tailwind

### 1. الفئات الأساسية
```html
<!-- Light Mode (الوضع الافتراضي) -->
<div class="bg-white text-gray-900">
  محتوى عادي
</div>

<!-- Dark Mode (يتم تطبيقه تلقائياً) -->
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  محتوى يدعم الوضع المظلم
</div>
```

### 2. الألوان المستخدمة في Hero Section

#### الخلفيات
```html
<!-- خلفية القسم الرئيسي -->
<section class="bg-gradient-to-br from-slate-50 to-white dark:from-gray-900 dark:to-gray-800">

<!-- خلفية البطاقات -->
<div class="bg-white dark:bg-gray-800">

<!-- خلفية عناصر التحميل -->
<div class="bg-gray-300 dark:bg-gray-700">
```

#### النصوص
```html
<!-- العناوين -->
<h3 class="text-gray-900 dark:text-white">

<!-- النصوص الفرعية -->
<p class="text-gray-600 dark:text-gray-300">

<!-- النصوص البيضاء (تبقى كما هي) -->
<span class="text-white">
```

#### الأزرار
```html
<!-- أزرار عادية -->
<button class="bg-white text-purple-600 dark:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-200">

<!-- أزرار مع تأثيرات -->
<button class="bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600">
```

### 3. الظلال والحدود
```html
<!-- ظلال عادية -->
<div class="shadow-lg dark:shadow-gray-900/50">

<!-- ظلال عند التمرير -->
<div class="hover:shadow-xl dark:hover:shadow-gray-900/70">
```

### 4. العناصر المتحركة
```html
<!-- عناصر عائمة -->
<div class="bg-purple-200 dark:bg-purple-600 animate-bounce">

<!-- عناصر مع تدرجات -->
<div class="bg-gradient-to-br from-pink-400 to-purple-500 dark:from-purple-500 dark:to-pink-500">
```

## الفئات المخصصة المستخدمة

### 1. التحميل (Skeleton Loading)
```html
<!-- عنصر تحميل -->
<div class="bg-gray-200 dark:bg-gray-600 animate-pulse">
  <div class="h-6 bg-gray-200 dark:bg-gray-600 rounded"></div>
  <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
</div>
```

### 2. البطاقات التفاعلية
```html
<!-- بطاقة مع تأثيرات -->
<div class="group relative overflow-hidden rounded-2xl shadow-xl dark:shadow-gray-900/50 hover:shadow-2xl dark:hover:shadow-gray-900/70">
  <img class="group-hover:scale-110 transition-transform duration-500">
  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
</div>
```

### 3. الأزرار التفاعلية
```html
<!-- زر مع تأثيرات -->
<button class="px-5 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 bg-white text-purple-600 dark:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-200">
  النص
</button>
```

## كيفية تفعيل Dark Mode

### 1. إضافة class للـ HTML
```html
<!-- في ملف index.html -->
<html class="dark">
  <!-- المحتوى -->
</html>
```

### 2. استخدام JavaScript
```javascript
// تفعيل dark mode
document.documentElement.classList.add('dark');

// إلغاء dark mode
document.documentElement.classList.remove('dark');

// تبديل dark mode
document.documentElement.classList.toggle('dark');
```

### 3. حفظ التفضيل في localStorage
```javascript
// حفظ التفضيل
localStorage.setItem('darkMode', 'true');

// استرجاع التفضيل
const isDark = localStorage.getItem('darkMode') === 'true';
if (isDark) {
  document.documentElement.classList.add('dark');
}
```

## أفضل الممارسات

### 1. استخدام الفئات المزدوجة
```html
<!-- ✅ صحيح -->
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">

<!-- ❌ خطأ -->
<div class="bg-white text-gray-900">
```

### 2. تجميع الفئات المتشابهة
```html
<!-- ✅ منظم -->
<div class="
  bg-white dark:bg-gray-800 
  text-gray-900 dark:text-white 
  border border-gray-200 dark:border-gray-700
  rounded-lg shadow-lg dark:shadow-gray-900/50
">
```

### 3. استخدام متغيرات CSS للألوان المخصصة
```css
/* في ملف CSS */
:root {
  --primary-color: #8b5cf6;
  --primary-dark: #7c3aed;
}

.dark {
  --primary-color: #a78bfa;
  --primary-dark: #8b5cf6;
}
```

## اختبار Dark Mode

### 1. اختبار يدوي
- فتح الموقع
- تبديل dark mode
- التأكد من تغيير جميع العناصر

### 2. اختبار تلقائي
```javascript
// اختبار بسيط
function testDarkMode() {
  const html = document.documentElement;
  const isDark = html.classList.contains('dark');
  
  // اختبار العناصر
  const elements = document.querySelectorAll('[class*="dark:"]');
  console.log(`Found ${elements.length} elements with dark mode classes`);
}
```

## استكشاف الأخطاء

### 1. مشاكل شائعة
```html
<!-- ❌ لا يعمل -->
<div class="dark:bg-gray-800"> <!-- يجب أن يكون العنصر الأب يحتوي على class="dark" -->

<!-- ✅ يعمل -->
<html class="dark">
  <div class="dark:bg-gray-800">
```

### 2. تأكد من إعدادات Tailwind
```javascript
// في tailwind.config.js
module.exports = {
  darkMode: 'class', // مهم!
  // باقي الإعدادات...
}
```

## الأداء والتحسين

### 1. تقليل حجم CSS
- استخدام PurgeCSS لإزالة الفئات غير المستخدمة
- تجميع الفئات المتشابهة

### 2. تحسين الانتقالات
```html
<!-- انتقالات سلسة -->
<div class="transition-all duration-300 ease-in-out">
```

هذا الدليل يساعدك على فهم كيفية استخدام Tailwind CSS مع dark mode في مشروعك. 