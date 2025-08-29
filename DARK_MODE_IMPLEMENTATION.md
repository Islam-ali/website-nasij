# دليل تفعيل Dark Mode في المشروع

## نظرة عامة
تم تطبيق دعم dark mode على جميع مكونات الصفحة الرئيسية باستخدام Tailwind CSS. هذا الدليل يوضح كيفية تفعيل وإدارة dark mode في المشروع.

## المكونات المدعومة

### ✅ المكونات المحدثة:
1. **Hero Section** - القسم الرئيسي
2. **Feature Section** - قسم المميزات
3. **Banner Section** - قسم البانر
4. **Featured Collection** - المجموعات المميزة
5. **Home Component** - الصفحة الرئيسية

## كيفية تفعيل Dark Mode

### 1. إضافة class للـ HTML
```html
<!-- في ملف index.html -->
<html class="dark">
  <head>
    <!-- ... -->
  </head>
  <body>
    <!-- ... -->
  </body>
</html>
```

### 2. استخدام JavaScript للتبديل
```javascript
// تفعيل dark mode
function enableDarkMode() {
  document.documentElement.classList.add('dark');
  localStorage.setItem('darkMode', 'true');
}

// إلغاء dark mode
function disableDarkMode() {
  document.documentElement.classList.remove('dark');
  localStorage.setItem('darkMode', 'false');
}

// تبديل dark mode
function toggleDarkMode() {
  const isDark = document.documentElement.classList.contains('dark');
  if (isDark) {
    disableDarkMode();
  } else {
    enableDarkMode();
  }
}

// استرجاع التفضيل المحفوظ
function loadDarkModePreference() {
  const savedPreference = localStorage.getItem('darkMode');
  if (savedPreference === 'true') {
    enableDarkMode();
  } else if (savedPreference === 'false') {
    disableDarkMode();
  } else {
    // إذا لم يكن هناك تفضيل محفوظ، استخدم تفضيل النظام
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      enableDarkMode();
    }
  }
}
```

### 3. إضافة زر التبديل
```html
<!-- في أي مكون -->
<button 
  (click)="toggleDarkMode()" 
  class="fixed top-4 right-4 z-50 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/50 transition-all duration-300 hover:scale-110">
  <i class="pi" [ngClass]="isDarkMode ? 'pi-sun' : 'pi-moon'"></i>
</button>
```

## الألوان المستخدمة

### الخلفيات
```css
/* Light Mode */
.bg-white
.bg-gray-50
.bg-gray-100
.bg-purple-100

/* Dark Mode */
.dark .bg-gray-900
.dark .bg-gray-800
.dark .bg-gray-700
.dark .bg-purple-900/30
```

### النصوص
```css
/* Light Mode */
.text-gray-900
.text-gray-600
.text-gray-500
.text-purple-600

/* Dark Mode */
.dark .text-white
.dark .text-gray-300
.dark .text-gray-400
.dark .text-purple-400
```

### الظلال
```css
/* Light Mode */
.shadow-lg
.shadow-xl
.shadow-2xl

/* Dark Mode */
.dark .shadow-gray-900/50
.dark .shadow-gray-900/70
```

## الانتقالات والتأثيرات

### الانتقالات السلسة
```css
.transition-colors duration-300
.transition-all duration-300
```

### تأثيرات Hover
```css
.hover:bg-gray-100 dark:hover:bg-gray-200
.hover:scale-105
.group-hover:scale-110
```

## إعدادات Tailwind

### تأكد من إعدادات tailwind.config.js
```javascript
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class', // مهم!
  theme: {
    extend: {
      // ... باقي الإعدادات
    },
  },
  plugins: [],
};
```

## اختبار Dark Mode

### 1. اختبار يدوي
```javascript
// في console المتصفح
document.documentElement.classList.add('dark'); // تفعيل
document.documentElement.classList.remove('dark'); // إلغاء
document.documentElement.classList.toggle('dark'); // تبديل
```

### 2. اختبار تلقائي
```javascript
// دالة اختبار بسيطة
function testDarkMode() {
  const elements = document.querySelectorAll('[class*="dark:"]');
  console.log(`Found ${elements.length} elements with dark mode classes`);
  
  const isDark = document.documentElement.classList.contains('dark');
  console.log(`Dark mode is ${isDark ? 'enabled' : 'disabled'}`);
}
```

## أفضل الممارسات

### 1. استخدام الفئات المزدوجة دائماً
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
  transition-all duration-300
">
```

### 3. استخدام متغيرات CSS للألوان المخصصة
```css
:root {
  --primary-color: #8b5cf6;
  --primary-dark: #7c3aed;
}

.dark {
  --primary-color: #a78bfa;
  --primary-dark: #8b5cf6;
}
```

## استكشاف الأخطاء

### مشاكل شائعة وحلولها

#### 1. Dark mode لا يعمل
```javascript
// تأكد من إعدادات Tailwind
console.log('Dark mode config:', window.tailwind?.config?.darkMode);

// تأكد من وجود class="dark"
console.log('HTML classes:', document.documentElement.classList);
```

#### 2. بعض العناصر لا تتغير
```html
<!-- تأكد من إضافة الفئات المزدوجة -->
<div class="bg-white dark:bg-gray-800">
  <p class="text-gray-900 dark:text-white">النص</p>
</div>
```

#### 3. الانتقالات غير سلسة
```css
/* أضف transition classes */
.transition-colors duration-300
.transition-all duration-300
```

## الأداء والتحسين

### 1. تقليل حجم CSS
- استخدام PurgeCSS لإزالة الفئات غير المستخدمة
- تجميع الفئات المتشابهة

### 2. تحسين الانتقالات
```css
/* انتقالات سلسة */
* {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
```

## إضافة مكونات جديدة

### خطوات إضافة dark mode لمكون جديد:

1. **إضافة الفئات المزدوجة**
```html
<div class="bg-white dark:bg-gray-800">
```

2. **إضافة الانتقالات**
```html
<div class="transition-colors duration-300">
```

3. **اختبار في كلا الوضعين**
```javascript
// اختبار سريع
document.documentElement.classList.toggle('dark');
```

## الخلاصة

تم تطبيق dark mode بنجاح على جميع مكونات الصفحة الرئيسية. النظام يعمل بشكل كامل مع:
- ✅ Tailwind CSS
- ✅ الانتقالات السلسة
- ✅ حفظ التفضيلات
- ✅ دعم تفضيل النظام
- ✅ تصميم متجاوب
- ✅ إمكانية الوصول

لتفعيل dark mode، أضف `class="dark"` للعنصر `<html>` أو استخدم JavaScript للتبديل. 