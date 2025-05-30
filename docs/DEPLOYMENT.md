# ContentCraft - Free Deployment Guide

## Overview
This guide walks you through deploying ContentCraft using completely free services. Total cost: **$0/month**.

## Prerequisites
- GitHub account (free)
- Google account (for Gemini API)
- Email account (for service signups)

---

## Step 1: Service Signups

### 1.1 Railway (Database + Backend Hosting)
1. Visit [railway.app](https://railway.app)
2. Sign up with GitHub
3. You get **$5 credit/month** (enough for free usage)

### 1.2 Vercel (Frontend Hosting)
1. Visit [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Free tier: **100GB bandwidth/month**

### 1.3 Cloudinary (File Storage)
1. Visit [cloudinary.com](https://cloudinary.com)
2. Sign up for free account
3. Free tier: **25GB storage + 25k transformations/month**

### 1.4 Google AI Studio (Gemini API)
1. Visit [ai.google.dev](https://ai.google.dev)
2. Create API key
3. Free tier: **60 requests/minute**

### 1.5 Sentry (Error Tracking) - Optional
1. Visit [sentry.io](https://sentry.io)
2. Sign up for free account
3. Free tier: **5k errors/month**

---

## Step 2: Database Setup (Railway)

### 2.1 Create Database Project
1. Log into Railway dashboard
2. Click **"New Project"**
3. Select **"Provision PostgreSQL"**
4. Wait for deployment (1-2 minutes)

### 2.2 Add Redis
1. In same project, click **"+ New Service"**
2. Select **"Add Redis"**
3. Wait for deployment

### 2.3 Get Connection Strings
1. Click on **PostgreSQL service**
2. Go to **"Connect"** tab
3. Copy **"Postgres Connection URL"**
4. Click on **Redis service**
5. Copy **"Redis Connection URL"**

**Save these URLs - you'll need them later!**

---

## Step 3: Backend Deployment (Railway)

### 3.1 Prepare Repository
1. Push your code to GitHub
2. Ensure `requirements.txt` is in `/backend` folder

### 3.2 Create Backend Service
1. In Railway project, click **"+ New Service"**
2. Select **"GitHub Repo"**
3. Connect your repository
4. Set **Root Directory**: `backend`

### 3.3 Configure Environment Variables
In Railway backend service, go to **"Variables"** tab and add:

```bash
# Database (auto-filled from Railway)
DATABASE_URL=postgresql://... (copy from PostgreSQL service)
REDIS_URL=redis://... (copy from Redis service)

# API Settings
SECRET_KEY=your-super-long-random-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=11520
ENVIRONMENT=production

# CORS (add your Vercel URL later)
ALLOWED_ORIGINS=https://your-app.vercel.app
ALLOWED_HOSTS=your-app.up.railway.app

# AI Services
GEMINI_API_KEY=your-gemini-api-key

# File Storage
CLOUDINARY_URL=cloudinary://your-cloudinary-url

# Optional
SENTRY_DSN=your-sentry-dsn
```

### 3.4 Deploy Backend
1. Railway will auto-deploy from GitHub
2. Check **"Deployments"** tab for status
3. Your API will be available at: `https://your-app.up.railway.app`

---

## Step 4: Frontend Deployment (Vercel)

### 4.1 Connect Repository
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository
4. Set **Root Directory**: `frontend`

### 4.2 Configure Environment Variables
In Vercel project settings, add environment variables:

```bash
# API Connection
NEXT_PUBLIC_API_URL=https://your-app.up.railway.app

# NextAuth
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=different-secret-from-backend

# Optional
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### 4.3 Deploy Frontend
1. Vercel will auto-deploy
2. Your app will be available at: `https://your-app.vercel.app`

---

## Step 5: Configure Services

### 5.1 Update CORS Settings
1. Go back to Railway backend service
2. Update `ALLOWED_ORIGINS` with your Vercel URL:
   ```bash
   ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:3000
   ```
3. Redeploy backend

### 5.2 Database Migrations
1. In Railway backend service, go to **"Settings"**
2. Click **"Service Settings"**
3. Add **"Start Command"**: 
   ```bash
   alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

### 5.3 Test Deployment
1. Visit your Vercel URL
2. Check if API is accessible: `https://your-app.up.railway.app/docs`
3. Test signup/login functionality

---

## Step 6: Domain Setup (Optional)

### 6.1 Free Domain Options
1. **Freenom**: Free .tk, .ml, .ga domains
2. **Use provided URLs**: Vercel and Railway provide free subdomains

### 6.2 Custom Domain (If you have one)
1. **Vercel**: Add domain in project settings
2. **Railway**: Add custom domain in service settings

---

## Step 7: Monitoring Setup

### 7.1 Uptime Monitoring (UptimeRobot)
1. Visit [uptimerobot.com](https://uptimerobot.com)
2. Sign up for free account
3. Add monitors for:
   - Frontend: `https://your-app.vercel.app`
   - Backend: `https://your-app.up.railway.app/health`

### 7.2 Error Tracking (Sentry)
1. Create new project in Sentry
2. Copy DSN
3. Add to environment variables (already done above)

---

## Step 8: CI/CD Setup (GitHub Actions)

### 8.1 Create Workflow File
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
    
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Test Frontend
        run: |
          cd frontend
          npm install
          npm run build
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - name: Test Backend
        run: |
          cd backend
          pip install -r requirements.txt
          # Add your tests here
```

---

## Usage Limits & Monitoring

### Free Tier Limits
- **Railway**: $5 credit/month (~750 hours runtime)
- **Vercel**: 100GB bandwidth/month
- **Cloudinary**: 25GB storage, 25k transformations/month
- **Gemini API**: 60 requests/minute
- **Sentry**: 5k errors/month

### Monitor Usage
1. **Railway**: Check credit usage in dashboard
2. **Vercel**: Monitor bandwidth in analytics
3. **Cloudinary**: Check usage in media library
4. **Gemini**: Monitor quota in Google AI Studio

---

## Troubleshooting

### Common Issues

#### Backend Won't Start
1. Check Railway deployment logs
2. Verify environment variables
3. Check database connection
4. Ensure requirements.txt is correct

#### Frontend Build Fails
1. Check Vercel deployment logs
2. Verify environment variables
3. Test build locally: `npm run build`
4. Check for TypeScript errors

#### Database Connection Issues
1. Verify DATABASE_URL format
2. Check Railway PostgreSQL service status
3. Test connection from Railway terminal

#### API Requests Failing
1. Check CORS settings
2. Verify API URLs
3. Check network requests in browser dev tools

### Getting Help
1. Check Railway/Vercel documentation
2. Review application logs
3. Create GitHub issue with error details
4. Check service status pages

---

## Cost Breakdown

| Service | Free Tier | Upgrade Cost |
|---------|-----------|--------------|
| Railway | $5 credit/month | $5/month for extra usage |
| Vercel | 100GB bandwidth | $20/month for Pro |
| Cloudinary | 25GB storage | $99/month for Plus |
| Gemini API | 60 req/min | Pay per use |
| Sentry | 5k errors/month | $26/month for Team |
| **Total** | **$0/month** | Upgrade as needed |

---

## Next Steps

1. **Complete Deployment**: Follow all steps above
2. **Test Thoroughly**: Ensure all features work in production
3. **Monitor Usage**: Set up alerts for free tier limits
4. **Plan Scaling**: Know when to upgrade each service
5. **Backup Strategy**: Set up automated backups

**Congratulations!** You now have a fully deployed SaaS application running on free tier services. 🎉 