# 🎓 AI-Powered Study Assistant

An intelligent study assistant built on Cloudflare's edge infrastructure, powered by **Llama 3.3** through Workers AI, featuring real-time chat, persistent memory, and WebSocket communication.

## 🌟 Features

- **AI-Powered Chat**: Leverages Llama 3.3 for intelligent, context-aware responses
- **Persistent Memory**: Remembers conversation history across sessions using Durable Objects
- **Real-time Communication**: WebSocket support for instant chat experience
- **Chat History**: View and search through past conversations
- **Global Performance**: Deployed on Cloudflare Workers for ultra-low latency worldwide
- **Stateful Sessions**: Each user gets their own isolated study session
- **Search Functionality**: Find specific topics in your chat history
- **Responsive UI**: Beautiful, mobile-friendly interface

## 🏗️ Architecture

### Backend Stack

- **Cloudflare Workers**: Serverless compute at the edge
- **Durable Objects**: Stateful, persistent user sessions
- **Workers AI**: Llama 3.3 model for intelligent responses
- **WebSockets**: Real-time bidirectional communication

### Frontend Stack

- **Vanilla JavaScript**: Lightweight, fast-loading UI
- **Cloudflare Pages**: Static site hosting
- **WebSocket Client**: Real-time chat interface
- **Local Storage**: Session persistence

### Project Structure

```
cf-ai-study-assistant/
├── worker/
│   ├── index.js          # Main Worker entry point
│   └── study-agent.js    # Durable Object implementation
├── frontend/
│   ├── index.html        # Chat interface
│   ├── styles.css        # Styling
│   └── app.js           # Frontend logic
├── wrangler.toml         # Cloudflare configuration
├── package.json          # Dependencies
├── README.md             # This file
└── PROMPTS.md           # Example prompts
```

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v16 or higher)
2. **Cloudflare Account** (free tier works!)
3. **Wrangler CLI** installed globally:
   ```bash
   npm install -g wrangler
   ```

### Installation

1. **Clone the repository**

   ```bash
   cd "c:\Users\GUAR0009\OneDrive - Högskolan Kristianstad\HKR\SideProyects\Cloudflare AI"
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Authenticate with Cloudflare**

   ```bash
   wrangler login
   ```

4. **Create a KV namespace** (optional, for additional storage)
   ```bash
   wrangler kv:namespace create "KV"
   ```
   Update the `id` in `wrangler.toml` with the returned namespace ID.

### Local Development

1. **Start the Worker locally**

   ```bash
   npm run dev
   ```

   This starts the Worker at `http://localhost:8787`

2. **Serve the frontend**

   Open `frontend/index.html` in your browser, or use a local server:

   ```bash
   cd frontend
   npx serve .
   ```

3. **Update the Worker URL** in `frontend/app.js`:
   ```javascript
   const WORKER_URL = "http://localhost:8787";
   ```

### Deployment

1. **Deploy the Worker**

   ```bash
   npm run deploy
   ```

   This will output your Worker URL, e.g., `https://cf-ai-study-assistant.YOUR_SUBDOMAIN.workers.dev`

2. **Update frontend configuration**

   In `frontend/app.js`, update:

   ```javascript
   const WORKER_URL =
     "https://cf-ai-study-assistant.YOUR_SUBDOMAIN.workers.dev";
   ```

3. **Deploy to Cloudflare Pages**

   Option A: Via Wrangler

   ```bash
   npm run pages:deploy
   ```

   Option B: Via Dashboard

   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to Pages
   - Create a new project
   - Upload the `frontend/` folder
   - Deploy!

## 🔧 Configuration

### Worker Configuration (`wrangler.toml`)

```toml
name = "cf-ai-study-assistant"
main = "worker/index.js"
compatibility_date = "2024-01-01"

# Durable Objects binding
[[durable_objects.bindings]]
name = "STUDY_AGENT"
class_name = "StudyAgent"

# Workers AI binding
[ai]
binding = "AI"
```

### Environment Variables

You can add environment variables in `wrangler.toml`:

```toml
[vars]
ENVIRONMENT = "production"
MAX_HISTORY_MESSAGES = "50"
```

Or use secrets for sensitive data:

```bash
wrangler secret put OPENAI_API_KEY
```

## 📡 API Endpoints

### REST API

| Endpoint              | Method | Description         |
| --------------------- | ------ | ------------------- |
| `/api/chat`           | POST   | Send a chat message |
| `/api/history`        | GET    | Get chat history    |
| `/api/history`        | DELETE | Clear chat history  |
| `/api/search?q=query` | GET    | Search chat history |
| `/health`             | GET    | Health check        |

### WebSocket

Connect to `/api/chat?sessionId=YOUR_SESSION_ID` for real-time communication.

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

## 🎯 Usage Examples

### Basic Chat

```javascript
// Send a message
const response = await fetch("YOUR_WORKER_URL/api/chat?sessionId=SESSION_ID", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: "Explain quantum physics" }),
});
```

### WebSocket Chat

```javascript
const ws = new WebSocket("wss://YOUR_WORKER_URL/api/chat?sessionId=SESSION_ID");

ws.onopen = () => {
  ws.send(
    JSON.stringify({
      type: "chat",
      message: "What is machine learning?",
    })
  );
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("AI Response:", data.response);
};
```

## 🧪 Testing

Test the Worker locally:

```bash
# Test health endpoint
curl http://localhost:8787/health

# Test chat endpoint
curl -X POST http://localhost:8787/api/chat?sessionId=test123 \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'
```

## 🔒 Security & Privacy

- **Session Isolation**: Each user session is isolated in its own Durable Object
- **Data Persistence**: Chat history is stored securely in Durable Object storage
- **CORS**: Configured for cross-origin requests
- **No External Data Sharing**: All data stays within your Cloudflare account

## 📈 Scaling & Performance

- **Global Edge Network**: Deployed to 300+ locations worldwide
- **Low Latency**: Average response time < 50ms
- **Auto-scaling**: Handles traffic spikes automatically
- **Stateful Sessions**: Durable Objects ensure consistency
- **Cost-effective**: Free tier includes:
  - 100,000 Worker requests/day
  - 1,000 Durable Object requests/day
  - 30 requests/min for Workers AI

## 🛠️ Customization

### Change AI Model

In `worker/study-agent.js`, modify the model:

```javascript
const response = await this.env.AI.run(
  "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  {
    // Or use other models:
    // '@cf/meta/llama-3.1-8b-instruct'
    // '@cf/mistral/mistral-7b-instruct-v0.1'
    messages: aiMessages,
  }
);
```

### Adjust System Prompt

Customize the AI's behavior in `prepareAIContext()`:

```javascript
const systemPrompt = {
  role: "system",
  content: "Your custom instructions here...",
};
```

### Modify UI Theme

Edit CSS variables in `frontend/styles.css`:

```css
:root {
  --primary-color: #your-color;
  --secondary-color: #your-color;
}
```

## 🐛 Troubleshooting

### WebSocket Connection Issues

- Ensure your Worker URL supports WebSocket upgrades
- Check browser console for connection errors
- Verify CORS settings in `worker/index.js`

### Durable Object Errors

- Confirm migrations are applied: check `wrangler.toml`
- Ensure proper binding name: `STUDY_AGENT`
- Check Durable Objects are enabled in your Cloudflare account

### Workers AI Issues

- Verify AI binding in `wrangler.toml`
- Check model name is correct
- Ensure Workers AI is enabled for your account

## 📚 Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Durable Objects Guide](https://developers.cloudflare.com/durable-objects/)
- [Workers AI Documentation](https://developers.cloudflare.com/workers-ai/)
- [Agents SDK](https://developers.cloudflare.com/agents/)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Cloudflare Chat Agent Starter Kid GitHub Repo]([https://developers.cloudflare.com/pages/](https://github.com/cloudflare/agents-starter?tab=readme-ov-file))

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

MIT License - feel free to use this project for learning and development!

## 🎓 Assignment Notes

This project fulfills the AI-powered study assistant requirements:

✅ Backend on Cloudflare Workers  
✅ AI Model: Llama 3.3 via Workers AI  
✅ State management with Durable Objects  
✅ Frontend on Cloudflare Pages  
✅ Real-time WebSocket communication  
✅ Persistent chat memory  
✅ Search functionality  
✅ Comprehensive documentation  
✅ Example prompts in PROMPTS.md

---

**Built with ❤️ using Cloudflare's edge platform**
