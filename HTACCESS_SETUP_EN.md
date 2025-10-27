# .htaccess Setup for Angular Application

## 🔴 The Problem

When reloading a page in Angular application, you get 404 error:
```
Error 404 - Not Found
The document you are looking for may have been removed or re-named.
```

**Why?**
- Angular uses Client-Side Routing
- On reload, browser requests the page directly from server
- Server doesn't find the requested page (like `/products/123`) because it's an Angular route, not a real file
- Server returns 404 error

## ✅ The Solution

Use `.htaccess` file to redirect all requests to `index.html` so Angular Router can handle the routing.

## 📝 Modified Files

### 1. `.htaccess` File
Location: `src/.htaccess`

#### Features:
```apache
# ✅ Redirect all requests to index.html
RewriteRule ^ /index.html [L]

# ✅ GZIP compression (faster loading)
AddOutputFilterByType DEFLATE text/html text/css application/javascript

# ✅ Browser Caching
- Images: 1 year
- CSS/JS: 1 month
- HTML: no cache

# ✅ Security Headers
- X-Frame-Options: Clickjacking protection
- X-XSS-Protection: XSS protection
- X-Content-Type-Options: Prevent MIME sniffing

# ✅ Disable directory browsing
Options -Indexes

# ✅ Error pages
- 404, 403, 500 → redirect to index.html
```

### 2. `angular.json` File
Added `.htaccess` to assets array to copy it to `dist` folder:

```json
"assets": [
  { "glob": "**/*", "input": "public" },
  { "glob": "**/*", "input": "src/assets" },
  { "glob": ".htaccess", "input": "src", "output": "/" }
],
```

## 🚀 How to Use

### 1. Local Development
```bash
ng serve
```
No need for .htaccess in development - Angular CLI handles routing automatically.

### 2. Build
```bash
# Production build
ng build --configuration=production

# Development build
ng build --configuration=development
```

### 3. Server Deployment
After building, upload contents of `dist/pledge-website/browser/` to your server.

Make sure `.htaccess` file is in the root with `index.html`.

**Server file structure:**
```
public_html/
├── .htaccess          ← Very important!
├── index.html
├── main.*.js
├── polyfills.*.js
├── styles.*.css
└── assets/
```

## 🔧 Server Requirements

### Apache Server
Make sure `mod_rewrite` is enabled:
```bash
sudo a2enmod rewrite
sudo service apache2 restart
```

### cPanel / Shared Hosting
`.htaccess` works automatically (usually).

### Nginx Server
Use this in configuration file:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## ✨ Additional Features

### 1. GZIP Compression
Reduces file size by 60-70%:
- HTML, CSS, JS, JSON, XML → all compressed

### 2. Browser Caching
Improves speed for returning visitors:
- **Images**: cached for 1 year
- **CSS/JS**: cached for 1 month
- **HTML**: no cache (get latest updates)

### 3. Security Headers
Extra protection for your site:
- **X-Frame-Options**: Prevents Clickjacking
- **X-XSS-Protection**: XSS attack protection
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **Referrer-Policy**: Controls referrer information

### 4. Hide Directory Contents
`Options -Indexes` prevents listing files if accessing a directory directly.

## 🧪 Testing

### 1. Local Testing
After building, use a local server:
```bash
# Using http-server
npx http-server dist/pledge-website/browser -p 8080

# Or using serve
npx serve -s dist/pledge-website/browser
```

### 2. Test Different Routes
- Open `http://localhost:8080/products`
- Reload (F5 or Ctrl+R)
- Should work without 404 error!

### 3. Test GZIP Compression
```bash
curl -H "Accept-Encoding: gzip" -I http://your-domain.com/main.js
```
Should see: `Content-Encoding: gzip`

## 🐛 Troubleshooting

### Problem: Still getting 404 error
**Solutions:**
1. Ensure `.htaccess` is in same directory as `index.html`
2. Check that `mod_rewrite` is enabled on Apache
3. Check file permissions: `chmod 644 .htaccess`
4. Review server error logs

### Problem: "Internal Server Error 500"
**Solutions:**
1. Check `.htaccess` syntax
2. Server may not support some directives
3. Try disabling parts of the file one by one

### Problem: File not copied to dist/
**Solutions:**
1. Make sure `angular.json` is updated
2. Delete `dist/` folder and rebuild
3. Verify path in assets configuration

## 📚 Additional Resources

- [Angular Deployment Guide](https://angular.io/guide/deployment)
- [Apache mod_rewrite Documentation](https://httpd.apache.org/docs/current/mod/mod_rewrite.html)
- [Web Security Headers Guide](https://owasp.org/www-project-secure-headers/)

## ✅ Pre-Deployment Checklist

- [ ] `.htaccess` file in `src/`
- [ ] Updated `angular.json` to copy `.htaccess`
- [ ] Built project: `ng build --configuration=production`
- [ ] Verified `.htaccess` exists in `dist/pledge-website/browser/`
- [ ] Uploaded all `dist/pledge-website/browser/` files to server
- [ ] Tested different routes
- [ ] Tested reload on different routes
- [ ] Verified security headers work
- [ ] Tested GZIP compression

## 🎉 Result

Now you can:
- ✅ Reload any page without 404 error
- ✅ Share direct links to pages
- ✅ Faster website (GZIP + Caching)
- ✅ Better security (Security Headers)
- ✅ Improved user experience

---

**Note:** If you're using Nginx instead of Apache, you'll need a different configuration file. Refer to the documentation above for details.
