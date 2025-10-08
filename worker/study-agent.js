import { Agent } from "agents";

/**
 * StudyAgent - A Durable Object that manages individual user study sessions
 * Extends the Agent class for built-in state management, scheduling, and AI capabilities
 */
export class StudyAgent extends Agent {
  constructor(state, env) {
    super(state, env);
    this.state = state;
    this.env = env;
  }

  /**
   * Initialize the agent's state on first access
   */
  async initialize() {
    const existingHistory = await this.state.storage.get("chatHistory");
    if (!existingHistory) {
      await this.state.storage.put("chatHistory", []);
      await this.state.storage.put("createdAt", Date.now());
    }
  }

  /**
   * Handle incoming chat messages
   */
  async handleMessage(message) {
    await this.initialize();

    // Get chat history
    const chatHistory = (await this.state.storage.get("chatHistory")) || [];

    // Add user message to history
    const userMessage = {
      role: "user",
      content: message,
      timestamp: Date.now(),
    };
    chatHistory.push(userMessage);

    // Prepare messages for AI with context
    const aiMessages = this.prepareAIContext(chatHistory);

    // Get AI response using Workers AI (Llama 3.3)
    let aiResponse;
    try {
      const response = await this.env.AI.run(
        "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
        {
          messages: aiMessages,
          max_tokens: 1024,
          temperature: 0.7,
          stream: false,
        }
      );

      aiResponse = response.response || response;
    } catch (error) {
      console.error("AI Error:", error);
      aiResponse =
        "Sorry, I encountered an error processing your request. Please try again.";
    }

    // Add AI response to history
    const assistantMessage = {
      role: "assistant",
      content: aiResponse,
      timestamp: Date.now(),
    };
    chatHistory.push(assistantMessage);

    // Store updated history (keep last 50 messages to manage storage)
    const trimmedHistory = chatHistory.slice(-50);
    await this.state.storage.put("chatHistory", trimmedHistory);

    return {
      response: aiResponse,
      timestamp: assistantMessage.timestamp,
    };
  }

  /**
   * Prepare AI context with system prompt and recent history
   */
  prepareAIContext(chatHistory) {
    const systemPrompt = {
      role: "system",
      content: `You are an AI-powered study assistant. Your goal is to help students learn effectively by:
- Answering questions clearly and concisely
- Explaining complex topics in simple terms
- Providing examples and analogies when helpful
- Encouraging critical thinking
- Remembering previous conversations to provide contextual help
- Suggesting study techniques and memory aids

Be friendly, supportive, and educational. Keep responses focused and helpful.`,
    };

    // Include recent history for context (last 10 messages)
    const recentHistory = chatHistory.slice(-10).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    return [systemPrompt, ...recentHistory];
  }

  /**
   * Get chat history for a user
   */
  async getChatHistory(limit = 20) {
    await this.initialize();
    const chatHistory = (await this.state.storage.get("chatHistory")) || [];
    return chatHistory.slice(-limit);
  }

  /**
   * Clear chat history
   */
  async clearHistory() {
    await this.state.storage.put("chatHistory", []);
    return { success: true, message: "Chat history cleared" };
  }

  /**
   * Search through chat history
   */
  async searchHistory(query) {
    await this.initialize();
    const chatHistory = (await this.state.storage.get("chatHistory")) || [];

    const results = chatHistory.filter((msg) =>
      msg.content.toLowerCase().includes(query.toLowerCase())
    );

    return results;
  }

  /**
   * Handle HTTP requests to the Durable Object
   */
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle WebSocket upgrade
    if (request.headers.get("Upgrade") === "websocket") {
      return this.handleWebSocket(request);
    }

    // REST API endpoints
    if (path === "/chat" && request.method === "POST") {
      const { message } = await request.json();
      const response = await this.handleMessage(message);
      return new Response(JSON.stringify(response), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (path === "/history" && request.method === "GET") {
      const limit = parseInt(url.searchParams.get("limit") || "20");
      const history = await this.getChatHistory(limit);
      return new Response(JSON.stringify(history), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (path === "/history" && request.method === "DELETE") {
      const result = await this.clearHistory();
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (path === "/search" && request.method === "GET") {
      const query = url.searchParams.get("q");
      const results = await this.searchHistory(query);
      return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404 });
  }

  /**
   * Handle WebSocket connections for real-time chat
   */
  async handleWebSocket(request) {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // Accept the WebSocket connection
    server.accept();

    // Handle incoming WebSocket messages
    server.addEventListener("message", async (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "chat") {
          const response = await this.handleMessage(data.message);
          server.send(
            JSON.stringify({
              type: "response",
              ...response,
            })
          );
        } else if (data.type === "getHistory") {
          const history = await this.getChatHistory(data.limit || 20);
          server.send(
            JSON.stringify({
              type: "history",
              history,
            })
          );
        } else if (data.type === "search") {
          const results = await this.searchHistory(data.query);
          server.send(
            JSON.stringify({
              type: "searchResults",
              results,
            })
          );
        }
      } catch (error) {
        server.send(
          JSON.stringify({
            type: "error",
            message: error.message,
          })
        );
      }
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
}

export default StudyAgent;
