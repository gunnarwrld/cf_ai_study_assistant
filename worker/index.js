import { StudyAgent } from './study-agent.js';

/**
 * Main Worker entry point
 * Handles routing and creates Durable Object instances
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers for frontend
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check endpoint
    if (path === '/health') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get or create a Durable Object for the user session
    // Use session ID from query param or cookie, or create new one
    let sessionId = url.searchParams.get('sessionId') || 
                    request.headers.get('X-Session-ID') ||
                    crypto.randomUUID();

    // Get the Durable Object stub
    const id = env.STUDY_AGENT.idFromName(sessionId);
    const stub = env.STUDY_AGENT.get(id);

    // Forward the request to the Durable Object
    const doUrl = new URL(request.url);
    doUrl.pathname = path.replace('/api', '');
    
    const doRequest = new Request(doUrl.toString(), request);
    const response = await stub.fetch(doRequest);

    // Add CORS headers to response
    const newResponse = new Response(response.body, response);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newResponse.headers.set(key, value);
    });
    newResponse.headers.set('X-Session-ID', sessionId);

    return newResponse;
  }
};

// Export the Durable Object class
export { StudyAgent };
