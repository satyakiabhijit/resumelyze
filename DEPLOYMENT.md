# Deployment Guide — Resumelyze

Deploy the **frontend** on Vercel (free tier).

---

## 🚀 Frontend Deployment (Vercel)

### Prerequisites
- [Vercel account](https://vercel.com) (free tier)
- [Google AI Studio API Key](https://makersuite.google.com/app/apikey)
- GitHub repository

### Steps

#### 1. Get Your Google API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key (or use an existing one)
3. **Keep it secure** - never commit this key to git!

#### 2. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 3. Deploy on Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository (`satyakiabhijit/resumelyze`)
3. Configure project:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

#### 4. Add Environment Variable
In Vercel Project Settings → Environment Variables, add:

```
GOOGLE_API_KEY=your_actual_api_key_here
```

**⚠️ Important**: Replace `your_actual_api_key_here` with your real API key from step 1.

Apply to: **Production**, **Preview**, and **Development** environments.

#### 5. Deploy
Click **Deploy** and wait for the build to complete (~2-3 minutes).

#### 6. Test Your Deployment
1. Visit your deployed URL (e.g., `https://resumelyze.vercel.app`)
2. Upload a resume and job description
3. Verify all analysis modes work correctly

---

## 🔍 Local Development

### Setup
1. Clone the repository:
```bash
git clone https://github.com/satyakiabhijit/resumelyze.git
cd resumelyze/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file (never commit this!):
```bash
GOOGLE_API_KEY=your_actual_api_key_here
```

4. Run development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

---

## 📊 Monitoring & Logs

### Vercel Dashboard
- View deployment status: `vercel.com/your-project`
- Check logs: Project → Deployments → [Select deployment] → Logs
- Analytics: Project → Analytics

### Check API Health
```bash
curl https://your-app.vercel.app/api/health
```

---

## 🔐 Security Best Practices

### ✅ DO
- Store API keys in environment variables only
- Use `.env.local` for local development
- Add `.env*.local` to `.gitignore`
- Rotate API keys if exposed
- Use Vercel's secure environment variables

### ❌ DON'T
- Never commit API keys to git
- Don't hardcode secrets in code
- Don't share `.env.local` files
- Don't expose keys in documentation
- Don't push `.env` files to GitHub

---

## 🆘 Troubleshooting

### Build Fails
- Check Vercel logs for specific errors
- Verify all dependencies are in `package.json`
- Ensure Node.js version compatibility

### API Key Issues
- Verify key is set in Vercel environment variables
- Check key has proper permissions in Google AI Studio
- Test key locally first with `.env.local`

### 429 Rate Limit Errors
- Google AI Studio free tier has limits
- Consider implementing request caching
- Add rate limiting to API routes

---

## 🔄 Updates & Redeployment

Vercel automatically redeploys on every push to `main`:
```bash
git add .
git commit -m "Your update message"
git push origin main
```

Or deploy manually:
```bash
npm install -g vercel
vercel --prod
```

---

## 📚 Additional Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Google AI Studio](https://ai.google.dev)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
