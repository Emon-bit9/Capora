# 🚀 Capora - AI-Powered Social Media Content Creation Platform

<div align="center">
  <img src="https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=CAPORA" alt="Capora Logo" />
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://python.org)
  [![Node.js](https://img.shields.io/badge/Node.js-18-green.svg)](https://nodejs.org)
  [![Cloud Ready](https://img.shields.io/badge/Cloud-Ready-blue.svg)](https://render.com)
  [![Free Deployment](https://img.shields.io/badge/Deploy-FREE-success.svg)](https://vercel.com)
</div>

## 📖 Overview

Capora is a comprehensive AI-powered SaaS platform that transforms your video content into optimized posts for multiple social media platforms. Upload once, publish everywhere with AI-generated captions and platform-specific optimizations.

**🎉 Deploy for FREE on cloud services - no server costs, no subscriptions!**

### ✨ Key Features

- 🎬 **Multi-Platform Video Processing** - Automatic optimization for TikTok, Instagram, YouTube Shorts, Facebook, and Twitter
- 🤖 **AI Caption Generation** - Google Gemini-powered captions with customizable tone and niche targeting
- 📱 **Platform-Specific Aspect Ratios** - Perfect 9:16 for vertical platforms, 1:1 for Facebook, 16:9 for Twitter
- 🎯 **Smart Content Workflow** - Upload → Process → Review → Publish seamlessly
- 📊 **Analytics Dashboard** - Track performance across all platforms
- 🔒 **Production-Ready Security** - JWT authentication, rate limiting, SSL support
- ☁️ **Free Cloud Deployment** - Deploy to Render + Vercel for $0/month

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   (PostgreSQL)  │
│   Vercel FREE   │    │   Render FREE   │    │   Render FREE   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   File Storage  │              │
         └──────────────►│   (Temporary)   │◄─────────────┘
                        │   Render FREE   │
                        └─────────────────┘
                                 │
                        ┌─────────────────┐
                        │   AI Services   │
                        │   (Gemini API)  │
                        └─────────────────┘
```

## 🚀 Quick Start - FREE Cloud Deployment

### Prerequisites

- [GitHub](https://github.com) account (free)
- [Render](https://render.com) account (free)
- [Vercel](https://vercel.com) account (free)

### 1. Clone & Push to GitHub

```bash
git clone https://github.com/yourusername/capora.git
cd capora

# Create your own repository
git remote set-url origin https://github.com/YOUR_USERNAME/capora.git
git push -u origin main
```

### 2. Deploy Backend to Render (FREE)

1. Go to [render.com](https://render.com) → Sign up/Login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `capora-backend`
   - **Environment**: Python
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: FREE

### 3. Deploy Frontend to Vercel (FREE)

1. Go to [vercel.com](https://vercel.com) → Sign up/Login
2. Click "New Project" → Import your GitHub repo
3. Configure:
   - **Framework**: Next.js
   - **Root Directory**: `frontend`
   - **Plan**: FREE

### 4. Access Your Live App

- **Your App**: `https://your-app.vercel.app`
- **API**: `https://your-backend.onrender.com`

**🎉 That's it! Your app is live 24/7 for FREE!**

## 📋 Detailed Deployment Guide

For step-by-step instructions with screenshots, see: **[DEPLOYMENT.md](DEPLOYMENT.md)**

## 💰 Free Tier Limits

### What You Get for FREE:

**Render (Backend + Database):**
- ✅ 750 hours/month (24/7 uptime)
- ✅ 512MB RAM
- ✅ PostgreSQL database (1GB)
- ✅ SSL certificates
- ⚠️ Sleeps after 15min inactivity

**Vercel (Frontend):**
- ✅ 100GB bandwidth/month
- ✅ Unlimited static deployments
- ✅ SSL certificates
- ✅ Global CDN

**Total Cost: $0/month** 🎉

## 🛠️ Local Development

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔧 Configuration

### Required API Keys

1. **Google Gemini API** (FREE tier available)
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create API key
   - Add to Render environment variables

### Environment Variables

Set these in your Render dashboard:

| Variable | Description | Required |
|----------|-------------|----------|
| `SECRET_KEY` | JWT secret (auto-generated) | ✅ |
| `DATABASE_URL` | PostgreSQL URL (auto-set) | ✅ |
| `GEMINI_API_KEY` | Google AI API key | ✅ |
| `ENVIRONMENT` | Set to `production` | ✅ |
| `ALLOWED_ORIGINS` | Your Vercel app URL | ✅ |

## 📱 Platform Support

| Platform | Aspect Ratio | Max Duration | Status |
|----------|-------------|--------------|--------|
| TikTok | 9:16 | 60s | ✅ |
| Instagram Reels | 9:16 | 60s | ✅ |
| YouTube Shorts | 9:16 | 60s | ✅ |
| Facebook | 16:9 | 120s | ✅ |
| Twitter | 16:9 | 120s | ✅ |

## 🤖 AI Features

- **Smart Caption Generation** - Context-aware captions
- **Tone Customization** - Professional, casual, fun, motivational
- **Niche Targeting** - Fitness, food, education, lifestyle, business, tech
- **Hashtag Optimization** - Platform-specific hashtag suggestions

## 🔒 Security Features

- JWT Authentication
- Password hashing (bcrypt)
- Rate limiting
- CORS protection
- Input validation
- SQL injection prevention

## 📊 Analytics

- Video performance tracking
- Platform-specific metrics
- Engagement analytics
- Content optimization insights

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14
- React 18
- Tailwind CSS
- TypeScript

**Backend:**
- FastAPI
- SQLAlchemy
- PostgreSQL
- Google Gemini AI

**Deployment:**
- Vercel (Frontend)
- Render (Backend + DB)
- GitHub (Source control)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

- 📧 Email: support@capora.app
- 💬 Discord: [Join our community](https://discord.gg/capora)
- 📖 Documentation: [docs.capora.app](https://docs.capora.app)

---

<div align="center">
  <p>Made with ❤️ for content creators worldwide</p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div> 