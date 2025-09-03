# Dark/Light Mode System - pledge Website

## نظرة عامة

تم تطوير نظام Dark/Light Mode شامل لموقع pledge مع دعم ثلاثة أوضاع:
- **Light Mode**: الوضع الفاتح
- **Dark Mode**: الوضع الداكن  
- **System Mode**: يتبع إعدادات النظام

## المميزات

### ✅ المميزات المطبقة

1. **ثلاثة أوضاع للثيم**
   - Light Mode
   - Dark Mode  
   - System Mode (يتبع إعدادات النظام)

2. **حفظ التفضيلات**
   - حفظ تفضيل المستخدم في localStorage
   - استرجاع التفضيل عند إعادة تحميل الصفحة

3. **انتقالات سلسة**
   - انتقالات سلسة بين الأوضاع
   - دعم View Transitions API (إذا كان متاحاً)

4. **تصميم متجاوب**
   - دعم كامل للهواتف المحمولة
   - تصميم متجاوب لجميع أحجام الشاشات

5. **ألوان مخصصة**
   - نظام ألوان مخصص للوضع الداكن
   - ألوان متناسقة ومريحة للعين

6. **دعم PrimeNG**
   - تخصيص مكونات PrimeNG للوضع الداكن
   - دعم جميع المكونات المستخدمة

## الملفات المحدثة

### 1. Tailwind Configuration
```javascript
// tailwind.config.js
darkMode: 'class', // Enable class-based dark mode
```

### 2. Global Styles
```scss
// styles.scss
@layer base {
  .dark body {
    @apply bg-dark-bg text-dark-text;
  }
}
```

### 3. Theme Service
```typescript
// src/app/core/services/theme.service.ts
export class ThemeService {
  setTheme(mode: ThemeMode): void
  toggleTheme(): void
  getThemeIcon(): string
  getThemeLabel(): string
}
```

### 4. Theme Toggle Component
```typescript
// src/app/shared/components/theme-toggle/theme-toggle.component.ts
export class ThemeToggleComponent {
  cycleTheme(): void
  getTooltipText(): string
}
```

## كيفية الاستخدام

### 1. تبديل الثيم
```typescript
// في أي component
constructor(private themeService: ThemeService) {}

// تبديل الثيم
this.themeService.toggleTheme();

// تعيين ثيم محدد
this.themeService.setTheme('dark');
this.themeService.setTheme('light');
this.themeService.setTheme('system');
```

### 2. استخدام Theme Toggle Component
```html
<!-- في أي template -->
<app-theme-toggle></app-theme-toggle>
```

### 3. التحقق من الوضع الحالي
```typescript
// التحقق من الوضع الداكن
if (this.themeService.isDark()) {
  // الوضع الداكن مفعل
}

// الحصول على الوضع الحالي
const currentMode = this.themeService.mode(); // 'light' | 'dark' | 'system'
```

## الألوان المستخدمة

### Light Mode Colors
```scss
// الألوان الأساسية للوضع الفاتح
bg-white
text-gray-900
border-gray-200
```

### Dark Mode Colors
```scss
// الألوان المخصصة للوضع الداكن
dark-bg: #0F172A        // الخلفية الرئيسية
dark-surface: #1E293B   // أسطح العناصر
dark-surfaceHover: #334155 // hover للأسطح
dark-border: #334155    // الحدود
dark-text: #F1F5F9      // النص الرئيسي
dark-textSecondary: #CBD5E1 // النص الثانوي
dark-textMuted: #64748B // النص المخفف
```

## المكونات المدعومة

### ✅ المكونات المحدثة
- [x] Topbar Navigation
- [x] Cart Drawer
- [x] Wishlist Drawer
- [x] Mobile Navigation
- [x] Theme Toggle Button
- [x] PrimeNG Components
- [x] Loading Screen

### 🔄 المكونات المطلوب تحديثها
- [ ] Product Cards
- [ ] Category Pages
- [ ] About Page
- [ ] Contact Forms
- [ ] User Profile
- [ ] Checkout Pages

## التخصيص

### إضافة ألوان جديدة
```javascript
// tailwind.config.js
colors: {
  dark: {
    custom: '#your-color',
  }
}
```

### تخصيص مكونات PrimeNG
```scss
// styles.scss
.dark .p-component {
  @apply text-dark-text;
}
```

## أفضل الممارسات

### 1. استخدام الألوان المخصصة
```html
<!-- ✅ صحيح -->
<div class="bg-white dark:bg-dark-surface">
  <p class="text-gray-900 dark:text-dark-text">Content</p>
</div>

<!-- ❌ خاطئ -->
<div class="bg-white dark:bg-gray-900">
  <p class="text-gray-900 dark:text-white">Content</p>
</div>
```

### 2. إضافة الانتقالات
```html
<!-- ✅ صحيح -->
<div class="transition-all duration-300">
  <p class="text-gray-900 dark:text-dark-text">Content</p>
</div>
```

### 3. اختبار جميع الأوضاع
```typescript
// اختبار جميع الأوضاع
['light', 'dark', 'system'].forEach(mode => {
  this.themeService.setTheme(mode);
  // اختبار المكون
});
```

## استكشاف الأخطاء

### المشاكل الشائعة

1. **الثيم لا يتغير**
   - تأكد من إضافة `dark:` classes
   - تحقق من استيراد ThemeService

2. **الألوان لا تظهر**
   - تأكد من تحديث tailwind.config.js
   - تحقق من إعادة بناء التطبيق

3. **الانتقالات غير سلسة**
   - تأكد من إضافة `transition-*` classes
   - تحقق من CSS transitions

## التطوير المستقبلي

### الميزات المقترحة
- [ ] Animation للتبديل بين الأوضاع
- [ ] تخصيص ألوان حسب العلامة التجارية
- [ ] دعم High Contrast Mode
- [ ] تخصيص حسب الوقت (Auto Dark Mode)
- [ ] حفظ تفضيلات إضافية

### التحسينات
- [ ] تحسين الأداء
- [ ] تقليل حجم CSS
- [ ] إضافة المزيد من المكونات
- [ ] تحسين Accessibility

## الدعم

لأي استفسارات أو مشاكل، يرجى التواصل مع فريق التطوير.

---

**تم التطوير بواسطة فريق pledge Development Team**
**آخر تحديث: ديسمبر 2024** 