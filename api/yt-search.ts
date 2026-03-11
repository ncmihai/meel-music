export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (!query) {
    return new Response(JSON.stringify({ error: 'Missing query' }), { status: 400, headers: corsHeaders });
  }

  try {
    // Fetch raw HTML from YouTube search results
    const ytResponse = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    if (!ytResponse.ok) {
      throw new Error(`YouTube responded with ${ytResponse.status}`);
    }

    const html = await ytResponse.text();
    
    // We look for the INITIAL_DATA object attached to window to extract the videoId
    const videoIdMatch = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);

    if (videoIdMatch && videoIdMatch[1]) {
      return new Response(JSON.stringify({ videoId: videoIdMatch[1] }), { status: 200, headers: corsHeaders });
    } else {
      return new Response(JSON.stringify({ error: 'No video found in HTML' }), { status: 404, headers: corsHeaders });
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
}
