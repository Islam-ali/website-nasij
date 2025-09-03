# دليل تطبيق Dark Mode على باقي المكونات

## نظرة عامة

هذا الدليل يوضح كيفية تطبيق Dark Mode على باقي مكونات الموقع التي لم يتم تحديثها بعد.

## المكونات المطلوب تحديثها

### 1. Product Cards
```html
<!-- قبل التحديث -->
<div class="bg-white border border-gray-200 rounded-lg shadow-sm">
  <img src="product.jpg" alt="Product" class="w-full h-48 object-cover rounded-t-lg">
  <div class="p-4">
    <h3 class="text-lg font-semibold text-gray-900">Product Name</h3>
    <p class="text-gray-600">Product description</p>
    <div class="flex justify-between items-center mt-4">
      <span class="text-xl font-bold text-gray-900">$99.99</span>
      <button class="bg-purple-600 text-white px-4 py-2 rounded-lg">Add to Cart</button>
    </div>
  </div>
</div>

<!-- بعد التحديث -->
<div class="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-sm transition-all duration-300">
  <img src="product.jpg" alt="Product" class="w-full h-48 object-cover rounded-t-lg">
  <div class="p-4">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-dark-text transition-colors duration-300">Product Name</h3>
    <p class="text-gray-600 dark:text-dark-textSecondary transition-colors duration-300">Product description</p>
    <div class="flex justify-between items-center mt-4">
      <span class="text-xl font-bold text-gray-900 dark:text-dark-text transition-colors duration-300">$99.99</span>
      <button class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-300">Add to Cart</button>
    </div>
  </div>
</div>
```

### 2. Category Pages
```html
<!-- قبل التحديث -->
<div class="max-w-7xl mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold text-gray-900 mb-8">Category Name</h1>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    <!-- Product cards here -->
  </div>
</div>

<!-- بعد التحديث -->
<div class="max-w-7xl mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold text-gray-900 dark:text-dark-text mb-8 transition-colors duration-300">Category Name</h1>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    <!-- Updated product cards here -->
  </div>
</div>
```

### 3. About Page
```html
<!-- قبل التحديث -->
<section class="bg-gray-50 py-16">
  <div class="max-w-7xl mx-auto px-4">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-3xl font-bold text-gray-900 mb-8">About Us</h2>
      <p class="text-gray-600 leading-relaxed mb-6">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </p>
      <div class="bg-white rounded-lg shadow-sm p-8">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">Our Mission</h3>
        <p class="text-gray-600">Our mission is to provide the best products...</p>
      </div>
    </div>
  </div>
</section>

<!-- بعد التحديث -->
<section class="bg-gray-50 dark:bg-dark-bg py-16 transition-all duration-300">
  <div class="max-w-7xl mx-auto px-4">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-3xl font-bold text-gray-900 dark:text-dark-text mb-8 transition-colors duration-300">About Us</h2>
      <p class="text-gray-600 dark:text-dark-textSecondary leading-relaxed mb-6 transition-colors duration-300">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </p>
      <div class="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-8 transition-all duration-300">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-dark-text mb-4 transition-colors duration-300">Our Mission</h3>
        <p class="text-gray-600 dark:text-dark-textSecondary transition-colors duration-300">Our mission is to provide the best products...</p>
      </div>
    </div>
  </div>
</section>
```

### 4. Contact Forms
```html
<!-- قبل التحديث -->
<form class="max-w-md mx-auto">
  <div class="mb-4">
    <label class="block text-gray-700 text-sm font-bold mb-2">Name</label>
    <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
  </div>
  <div class="mb-4">
    <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
    <input type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
  </div>
  <div class="mb-4">
    <label class="block text-gray-700 text-sm font-bold mb-2">Message</label>
    <textarea class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" rows="4"></textarea>
  </div>
  <button type="submit" class="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700">Send Message</button>
</form>

<!-- بعد التحديث -->
<form class="max-w-md mx-auto">
  <div class="mb-4">
    <label class="block text-gray-700 dark:text-dark-text text-sm font-bold mb-2 transition-colors duration-300">Name</label>
    <input type="text" class="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text placeholder-gray-500 dark:placeholder-dark-textMuted transition-all duration-300">
  </div>
  <div class="mb-4">
    <label class="block text-gray-700 dark:text-dark-text text-sm font-bold mb-2 transition-colors duration-300">Email</label>
    <input type="email" class="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text placeholder-gray-500 dark:placeholder-dark-textMuted transition-all duration-300">
  </div>
  <div class="mb-4">
    <label class="block text-gray-700 dark:text-dark-text text-sm font-bold mb-2 transition-colors duration-300">Message</label>
    <textarea class="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text placeholder-gray-500 dark:placeholder-dark-textMuted transition-all duration-300" rows="4"></textarea>
  </div>
  <button type="submit" class="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors duration-300">Send Message</button>
</form>
```

### 5. User Profile
```html
<!-- قبل التحديث -->
<div class="bg-white rounded-lg shadow-sm p-6">
  <div class="flex items-center space-x-4 mb-6">
    <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
      <span class="text-2xl font-bold text-gray-600">JD</span>
    </div>
    <div>
      <h2 class="text-xl font-semibold text-gray-900">John Doe</h2>
      <p class="text-gray-600">john.doe@example.com</p>
    </div>
  </div>
  <div class="border-t border-gray-200 pt-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
    <div class="space-y-3">
      <div class="flex justify-between">
        <span class="text-gray-600">Phone:</span>
        <span class="text-gray-900">+1 234 567 890</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600">Address:</span>
        <span class="text-gray-900">123 Main St, City, Country</span>
      </div>
    </div>
  </div>
</div>

<!-- بعد التحديث -->
<div class="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-6 transition-all duration-300">
  <div class="flex items-center space-x-4 mb-6">
    <div class="w-16 h-16 bg-gray-200 dark:bg-dark-surfaceHover rounded-full flex items-center justify-center transition-all duration-300">
      <span class="text-2xl font-bold text-gray-600 dark:text-dark-textSecondary transition-colors duration-300">JD</span>
    </div>
    <div>
      <h2 class="text-xl font-semibold text-gray-900 dark:text-dark-text transition-colors duration-300">John Doe</h2>
      <p class="text-gray-600 dark:text-dark-textSecondary transition-colors duration-300">john.doe@example.com</p>
    </div>
  </div>
  <div class="border-t border-gray-200 dark:border-dark-border pt-6 transition-all duration-300">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4 transition-colors duration-300">Account Information</h3>
    <div class="space-y-3">
      <div class="flex justify-between">
        <span class="text-gray-600 dark:text-dark-textSecondary transition-colors duration-300">Phone:</span>
        <span class="text-gray-900 dark:text-dark-text transition-colors duration-300">+1 234 567 890</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600 dark:text-dark-textSecondary transition-colors duration-300">Address:</span>
        <span class="text-gray-900 dark:text-dark-text transition-colors duration-300">123 Main St, City, Country</span>
      </div>
    </div>
  </div>
</div>
```

### 6. Checkout Pages
```html
<!-- قبل التحديث -->
<div class="bg-white rounded-lg shadow-sm p-6">
  <h2 class="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
  <div class="space-y-3 mb-6">
    <div class="flex justify-between">
      <span class="text-gray-600">Subtotal:</span>
      <span class="text-gray-900">$99.99</span>
    </div>
    <div class="flex justify-between">
      <span class="text-gray-600">Shipping:</span>
      <span class="text-gray-900">$5.99</span>
    </div>
    <div class="border-t border-gray-200 pt-3">
      <div class="flex justify-between">
        <span class="text-lg font-semibold text-gray-900">Total:</span>
        <span class="text-lg font-semibold text-gray-900">$105.98</span>
      </div>
    </div>
  </div>
  <button class="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700">Place Order</button>
</div>

<!-- بعد التحديث -->
<div class="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-6 transition-all duration-300">
  <h2 class="text-xl font-semibold text-gray-900 dark:text-dark-text mb-4 transition-colors duration-300">Order Summary</h2>
  <div class="space-y-3 mb-6">
    <div class="flex justify-between">
      <span class="text-gray-600 dark:text-dark-textSecondary transition-colors duration-300">Subtotal:</span>
      <span class="text-gray-900 dark:text-dark-text transition-colors duration-300">$99.99</span>
    </div>
    <div class="flex justify-between">
      <span class="text-gray-600 dark:text-dark-textSecondary transition-colors duration-300">Shipping:</span>
      <span class="text-gray-900 dark:text-dark-text transition-colors duration-300">$5.99</span>
    </div>
    <div class="border-t border-gray-200 dark:border-dark-border pt-3 transition-all duration-300">
      <div class="flex justify-between">
        <span class="text-lg font-semibold text-gray-900 dark:text-dark-text transition-colors duration-300">Total:</span>
        <span class="text-lg font-semibold text-gray-900 dark:text-dark-text transition-colors duration-300">$105.98</span>
      </div>
    </div>
  </div>
  <button class="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors duration-300">Place Order</button>
</div>
```

## قائمة التحقق

### ✅ المكونات المحدثة
- [x] Topbar Navigation
- [x] Cart Drawer
- [x] Wishlist Drawer
- [x] Mobile Navigation
- [x] Theme Toggle Button
- [x] Loading Screen

### 🔄 المكونات المطلوب تحديثها
- [ ] Product Cards
- [ ] Category Pages
- [ ] About Page
- [ ] Contact Forms
- [ ] User Profile
- [ ] Checkout Pages
- [ ] Footer
- [ ] Sidebar (إذا وجد)
- [ ] Modal Dialogs
- [ ] Toast Notifications
- [ ] Pagination
- [ ] Search Results
- [ ] Error Pages (404, 500)
- [ ] Success/Error Messages

## أفضل الممارسات

### 1. استخدام الألوان المخصصة دائماً
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

### 2. إضافة الانتقالات دائماً
```html
<!-- ✅ صحيح -->
<div class="transition-all duration-300">
  <p class="text-gray-900 dark:text-dark-text">Content</p>
</div>

<!-- ❌ خاطئ -->
<div>
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

### 4. استخدام CSS Classes بدلاً من Inline Styles
```html
<!-- ✅ صحيح -->
<div class="bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text">
  Content
</div>

<!-- ❌ خاطئ -->
<div [style.background-color]="isDark ? '#1E293B' : 'white'">
  Content
</div>
```

## نصائح إضافية

### 1. استخدام CSS Variables (اختياري)
```scss
:root {
  --bg-primary: #ffffff;
  --text-primary: #111827;
  --border-primary: #e5e7eb;
}

.dark {
  --bg-primary: #1E293B;
  --text-primary: #F1F5F9;
  --border-primary: #334155;
}

.component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border-color: var(--border-primary);
}
```

### 2. استخدام Utility Classes
```scss
// إضافة utility classes مخصصة
@layer utilities {
  .theme-bg {
    @apply bg-white dark:bg-dark-surface;
  }
  
  .theme-text {
    @apply text-gray-900 dark:text-dark-text;
  }
  
  .theme-border {
    @apply border-gray-200 dark:border-dark-border;
  }
}
```

### 3. اختبار الأداء
```typescript
// قياس أداء تبديل الثيم
const startTime = performance.now();
this.themeService.setTheme('dark');
const endTime = performance.now();
console.log(`Theme switch took ${endTime - startTime} milliseconds`);
```

## الخلاصة

تطبيق Dark Mode على جميع مكونات الموقع يتطلب:

1. **التناسق**: استخدام نفس الألوان في جميع المكونات
2. **الانتقالات**: إضافة انتقالات سلسة لجميع العناصر
3. **الاختبار**: اختبار جميع الأوضاع على جميع الأجهزة
4. **الأداء**: التأكد من عدم تأثير التبديل على الأداء
5. **التوثيق**: توثيق جميع التغييرات للفريق

---

**تم إنشاؤه بواسطة فريق pledge Development Team**
**آخر تحديث: ديسمبر 2024** 