# Hugging Face Spaces Deployment Guide

This guide walks you through deploying the Resumelyze ML Server to Hugging Face Spaces (free tier) and connecting it to your Vercel frontend.

---

## Prerequisites

- [Hugging Face account](https://huggingface.co/join) (free)
- [Vercel account](https://vercel.com/signup) (free)
- Git installed locally

---

## Part 1: Deploy ML Server to Hugging Face Spaces

### Step 1: Create a New Space

1. Go to [huggingface.co/spaces](https://huggingface.co/spaces)
2. Click **"Create new Space"**
3. Fill in the details:
   - **Owner**: Your username
   - **Space name**: `resumelyze-ml-server` (or any name you prefer)
   - **License**: MIT
   - **Select the Space SDK**: **Docker**
   - **Hardware**: **CPU basic (free)** — perfect for this use case
   - **Visibility**: **Public** (or Private if you prefer)
4. Click **"Create Space"**

### Step 2: Upload Your ML Server Code

You have two options:

#### Option A: Using Git (Recommended)

```bash
# Navigate to your ml-server directory
cd ml-server

# Initialize git if not already done
git init

# Add HF Space as remote (replace YOUR-USERNAME and SPACE-NAME)
git remote add hf https://huggingface.co/spaces/YOUR-USERNAME/resumelyze-ml-server

# Add all files
git add .

# Commit
git commit -m "Initial deployment to HF Spaces"

# Push to HF
git push hf main
```

#### Option B: Using the Web Interface

1. In your Space page, click **"Files and versions"**
2. Click **"Add file"** → **"Upload files"**
3. Upload these files from `ml-server/`:
   - `app.py` (entry point)
   - `Dockerfile`
   - `README.md` (with HF metadata)
   - `requirements.txt`
   - `app/` (entire folder with all Python code)
   - `trained_models/` (optional, for better accuracy)
4. Click **"Commit changes to main"**

### Step 3: Wait for Build

- The Space will automatically start building (takes **5-10 minutes** on first build)
- You can watch the build logs in the **"Logs"** tab
- When complete, you'll see **"Running"** status with a green checkmark

### Step 4: Test Your ML Server

Once running, your Space URL will be:
```
https://YOUR-USERNAME-resumelyze-ml-server.hf.space
```

Test the health endpoint:
```bash
curl https://YOUR-USERNAME-resumelyze-ml-server.hf.space/health
```

You should see:
```json
{
  "status": "ok",
  "version": "2.0.0",
  "ai_available": true,
  "nlp_available": true,
  "models_loaded": {...}
}
```

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Push Your Code to GitHub

```bash
# Navigate to project root
cd ..

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR-USERNAME/resumelyze.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Add **Environment Variables**:
   ```
   ML_SERVER_URL=https://YOUR-USERNAME-resumelyze-ml-server.hf.space
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   GOOGLE_API_KEY=your_gemini_api_key
   ```
6. Click **"Deploy"**

### Step 3: Test the Integration

1. Visit your Vercel URL (e.g., `https://resumelyze.vercel.app`)
2. Go to the Analyzer page
3. Upload a resume and paste a job description
4. Click "Analyze Resume"
5. You should see results powered by your HF ML server!

---

## Part 3: Update CORS (if needed)

If you see CORS errors in the browser console:

1. Go to your HF Space
2. Edit `app/main.py`
3. Update the CORS allowed origins to include your Vercel domain:
   ```python
   allow_origins=[
       "http://localhost:3000",
       "https://resumelyze.vercel.app",  # Your production domain
       "https://*.vercel.app",  # All Vercel preview deployments
       "*"  # Remove this in production
   ]
   ```
4. Commit and push — the Space will rebuild automatically

---

## Important Notes

### Free Tier Limitations

- **Sleep after 48 hours**: The free HF Space will sleep after 48 hours of inactivity
- **Cold start**: First request after sleep takes ~20-30 seconds to wake up
- **No GPU**: The free tier uses CPU only (but that's fine for this workload)

### Upgrading (Optional)

For always-on hosting:
- HF Spaces **Persistent** tier: **$5/month** (no sleep, faster)
- Replicate API hosting: Pay-per-use
- Render/Fly.io: ~$5-7/month

### Cost Comparison

- **Current setup (Free)**:
  - Frontend: Vercel free tier ✓
  - ML Server: HF Spaces free tier ✓
  - Total: **$0/month** (with sleep)

- **Always-on setup**:
  - Frontend: Vercel hobby $20/month OR free tier ✓
  - ML Server: HF Persistent $5/month
  - Total: **$5/month** (no sleep, faster)

---

## Troubleshooting

### Space won't start
- Check build logs for errors
- Ensure `Dockerfile` is correctly formatted
- Verify all dependencies in `requirements.txt`

### 502 Bad Gateway
- Space is still building or starting up
- Wait 1-2 minutes and refresh

### CORS errors
- Update `allow_origins` in `main.py` to include your Vercel domain
- Redeploy the Space

### Slow first request
- This is normal for free tier (cold start)
- Consider upgrading to Persistent tier for always-on

---

## Success Checklist

- [ ] HF Space shows "Running" status
- [ ] `/health` endpoint returns `{"status": "ok"}`
- [ ] Vercel deployment successful
- [ ] Environment variables set in Vercel
- [ ] Resume analysis works end-to-end
- [ ] No CORS errors in browser console

---

## Next Steps

1. **Custom domain**: Add your domain to Vercel
2. **Analytics**: Add Vercel Analytics
3. **Monitoring**: Set up UptimeRobot for HF Space
4. **Caching**: Add Redis for faster repeated analyses
5. **Upgrade**: Move to HF Persistent tier when ready

---

**Your app is now live! 🎉**

Frontend: `https://your-app.vercel.app`  
ML Server: `https://your-username-resumelyze-ml-server.hf.space`
