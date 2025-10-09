// Configuration
const WORKER_URL = 'https://cf-ai-study-assistant.gunnarwrld.workers.dev/'
  window.location.hostname === "localhost"
    ? "http://localhost:8787"
    : "https://cf-ai-study-assistant.YOUR_SUBDOMAIN.workers.dev";

// State
let sessionId = localStorage.getItem("sessionId") || generateSessionId();
let ws = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// DOM Elements
const messagesContainer = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");
const historyBtn = document.getElementById("historyBtn");
const searchBtn = document.getElementById("searchBtn");
const searchPanel = document.getElementById("searchPanel");
const searchInput = document.getElementById("searchInput");
const searchSubmitBtn = document.getElementById("searchSubmitBtn");
const closeSearchBtn = document.getElementById("closeSearchBtn");
const searchResults = document.getElementById("searchResults");
const connectionStatus = document.getElementById("connectionStatus");
const statusText = document.getElementById("statusText");

// Initialize
function init() {
  localStorage.setItem("sessionId", sessionId);
  setupEventListeners();
  connectWebSocket();
  loadChatHistory();
}

function generateSessionId() {
  return (
    "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
  );
}

// WebSocket Connection
function connectWebSocket() {
  const wsUrl =
    WORKER_URL.replace("http", "ws") + `/api/chat?sessionId=${sessionId}`;

  try {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
      updateConnectionStatus(true);
      reconnectAttempts = 0;
    };

    ws.onmessage = (event) => {
      handleWebSocketMessage(JSON.parse(event.data));
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      updateConnectionStatus(false);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      updateConnectionStatus(false);
      attemptReconnect();
    };
  } catch (error) {
    console.error("Failed to connect WebSocket:", error);
    updateConnectionStatus(false);
  }
}

function attemptReconnect() {
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    reconnectAttempts++;
    console.log(
      `Reconnecting... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`
    );
    setTimeout(connectWebSocket, 2000 * reconnectAttempts);
  }
}

function handleWebSocketMessage(data) {
  if (data.type === "response") {
    removeTypingIndicator();
    addMessage("assistant", data.response, data.timestamp);
  } else if (data.type === "history") {
    displayHistory(data.history);
  } else if (data.type === "searchResults") {
    displaySearchResults(data.results);
  } else if (data.type === "error") {
    removeTypingIndicator();
    addMessage("assistant", `Error: ${data.message}`, Date.now());
  }
}

function updateConnectionStatus(isConnected) {
  if (isConnected) {
    connectionStatus.className = "status-dot online";
    statusText.textContent = "Connected";
  } else {
    connectionStatus.className = "status-dot offline";
    statusText.textContent = "Disconnected";
  }
}

// Event Listeners
function setupEventListeners() {
  sendBtn.addEventListener("click", sendMessage);

  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  messageInput.addEventListener("input", autoResize);

  clearBtn.addEventListener("click", clearChat);
  historyBtn.addEventListener("click", showHistory);
  searchBtn.addEventListener("click", toggleSearch);
  searchSubmitBtn.addEventListener("click", performSearch);
  closeSearchBtn.addEventListener("click", toggleSearch);

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      performSearch();
    }
  });
}

function autoResize() {
  messageInput.style.height = "auto";
  messageInput.style.height = messageInput.scrollHeight + "px";
}

// Message Handling
async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;

  // Add user message to UI
  addMessage("user", message, Date.now());
  messageInput.value = "";
  messageInput.style.height = "auto";

  // Show typing indicator
  addTypingIndicator();

  // Send via WebSocket if connected, otherwise use REST API
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type: "chat",
        message: message,
      })
    );
  } else {
    // Fallback to REST API
    try {
      const response = await fetch(
        `${WORKER_URL}/api/chat?sessionId=${sessionId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
        }
      );

      const data = await response.json();
      removeTypingIndicator();
      addMessage("assistant", data.response, data.timestamp);
    } catch (error) {
      removeTypingIndicator();
      addMessage(
        "assistant",
        "Sorry, I encountered an error. Please try again.",
        Date.now()
      );
      console.error("Error sending message:", error);
    }
  }
}

function addMessage(role, content, timestamp) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${role}`;

  const contentDiv = document.createElement("div");
  contentDiv.className = "message-content";

  if (role === "assistant") {
    contentDiv.innerHTML = `<strong>Assistant:</strong> ${escapeHtml(content)}`;
  } else {
    contentDiv.textContent = content;
  }

  const timeDiv = document.createElement("div");
  timeDiv.className = "message-time";
  timeDiv.textContent = formatTime(timestamp);

  messageDiv.appendChild(contentDiv);
  messageDiv.appendChild(timeDiv);
  messagesContainer.appendChild(messageDiv);

  scrollToBottom();
}

function addTypingIndicator() {
  const indicator = document.createElement("div");
  indicator.className = "typing-indicator";
  indicator.id = "typing";
  indicator.innerHTML = "<span></span><span></span><span></span>";
  messagesContainer.appendChild(indicator);
  scrollToBottom();
}

function removeTypingIndicator() {
  const indicator = document.getElementById("typing");
  if (indicator) {
    indicator.remove();
  }
}

function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// History Management
async function loadChatHistory() {
  try {
    const response = await fetch(
      `${WORKER_URL}/api/history?sessionId=${sessionId}&limit=20`
    );
    const history = await response.json();

    // Clear initial message if there's history
    if (history.length > 0) {
      messagesContainer.innerHTML = "";
      history.forEach((msg) => {
        addMessage(msg.role, msg.content, msg.timestamp);
      });
    }
  } catch (error) {
    console.error("Error loading history:", error);
  }
}

async function showHistory() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type: "getHistory",
        limit: 50,
      })
    );
  } else {
    await loadChatHistory();
  }
}

function displayHistory(history) {
  messagesContainer.innerHTML = "";
  if (history.length === 0) {
    addMessage("assistant", "No chat history found.", Date.now());
  } else {
    history.forEach((msg) => {
      addMessage(msg.role, msg.content, msg.timestamp);
    });
  }
}

async function clearChat() {
  if (!confirm("Are you sure you want to clear all chat history?")) {
    return;
  }

  try {
    const response = await fetch(
      `${WORKER_URL}/api/history?sessionId=${sessionId}`,
      {
        method: "DELETE",
      }
    );

    if (response.ok) {
      messagesContainer.innerHTML = "";
      addMessage(
        "assistant",
        "Chat history cleared. How can I help you today?",
        Date.now()
      );
    }
  } catch (error) {
    console.error("Error clearing chat:", error);
    alert("Failed to clear chat history");
  }
}

// Search Functionality
function toggleSearch() {
  searchPanel.classList.toggle("hidden");
  if (!searchPanel.classList.contains("hidden")) {
    searchInput.focus();
  } else {
    searchResults.innerHTML = "";
  }
}

async function performSearch() {
  const query = searchInput.value.trim();
  if (!query) return;

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type: "search",
        query: query,
      })
    );
  } else {
    try {
      const response = await fetch(
        `${WORKER_URL}/api/search?sessionId=${sessionId}&q=${encodeURIComponent(
          query
        )}`
      );
      const results = await response.json();
      displaySearchResults(results);
    } catch (error) {
      console.error("Error searching:", error);
      searchResults.innerHTML = "<p>Search failed. Please try again.</p>";
    }
  }
}

function displaySearchResults(results) {
  searchResults.innerHTML = "";

  if (results.length === 0) {
    searchResults.innerHTML = '<p style="padding: 12px;">No results found.</p>';
    return;
  }

  results.forEach((msg) => {
    const resultDiv = document.createElement("div");
    resultDiv.className = "search-result-item";
    resultDiv.innerHTML = `
            <strong>${msg.role === "user" ? "You" : "Assistant"}:</strong>
            ${escapeHtml(msg.content)}
            <div style="font-size: 11px; color: #999; margin-top: 4px;">
                ${formatTime(msg.timestamp)}
            </div>
        `;
    searchResults.appendChild(resultDiv);
  });
}

// Utility Functions
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return "Just now";
  if (diff < 3600000) return Math.floor(diff / 60000) + " minutes ago";
  if (diff < 86400000) return Math.floor(diff / 3600000) + " hours ago";

  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Initialize the app
init();
