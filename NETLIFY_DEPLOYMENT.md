# 🚀 Panduan Deploy ke Netlify

## Persiapan Sebelum Deploy

### 1. Setup Database Production

- Pilih salah satu provider PostgreSQL (Railway, Supabase, atau Neon)
- Buat database baru
- Catat connection string yang diberikan
- Lihat `DATABASE_SETUP.md` untuk detail lengkap

### 2. Setup Environment Variables

Siapkan semua environment variables berikut:

- `DATABASE_URL` - PostgreSQL connection string
- `GOOGLE_API_KEY` - Google Gemini API key
- `NUXT_LOGTO_APP_SECRET` - Logto app secret
- `NUXT_LOGTO_COOKIE_ENCRYPTION_KEY` - Logto cookie encryption key
- `NUXT_LOGTO_ENDPOINT` - Logto endpoint URL
- `NUXT_LOGTO_APP_ID` - Logto app ID
- `APP_NAME` - Application name (optional)

## Deploy Steps

### Method 1: Deploy via Git (Recommended)

1. **Push ke GitHub/GitLab**

   ```bash
   git add .
   git commit -m "Ready for Netlify deployment"
   git push origin main
   ```

2. **Connect ke Netlify**
   - Login ke [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect repository
   - Pilih repository Anda

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.output/public`
   - Node version: 18

4. **Set Environment Variables**
   - Go to Site settings > Environment variables
   - Add semua environment variables yang diperlukan

5. **Deploy**
   - Click "Deploy site"
   - Tunggu proses build selesai

### Method 2: Deploy via Netlify CLI

1. **Install Netlify CLI**

   ```bash
   npm install -g netlify-cli
   ```

2. **Login ke Netlify**

   ```bash
   netlify login
   ```

3. **Build Project**

   ```bash
   npm run build
   ```

4. **Deploy**
   ```bash
   netlify deploy --prod --dir=.output/public
   ```

## Post-Deployment

### 1. Migrate Database

Setelah deploy berhasil, migrate database production:

```bash
# Set DATABASE_URL environment variable locally to production database
npx prisma db push
```

### 2. Update Logto Callback URLs

- Login ke Logto console
- Update callback URLs dengan domain Netlify Anda
- Format: `https://your-site-name.netlify.app/auth/callback`

### 3. Test Deployment

- Buka website di browser
- Test login functionality
- Test chat functionality
- Check database connections

## Troubleshooting

### Build Errors

- Check build logs di Netlify dashboard
- Ensure semua environment variables ter-set
- Check Node version compatibility

### Database Issues

- Verify DATABASE_URL format
- Ensure database accessible dari internet
- Check migration status

### Authentication Issues

- Verify Logto callback URLs
- Check environment variables
- Test authentication flow

## Environment Variables Template

```
DATABASE_URL=postgresql://username:password@host:port/database
GOOGLE_API_KEY=your_google_api_key
NUXT_LOGTO_APP_SECRET=your_logto_secret
NUXT_LOGTO_COOKIE_ENCRYPTION_KEY=your_encryption_key
NUXT_LOGTO_ENDPOINT=https://your-logto-endpoint.logto.app
NUXT_LOGTO_APP_ID=your_app_id
APP_NAME=Nuxt Gemini Chatbot
```

## Tips

1. **Always test locally** dengan production environment variables sebelum deploy
2. **Monitor build logs** untuk error debugging
3. **Use preview deployments** untuk testing changes
4. **Setup custom domain** setelah testing berhasil
5. **Enable form detection** jika menggunakan forms
