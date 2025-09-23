# Database Deployment Guide

## Option 1: PostgreSQL di Railway (Recommended)

1. Buat akun di https://railway.app
2. Create new project
3. Add PostgreSQL service
4. Copy connection string yang diberikan
5. Set sebagai DATABASE_URL di Netlify

## Option 2: PostgreSQL di Supabase

1. Buat akun di https://supabase.com
2. Create new project
3. Pilih region terdekat
4. Copy connection string dari Settings > Database
5. Set sebagai DATABASE_URL di Netlify

## Option 3: PostgreSQL di Neon

1. Buat akun di https://neon.tech
2. Create new project
3. Copy connection string
4. Set sebagai DATABASE_URL di Netlify

## Migrate Database

Setelah setup database production:

1. Set DATABASE_URL di environment variables lokal
2. Run: npx prisma db push
3. Run: npx prisma db seed (jika ada)
