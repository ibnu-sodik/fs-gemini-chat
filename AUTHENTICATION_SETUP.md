# Setup Autentikasi Logto untuk Nuxt Gemini Chat

## Setup yang Telah Dikonfigurasi

### 1. Instalasi Package

```bash
npm install @logto/nuxt @logto/node
```

### 2. Konfigurasi Environment Variables

File `.env` sudah berisi variabel-variabel berikut:

```env
NUXT_LOGTO_ENDPOINT=https://57t30l.logto.app/
NUXT_LOGTO_APP_ID=60ierk4fs14k8qd53uz51
NUXT_LOGTO_APP_SECRET=oTACvAuMk5d7SHtVxusA89LcmBPLvgds
NUXT_LOGTO_COOKIE_ENCRYPTION_KEY=HRO6H6dCP2tgpTYczCpXHoXq8q2wtyRF
```

### 3. Konfigurasi Nuxt (nuxt.config.ts)

- Module `@logto/nuxt` ditambahkan
- Runtime config untuk Logto telah dikonfigurasi

### 4. Struktur File yang Dibuat

#### Halaman Autentikasi

- `pages/auth/sign-in.vue` - Halaman login
- `pages/auth/sign-out.vue` - Halaman logout
- `pages/auth/callback.vue` - Callback handler setelah login

#### API Endpoints

- `server/api/auth/signin.post.ts` - Generate URL sign in Logto
- `server/api/auth/signout.post.ts` - Generate URL sign out Logto
- `server/api/auth/me.get.ts` - Dapatkan informasi user yang login

#### Composables

- `composables/useAuth.ts` - Composable untuk manajemen autentikasi

#### Middleware

- `middleware/auth.ts` - Middleware untuk proteksi rute

#### Components

- `components/AppNavbar.vue` - Navbar dengan status autentikasi

### 5. Fitur yang Telah Diimplementasi

#### Autentikasi

- ✅ Halaman login dengan redirect ke Logto
- ✅ Halaman logout dengan cleanup session
- ✅ Callback handling setelah autentikasi
- ✅ Check status autentikasi user
- ✅ Proteksi rute untuk halaman chat

#### UI Components

- ✅ Navbar responsif dengan informasi user
- ✅ Tombol login/logout
- ✅ Loading states
- ✅ Halaman auth yang user-friendly

### 6. Konfigurasi Logto Dashboard

Untuk menyelesaikan setup, Anda perlu mengkonfigurasi di Logto dashboard:

1. **Redirect URIs** - Tambahkan URL berikut:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

2. **Post Logout Redirect URIs** - Tambahkan URL berikut:
   - `http://localhost:3000/auth/sign-in` (development)
   - `https://yourdomain.com/auth/sign-in` (production)

3. **CORS Settings** - Pastikan domain aplikasi diizinkan

### 7. Cara Menjalankan

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start development server:

   ```bash
   npm run dev
   ```

3. Akses aplikasi di `http://localhost:3000`

### 8. Flow Autentikasi

1. User mengakses halaman yang dilindungi (`/chat`)
2. Middleware auth mengecek status autentikasi
3. Jika belum login, redirect ke `/auth/sign-in`
4. User klik "Masuk dengan Logto"
5. Redirect ke Logto login page
6. Setelah berhasil login, redirect ke `/auth/callback`
7. Session dibuat dan user redirect ke halaman asal

### 9. TODO - Implementasi Lanjutan

#### Yang Perlu Diselesaikan:

- [ ] Implementasi JWT token handling yang proper
- [ ] Session management dengan cookies
- [ ] User profile management
- [ ] Integrasi dengan database user
- [ ] Error handling yang lebih robust
- [ ] Refresh token mechanism

#### File yang Perlu Diperbaiki:

- `server/api/auth/me.get.ts` - Implementasi JWT decode
- `composables/useAuth.ts` - Session management
- Database schema untuk user management

### 10. Security Considerations

- ✅ CSRF protection dengan state parameter
- ✅ Secure cookies (production)
- ✅ Environment variables untuk secrets
- ⚠️ Perlu implementasi JWT validation
- ⚠️ Perlu implementasi session timeout

### 11. Testing

Untuk testing autentikasi:

1. Akses `/chat` tanpa login → harus redirect ke login
2. Login dengan Logto → harus berhasil dan redirect ke `/chat`
3. Logout → harus clear session dan redirect ke login
4. Access navbar → harus show user info saat login

## Catatan Penting

Setup ini adalah implementasi dasar autentikasi Logto. Untuk production, pastikan:

- SSL/HTTPS enabled
- Database user management terintegrasi
- Error handling yang comprehensive
- Monitoring dan logging yang proper
