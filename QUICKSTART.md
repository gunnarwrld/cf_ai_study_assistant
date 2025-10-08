# 🚀 Quick Start Guide

Get your AI Study Assistant up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Authenticate with Cloudflare

```bash
wrangler login
```

## Step 3: Test Locally

```bash
npm run dev
```

Your Worker will be available at `http://localhost:8787`

## Step 4: Test the Frontend

Open `frontend/index.html` in your browser, or:

```bash
cd frontend
npx serve .
```

## Step 5: Deploy to Production

Deploy the Worker:

```bash
npm run deploy
```

You'll get a URL like: `https://cf-ai-study-assistant.YOUR_SUBDOMAIN.workers.dev`

## Step 6: Update Frontend URL

Edit `frontend/app.js` and replace:

```javascript
const WORKER_URL = "https://cf-ai-study-assistant.YOUR_SUBDOMAIN.workers.dev";
```

## Step 7: Deploy Frontend to Pages

```bash
npm run pages:deploy
```

## 🎉 Done!

Your AI Study Assistant is now live!

## Need Help?

- Check `README.md` for detailed documentation
- See `PROMPTS.md` for example conversations
- Review the troubleshooting section in README.md

## Quick Test Commands

Test health:

```bash
curl https://YOUR_WORKER_URL/health
```

Test chat:

```bash
curl -X POST https://YOUR_WORKER_URL/api/chat?sessionId=test123 \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'
```

## Optional: Create KV Namespace

```bash
wrangler kv:namespace create "KV"
```

Update the ID in `wrangler.toml` with the output.

---

**Happy Learning! 🎓**
