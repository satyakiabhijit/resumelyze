# Deployment Guide — Resumelyze

Deploy the **backend** on Fly.io (free) and the **frontend** on Vercel (free).

---

## 🚀 Backend Deployment (Fly.io)

### Prerequisites
- [Fly.io account](https://fly.io) (free tier)
- [Flyctl CLI](https://fly.io/docs/hands-on/install-flyctl/) installed

### Steps

1. **Install Flyctl** (if not installed):
```powershell
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

2. **Login to Fly.io**:
```bash
flyctl auth login
```

3. **Launch the app** (creates fly.toml — already included):
```bash
flyctl launch --name resumelyze-api --region ord --no-deploy
```
- Choose **y** to copy existing config (fly.toml)
- Choose **n** for PostgreSQL database (not needed)
- Choose **n** for Redis (not needed)

4. **Set secrets** (your API key):
```bash
flyctl secrets set GOOGLE_API_KEY="AIzaSyAocF6OPp4qZ1hoZM9sZu-J3tDIh0HkrOw"
```

5. **Deploy**:
```bash
flyctl deploy
```

6. **Get your backend URL**:
```bash
flyctl info
```
Your API will be at: `https://resumelyze-api.fly.dev`

7. **Test the API**:
```bash
curl https://resumelyze-api.fly.dev/health
```

### Monitoring & Logs
```bash
# View logs
flyctl logs

# Check status
flyctl status

# Open dashboard
flyctl dashboard
```

---

## 🎨 Frontend Deployment (Vercel)

### Prerequisites
- [Vercel account](https://vercel.com) (free tier)
- GitHub repository (push your code)

### Steps

1. **Push to GitHub**:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Deploy on Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (auto-detected)

3. **Set Environment Variables** in Vercel:
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     Name: NEXT_PUBLIC_API_URL
     Value: https://resumelyze-api.fly.dev
     ```
   - Apply to: Production, Preview, Development

4. **Deploy**:
   - Click **Deploy**
   - Vercel will build and deploy your frontend

5. **Get your frontend URL**:
   - Your site will be at: `https://your-project-name.vercel.app`

6. **Update CORS** (if needed):
   - In `backend/config.py`, ensure your Vercel URL is in `CORS_ORIGINS`
   - Already configured to allow `*.vercel.app`

---

## 🔄 Continuous Deployment

### Backend (Fly.io)
Every time you push changes:
```bash
flyctl deploy
```

Or set up GitHub Actions:
```yaml
# .github/workflows/deploy-backend.yml
name: Deploy Backend
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

### Frontend (Vercel)
- Automatic: Every push to `main` triggers a new deployment
- Preview: Every pull request gets a preview URL

---

## 🧪 Testing Production

1. **Test backend**:
```bash
curl -X POST https://resumelyze-api.fly.dev/api/analyze \
  -F "job_description=Python developer" \
  -F "resume_text=5 years Python experience" \
  -F "mode=ai"
```

2. **Test frontend**:
- Visit your Vercel URL
- Upload a resume and job description
- Verify the analysis works

---

## 💰 Cost

Both services have generous free tiers:

| Service | Free Tier | What You Get |
|---------|-----------|--------------|
| **Fly.io** | Yes | 3 shared-cpu VMs with 256MB RAM each (enough for our API) |
| **Vercel** | Yes | 100GB bandwidth/month, unlimited deployments |

---

## 🐛 Troubleshooting

### Backend not responding
```bash
# Check logs
flyctl logs

# Restart app
flyctl apps restart resumelyze-api
```

### CORS errors
- Ensure `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Check backend logs for CORS warnings
- Verify `CORS_ORIGINS` in `backend/config.py` includes your Vercel domain

### API key not working
```bash
# Update secret
flyctl secrets set GOOGLE_API_KEY="your-new-key"

# Restart app
flyctl apps restart resumelyze-api
```

---

## 📊 Custom Domain (Optional)

### Backend
```bash
flyctl certs add api.yourdomain.com
```

### Frontend
- Vercel Settings → Domains → Add Domain
- Follow DNS instructions

---

## 🔐 Security Notes

- **Never commit `.env`** — already in `.gitignore`
- Use Fly secrets for API keys
- Use Vercel environment variables for frontend config
- Enable HTTPS (automatic on both platforms)

---

Need help? Check:
- [Fly.io Docs](https://fly.io/docs/)
- [Vercel Docs](https://vercel.com/docs)
- [Project Issues](https://github.com/satyakiabhijit/resumelyze/issues)
