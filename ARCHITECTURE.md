# 🎨 Architecture Diagrams

Visual representations of the AI Study Assistant architecture.

## 🌐 High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User's Browser                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Frontend (Cloudflare Pages)                │ │
│  │  - React/HTML Chat Interface                                │ │
│  │  - WebSocket Client                                         │ │
│  │  - Local Storage (Session Management)                       │ │
│  └─────────────────┬────────────────────────────────────────┬──┘ │
└────────────────────┼────────────────────────────────────────┼────┘
                     │                                         │
              WebSocket (wss://)                      HTTP/HTTPS
                     │                                         │
┌────────────────────┴────────────────────────────────────────┴────┐
│                   Cloudflare Global Network                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Cloudflare Worker (Edge Runtime)             │   │
│  │  - Request Router                                         │   │
│  │  - Session Manager                                        │   │
│  │  - CORS Handler                                           │   │
│  └─────────────────────────┬────────────────────────────────┘   │
│                            │                                     │
│  ┌─────────────────────────┴────────────────────────────────┐   │
│  │          Durable Object (StudyAgent Instance)            │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Agent Logic (Extends Agent SDK)                   │  │   │
│  │  │  - Message handling                                │  │   │
│  │  │  - History management                              │  │   │
│  │  │  - WebSocket coordination                          │  │   │
│  │  └───────────────────┬────────────────────────────────┘  │   │
│  │                      │                                    │   │
│  │  ┌───────────────────┴────────────────────────────────┐  │   │
│  │  │  Persistent Storage                                │  │   │
│  │  │  - Chat History (last 50 messages)                 │  │   │
│  │  │  - Session Metadata                                │  │   │
│  │  │  - User Preferences                                │  │   │
│  │  └───────────────────┬────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────────┘ │
│                            │                                     │
│  ┌─────────────────────────┴────────────────────────────────┐   │
│  │              Workers AI (Inference Service)              │   │
│  │  - Llama 3.3 70B Model                                   │   │
│  │  - Context Processing                                    │   │
│  │  - Response Generation                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow Diagram

### WebSocket Chat Flow

```
User Browser                Worker              Durable Object        Workers AI
     │                         │                      │                    │
     ├──WebSocket Connect──────►                     │                    │
     │   (wss://worker/chat)   │                     │                    │
     │                         ├──Get/Create DO──────►                    │
     │                         │   (session_123)     │                    │
     │                         │                     │                    │
     │                         ◄─────DO Stub─────────┤                    │
     │◄────Ack Connection──────┤                     │                    │
     │                         │                     │                    │
     ├──Send Message───────────►                     │                    │
     │   {"type":"chat",       │                     │                    │
     │    "message":"..."}     │                     │                    │
     │                         ├──Forward Msg────────►                    │
     │                         │                     │                    │
     │                         │                     ├──Prepare Context───►
     │                         │                     │   (history+prompt) │
     │                         │                     │                    │
     │                         │                     ◄──AI Response───────┤
     │                         │                     │   (generated text) │
     │                         │                     │                    │
     │                         │                     ├──Save to Storage───►
     │                         │                     │   (update history) │
     │                         │                     │                    │
     │                         ◄─────Response────────┤                    │
     │◄────AI Response─────────┤                     │                    │
     │   {"type":"response",   │                     │                    │
     │    "response":"..."}    │                     │                    │
     │                         │                     │                    │
```

### REST API Chat Flow

```
User Browser                Worker              Durable Object        Workers AI
     │                         │                      │                    │
     ├──POST /api/chat─────────►                     │                    │
     │   {message: "..."}      │                     │                    │
     │   ?sessionId=xyz        │                     │                    │
     │                         │                     │                    │
     │                         ├──Get DO Stub────────►                    │
     │                         │   (session_xyz)     │                    │
     │                         │                     │                    │
     │                         ├──Forward Request────►                    │
     │                         │                     │                    │
     │                         │                     ├──Process Msg───────►
     │                         │                     │                    │
     │                         │                     ◄──AI Response───────┤
     │                         │                     │                    │
     │                         ◄─────JSON────────────┤                    │
     │◄────HTTP 200 OK─────────┤                     │                    │
     │   {response: "...",     │                     │                    │
     │    timestamp: 123}      │                     │                    │
     │                         │                     │                    │
```

---

## 🗂️ Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         User Input                                │
│                    "What is photosynthesis?"                      │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Frontend Processing                            │
│  - Validate input                                                 │
│  - Add to UI as user message                                      │
│  - Show typing indicator                                          │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                  WebSocket/HTTP Transport                         │
│  - Send via WebSocket (preferred) or HTTP POST                    │
│  - Include session ID                                             │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      Worker Routing                               │
│  - Extract session ID                                             │
│  - Get/Create Durable Object                                      │
│  - Forward request to DO                                          │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                   Durable Object Processing                       │
│  1. Retrieve chat history from storage                            │
│  2. Add user message to history                                   │
│  3. Prepare AI context (system prompt + recent messages)          │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Workers AI Inference                           │
│  - Model: @cf/meta/llama-3.3-70b-instruct-fp8-fast               │
│  - Input: Prepared messages with context                          │
│  - Parameters: max_tokens, temperature                            │
│  - Output: Generated response text                                │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                   Response Processing                             │
│  - Add AI response to history                                     │
│  - Trim history (keep last 50)                                    │
│  - Save to persistent storage                                     │
│  - Return formatted response                                      │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Frontend Display                               │
│  - Remove typing indicator                                        │
│  - Add AI message to chat                                         │
│  - Scroll to bottom                                               │
│  - Update UI state                                                │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Session Management

```
┌─────────────────────────────────────────────────────────────────┐
│                      First Visit                                 │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
                      Generate Session ID
                   (session_timestamp_random)
                              │
                              ▼
                  Store in localStorage
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Create Durable Object Instance                      │
│  - Unique namespace: session_123456789_abc                       │
│  - Initialize empty chat history                                 │
│  - Set creation timestamp                                        │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Subsequent Visits                             │
│  - Retrieve session ID from localStorage                         │
│  - Connect to existing Durable Object                            │
│  - Load chat history                                             │
│  - Resume conversation                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧠 AI Context Building

```
User Message: "What is photosynthesis?"

                      ┌─────────────────────┐
                      │  System Prompt      │
                      │  (Study Assistant)  │
                      └──────────┬──────────┘
                                 │
                      ┌──────────▼──────────┐
                      │  Recent History     │
                      │  (Last 10 messages) │
                      └──────────┬──────────┘
                                 │
                      ┌──────────▼──────────┐
                      │  Current Message    │
                      │  "What is...?"      │
                      └──────────┬──────────┘
                                 │
                      ┌──────────▼──────────┐
                      │  Combined Context   │
                      │  Sent to AI Model   │
                      └──────────┬──────────┘
                                 │
                      ┌──────────▼──────────┐
                      │  Llama 3.3          │
                      │  Inference          │
                      └──────────┬──────────┘
                                 │
                      ┌──────────▼──────────┐
                      │  AI Response        │
                      │  "Photosynthesis    │
                      │   is..."            │
                      └─────────────────────┘
```

---

## 📦 Component Interaction

```
┌──────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   UI         │  │   WebSocket  │  │   Local Storage      │   │
│  │   Components │◄─┤   Client     │  │   (Session ID)       │   │
│  └──────────────┘  └──────┬───────┘  └──────────────────────┘   │
└─────────────────────────────┼─────────────────────────────────────┘
                              │
                      ════════╪════════
                        Internet
                      ════════╪════════
                              │
┌─────────────────────────────┼─────────────────────────────────────┐
│                   Cloudflare Edge Network                          │
│                              │                                     │
│  ┌───────────────────────────▼───────────────────────────────┐   │
│  │                      Worker Layer                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │   │
│  │  │   Router    │  │   CORS      │  │   Session       │   │   │
│  │  │   Handler   ├──┤   Handler   ├──┤   Manager       │   │   │
│  │  └─────────────┘  └─────────────┘  └────────┬────────┘   │   │
│  └──────────────────────────────────────────────┼────────────┘   │
│                                                  │                 │
│  ┌──────────────────────────────────────────────▼────────────┐   │
│  │               Durable Objects Layer                        │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │   │
│  │  │ Session  │  │ Session  │  │ Session  │  │   ...    │  │   │
│  │  │   #1     │  │   #2     │  │   #3     │  │          │  │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────┘  │   │
│  └───────┼─────────────┼─────────────┼────────────────────────   │
│          │             │             │                            │
│  ┌───────▼─────────────▼─────────────▼────────────────────────┐ │
│  │                   Persistent Storage                         │ │
│  │  - Chat histories                                            │ │
│  │  - Session metadata                                          │ │
│  │  - User preferences                                          │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              │                                     │
│  ┌───────────────────────────▼───────────────────────────────┐   │
│  │                    Workers AI Service                      │   │
│  │  - Llama 3.3 Model                                         │   │
│  │  - Inference Engine                                        │   │
│  └────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🔄 State Management

```
┌────────────────────────────────────────────────────────────┐
│                    Client State                             │
│  - Current message input                                    │
│  - Chat messages (UI display)                               │
│  - Connection status                                        │
│  - Session ID (localStorage)                                │
│  - Search query & results                                   │
└──────────────────────┬─────────────────────────────────────┘
                       │
                       │ Synchronized via WebSocket/HTTP
                       │
┌──────────────────────▼─────────────────────────────────────┐
│                  Durable Object State                       │
│  - Chat history (last 50 messages)                          │
│  - Session creation timestamp                               │
│  - Message timestamps                                       │
│  - User preferences                                         │
│                                                             │
│  Persisted to disk automatically                            │
│  Survives Worker restarts                                   │
│  Globally consistent                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Deployment Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    Developer Machine                        │
│  - Write code                                               │
│  - Test locally (wrangler dev)                              │
│  - Commit to git                                            │
└─────────────────────────┬──────────────────────────────────┘
                          │
                          │ wrangler deploy
                          ▼
┌────────────────────────────────────────────────────────────┐
│                  Cloudflare Dashboard                       │
│  - Receive deployment                                       │
│  - Validate configuration                                   │
│  - Build assets                                             │
└─────────────────────────┬──────────────────────────────────┘
                          │
                          │ Deploy to Edge
                          ▼
┌────────────────────────────────────────────────────────────┐
│              Cloudflare Global Network                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Region  │  │  Region  │  │  Region  │  │  Region  │  │
│  │   NA     │  │   EU     │  │   APAC   │  │   ...    │  │
│  │          │  │          │  │          │  │          │  │
│  │ Worker   │  │ Worker   │  │ Worker   │  │ Worker   │  │
│  │ DO       │  │ DO       │  │ DO       │  │ DO       │  │
│  │ AI       │  │ AI       │  │ AI       │  │ AI       │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                            │
│  Users connect to nearest edge location                    │
│  Durable Objects route to home location                    │
└────────────────────────────────────────────────────────────┘
```

---

**These diagrams provide visual understanding of how the AI Study Assistant works!**
