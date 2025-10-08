# 🧪 Testing Guide

## Manual Testing

### 1. Health Check

Test the Worker is running:
```bash
curl http://localhost:8787/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": 1234567890
}
```

### 2. REST API Testing

#### Send a Chat Message
```bash
curl -X POST http://localhost:8787/api/chat?sessionId=test123 \
  -H "Content-Type: application/json" \
  -d '{"message": "What is photosynthesis?"}'
```

#### Get Chat History
```bash
curl http://localhost:8787/api/history?sessionId=test123&limit=10
```

#### Search History
```bash
curl "http://localhost:8787/api/search?sessionId=test123&q=photosynthesis"
```

#### Clear History
```bash
curl -X DELETE http://localhost:8787/api/history?sessionId=test123
```

### 3. WebSocket Testing

Create a test HTML file:

```html
<!DOCTYPE html>
<html>
<head>
    <title>WebSocket Test</title>
</head>
<body>
    <h1>WebSocket Test</h1>
    <div id="status">Connecting...</div>
    <div id="messages"></div>
    <input type="text" id="input" placeholder="Type message...">
    <button onclick="send()">Send</button>

    <script>
        const ws = new WebSocket('ws://localhost:8787/api/chat?sessionId=test123');
        
        ws.onopen = () => {
            document.getElementById('status').textContent = 'Connected';
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const div = document.createElement('div');
            div.textContent = JSON.stringify(data, null, 2);
            document.getElementById('messages').appendChild(div);
        };

        function send() {
            const input = document.getElementById('input');
            ws.send(JSON.stringify({
                type: 'chat',
                message: input.value
            }));
            input.value = '';
        }
    </script>
</body>
</html>
```

## Test Scenarios

### Scenario 1: Basic Chat Flow
1. Send a message: "What is AI?"
2. Verify response is received
3. Send follow-up: "Give me an example"
4. Verify context is maintained

### Scenario 2: Memory & History
1. Send multiple messages
2. Get chat history
3. Verify all messages are stored
4. Search for specific topic
5. Verify search results are correct

### Scenario 3: Session Isolation
1. Create session A and send messages
2. Create session B and send different messages
3. Get history for session A
4. Verify session A history doesn't contain session B messages

### Scenario 4: Clear History
1. Send several messages
2. Clear history
3. Get history
4. Verify history is empty

### Scenario 5: WebSocket Connection
1. Connect via WebSocket
2. Send multiple messages
3. Verify real-time responses
4. Disconnect and reconnect
5. Verify session persists

## Performance Testing

### Load Testing with curl

Test concurrent requests:
```bash
for i in {1..10}; do
  curl -X POST http://localhost:8787/api/chat?sessionId=load-test-$i \
    -H "Content-Type: application/json" \
    -d "{\"message\": \"Test message $i\"}" &
done
wait
```

### Response Time Testing

```bash
time curl -X POST http://localhost:8787/api/chat?sessionId=perf-test \
  -H "Content-Type: application/json" \
  -d '{"message": "Quick test"}'
```

## Edge Cases

### Test Long Messages
```bash
curl -X POST http://localhost:8787/api/chat?sessionId=edge-test \
  -H "Content-Type: application/json" \
  -d '{"message": "'$(python3 -c "print('A' * 5000)")'"}'
```

### Test Special Characters
```bash
curl -X POST http://localhost:8787/api/chat?sessionId=edge-test \
  -H "Content-Type: application/json" \
  -d '{"message": "Test with special chars: @#$%^&*()[]{}|\\/<>?"}'
```

### Test Empty Message
```bash
curl -X POST http://localhost:8787/api/chat?sessionId=edge-test \
  -H "Content-Type: application/json" \
  -d '{"message": ""}'
```

## Browser DevTools Testing

### Console Tests

Open browser console and run:

```javascript
// Test REST API
async function testChat() {
  const response = await fetch('http://localhost:8787/api/chat?sessionId=console-test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Hello from console!' })
  });
  const data = await response.json();
  console.log('Response:', data);
}

testChat();
```

```javascript
// Test WebSocket
const ws = new WebSocket('ws://localhost:8787/api/chat?sessionId=ws-test');

ws.onopen = () => {
  console.log('Connected');
  ws.send(JSON.stringify({
    type: 'chat',
    message: 'Hello via WebSocket!'
  }));
};

ws.onmessage = (event) => {
  console.log('Received:', JSON.parse(event.data));
};
```

## Production Testing

After deployment, update URLs and test:

```bash
WORKER_URL="https://cf-ai-study-assistant.YOUR_SUBDOMAIN.workers.dev"

# Health check
curl $WORKER_URL/health

# Chat test
curl -X POST "$WORKER_URL/api/chat?sessionId=prod-test" \
  -H "Content-Type: application/json" \
  -d '{"message": "Production test"}'
```

## Monitoring

### View Worker Logs

```bash
wrangler tail
```

### Monitor Durable Objects

Check Cloudflare Dashboard:
1. Go to Workers & Pages
2. Click on your worker
3. Navigate to Durable Objects
4. View active objects and storage usage

### Check Analytics

In Cloudflare Dashboard:
- Request count
- Error rate
- Latency
- Durable Object invocations

## Debugging Checklist

- [ ] Worker deploys successfully
- [ ] Health endpoint responds
- [ ] Chat endpoint returns AI response
- [ ] History is saved correctly
- [ ] WebSocket connections work
- [ ] CORS headers are present
- [ ] Session IDs are properly handled
- [ ] Durable Objects are created
- [ ] AI model responds correctly
- [ ] Frontend connects to backend

## Common Issues

### "Durable Object not found"
- Check `wrangler.toml` bindings
- Verify migrations are applied
- Ensure class name matches

### "AI model error"
- Check Workers AI is enabled
- Verify model name is correct
- Check account has AI access

### "WebSocket upgrade failed"
- Verify WebSocket support in Worker
- Check CORS settings
- Ensure correct protocol (ws/wss)

### "No response from AI"
- Check AI binding in wrangler.toml
- Verify request format
- Check Worker logs

---

**Happy Testing! 🧪**
