export function config() {
  return {
    runtime: 'edge', // Use edge runtime for fast response and streaming
  };
}

export default async function handler(request: Request) {
  // 1. Enable CORS so our frontend can access the stream
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight request
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // 2. Get the stream URL from the query parameter
  const { searchParams } = new URL(request.url);
  const streamUrl = searchParams.get('url');

  if (!streamUrl) {
    return new Response('Missing stream URL parameter', { 
      status: 400, 
      headers: corsHeaders 
    });
  }

  try {
    // 3. Fetch the actual audio stream from YouTube/Piped
    // We proxy it through our serverless function to hide our IP and bypass strict CORS
    const streamResponse = await fetch(streamUrl, {
      headers: {
        // Some services require a user agent
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      }
    });

    if (!streamResponse.ok) {
      throw new Error(`Upstream responded with ${streamResponse.status}`);
    }

    // 4. Return the stream directly to the client browser
    // Pass through necessary headers like content-type and content-length for seekability
    const headers = new Headers(corsHeaders);
    const contentType = streamResponse.headers.get('content-type');
    const contentLength = streamResponse.headers.get('content-length');
    
    if (contentType) headers.set('Content-Type', contentType);
    if (contentLength) headers.set('Content-Length', contentLength);
    
    // Support range requests (seeking)
    headers.set('Accept-Ranges', 'bytes');
    const contentRange = streamResponse.headers.get('content-range');
    if (contentRange) headers.set('Content-Range', contentRange);

    return new Response(streamResponse.body, {
      status: streamResponse.status,
      headers,
    });
    
  } catch (error) {
    console.error('Proxy stream error:', error);
    return new Response('Error proxying stream', { 
      status: 500, 
      headers: corsHeaders 
    });
  }
}
