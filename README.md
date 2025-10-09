# 🎓 AI-Powered Study Assistant

> An intelligent study assistant built on Cloudflare's edge infrastructure, powered by **Llama 3.3** through Workers AI, featuring real-time chat, persistent memory, and WebSocket communication.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/gunnarwrld/cf_ai_study_assistant)

**🔗 Live Demo:** [cf-ai-study-assistant.pages.dev](https://cf-ai-study-assistant.pages.dev)

---

## 📖 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Configuration](#-configuration)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Resources](#-resources)

---

## 🌟 Features

- **AI-Powered Chat**: Leverages Llama 3.3 for intelligent, context-aware responses
- **Persistent Memory**: Durable Objects store conversation history across sessions
- **Real-time Communication**: WebSocket support for instant chat experience
- **Search Functionality**: Find specific topics in your chat history
- **Global Performance**: Deployed on Cloudflare Workers for ultra-low latency
- **Stateful Sessions**: Each user gets their own isolated study session
- **Responsive UI**: Beautiful, mobile-friendly interface

---

## 🏗️ Architecture

### Tech Stack

**Backend:**

- ⚡ Cloudflare Workers - Serverless compute at the edge
- 🔄 Durable Objects - Stateful sessions with SQLite persistence
- 🤖 Workers AI - Llama 3.3 70B model
- 🔌 WebSockets - Real-time bidirectional communication

**Frontend:**

- 🎨 Vanilla JavaScript - Lightweight, fast-loading UI
- 📱 Responsive CSS3 - Mobile-first design
- 🌐 Cloudflare Pages - Static site hosting with global CDN

### Project Structure

```
cf-ai-study-assistant/
├── worker/
│   ├── index.js          # Main Worker entry point & router
│   └── study-agent.js    # Durable Object with AI logic
├── frontend/
│   ├── index.html        # Chat interface
│   ├── styles.css        # Styling & animations
│   └── app.js            # Frontend logic & WebSocket
├── wrangler.toml         # Cloudflare configuration
├── package.json          # Dependencies
├── README.md             # This file
├── ARCHITECTURE.md       # Technical deep-dive
├── TESTING.md            # Testing guide
├── PROMPTS.md            # Development journey & AI prompts
├── CONTRIBUTING.md       # Contribution guidelines
└── LICENSE               # MIT License
```

---

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v16 or higher)
2. **Cloudflare Account** (free tier works!)
3. **Wrangler CLI** installed globally:
   ```bash
   npm install -g wrangler
   ```

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/gunnarwrld/cf_ai_study_assistant.git
cd cf_ai_study_assistant

# 2. Install dependencies
npm install

# 3. Authenticate with Cloudflare
wrangler login

# 4. Start local development
npm run dev
```

Your Worker is now running at `http://localhost:8787` ���

### Test Locally

```bash
# Test health endpoint
curl http://localhost:8787/health

# Send a chat message
curl -X POST http://localhost:8787/api/chat?sessionId=test123 \
  -H "Content-Type: application/json" \
  -d '{"message": "Explain photosynthesis"}'

# Get chat history
curl http://localhost:8787/api/history?sessionId=test123

# Search chat history
curl "http://localhost:8787/api/search?sessionId=test123&q=photosynthesis"

# Clear history
curl -X DELETE http://localhost:8787/api/history?sessionId=test123
```

### Open Frontend

Open `frontend/index.html` in your browser, or use a local server:

```bash
cd frontend
npx serve .
```

Make sure `WORKER_URL` in `frontend/app.js` points to `http://localhost:8787/` for local testing.

---

## 📡 API Documentation

### REST API Endpoints

| Endpoint              | Method | Description         | Parameters                    |
| --------------------- | ------ | ------------------- | ----------------------------- |
| `/health`             | GET    | Health check        | None                          |
| `/api/chat`           | POST   | Send a chat message | `sessionId`, `message` (body) |
| `/api/history`        | GET    | Get chat history    | `sessionId`, `limit` (opt)    |
| `/api/history`        | DELETE | Clear chat history  | `sessionId`                   |
| `/api/search?q=query` | GET    | Search chat history | `sessionId`, `q`              |

### WebSocket API

**Connection URL:**

```
wss://YOUR_WORKER_URL/api/chat?sessionId=YOUR_SESSION_ID
```

**Message Types:**

```javascript
// Send a chat message
{
  "type": "chat",
  "message": "Your question here"
}

// Get history
{
  "type": "getHistory",
  "limit": 20
}

// Search
{
  "type": "search",
  "query": "search term"
}
```

**Response Format:**

```json
{
  "response": "AI response here",
  "timestamp": 1704888888888
}
```

---

## ⚙️ Configuration

### Worker Configuration (`wrangler.toml`)

```toml
name = "cf-ai-study-assistant"
main = "worker/index.js"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

# Durable Objects binding
[[durable_objects.bindings]]
name = "STUDY_AGENT"
class_name = "StudyAgent"
script_name = "cf-ai-study-assistant"

# Durable Object migrations
[[migrations]]
tag = "v1"
new_sqlite_classes = ["StudyAgent"]

# Workers AI binding
[ai]
binding = "AI"
```

### Customize AI Model

Edit `worker/study-agent.js`:

```javascript
const response = await this.env.AI.run(
  "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  {
    messages: conversationHistory,
    max_tokens: 1024, // Adjust response length
    temperature: 0.7, // Adjust creativity (0.0-1.0)
    // Alternative models:
    // '@cf/meta/llama-3.1-8b-instruct'
    // '@cf/mistral/mistral-7b-instruct-v0.1'
  }
);
```

### Environment Variables (Optional)

Create `.dev.vars` for local development:

```bash
MAX_HISTORY_MESSAGES=50
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=1024
```

---

## 🧪 Testing

### Local Testing

```bash
# Start dev server
npm run dev

# Test all endpoints
npm test  # (if test scripts are configured)
```

### Manual Testing Checklist

- [ ] Health endpoint responds: `/health`
- [ ] Chat messages receive AI responses
- [ ] Response time < 3 seconds
- [ ] Chat history persists across sessions
- [ ] Search finds relevant messages
- [ ] Clear history resets conversation
- [ ] WebSocket connection works
- [ ] Frontend UI is responsive

For detailed testing procedures, see [TESTING.md](./TESTING.md).

---

## 🚀 Deployment

### Deploy Worker

```bash
npm run deploy
```

This outputs your Worker URL: `https://cf-ai-study-assistant.YOUR_SUBDOMAIN.workers.dev`

### Deploy Frontend to Cloudflare Pages

**Option A: Via Wrangler**

```bash
# Update WORKER_URL in frontend/app.js first
npm run pages:deploy
```

**Option B: Via Dashboard**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages
2. Create a new project
3. Upload the `frontend/` folder
4. Deploy!

**Don't forget:** Update `WORKER_URL` in `frontend/app.js` to your production Worker URL and use `wss://` for WebSocket connections.

---

## 🐛 Troubleshooting

### WebSocket Connection Issues

- Ensure your Worker URL supports WebSocket upgrades
- Check browser console for connection errors
- Verify CORS settings in `worker/index.js`
- Use `wss://` (not `ws://`) in production

### Durable Object Errors

- Confirm migrations are applied in `wrangler.toml`
- Ensure proper binding name: `STUDY_AGENT`
- Check Durable Objects are enabled in your Cloudflare account
- Verify `new_sqlite_classes` migration for free tier compatibility

### Workers AI Issues

- Verify AI binding in `wrangler.toml`
- Check model name is correct: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`
- Ensure Workers AI is enabled for your account
- Check rate limits: 30 requests/min on free tier

### Deployment Errors

- Run `wrangler whoami` to verify authentication
- Check account has Workers and Durable Objects enabled
- Ensure you have a workers.dev subdomain configured
- Review Cloudflare dashboard for error logs

---

## 📊 Performance & Scaling

- **Global Edge Network**: Deployed to 300+ locations worldwide
- **Low Latency**: Average response time < 50ms
- **Auto-scaling**: Handles traffic spikes automatically
- **Stateful Sessions**: Durable Objects ensure consistency

### Free Tier Limits

- 100,000 Worker requests/day
- 1,000 Durable Object requests/day
- 30 Workers AI requests/min
- SQLite storage included with Durable Objects

---

## ��� Security & Privacy

- **Session Isolation**: Each user session is isolated in its own Durable Object
- **Data Persistence**: Chat history stored securely in Durable Object SQLite storage
- **CORS**: Configured for cross-origin requests
- **No External Data Sharing**: All data stays within your Cloudflare account
- **Input Validation**: Sanitized user input to prevent injection attacks

---

## 📚 Resources

### Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture deep-dive
- **[TESTING.md](./TESTING.md)** - Testing guide & development workflow
- **[PROMPTS.md](./PROMPTS.md)** - AI prompts used during development
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to contribute

### Cloudflare Resources

- [Workers Documentation](https://developers.cloudflare.com/workers/)
- [Durable Objects Guide](https://developers.cloudflare.com/durable-objects/)
- [Workers AI Documentation](https://developers.cloudflare.com/workers-ai/)

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎓 About This Project

This AI-powered study assistant was built as a learning project to demonstrate:

- Modern serverless architecture on Cloudflare's edge platform
- Real-time communication with WebSockets
- Stateful session management with Durable Objects
- AI integration using Workers AI (Llama 3.3)
- Full-stack development without traditional servers

**Built by:** [gunnarwrld](https://github.com/gunnarwrld)

---

**Built with ❤️ using Cloudflare's edge platform**

**⭐ If you found this helpful, consider starring the repo!**
