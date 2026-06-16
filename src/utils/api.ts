// Helper to fetch resource trying multiple CORS proxies sequentially
const fetchWithProxy = async (targetUrl: string): Promise<Response> => {
  const proxies = [
    (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`
  ];

  let lastError = null;
  for (const proxy of proxies) {
    try {
      const proxiedUrl = proxy(targetUrl);
      const response = await fetch(proxiedUrl);
      if (response.ok) {
        return response;
      }
      throw new Error(`Proxy returned status ${response.status}`);
    } catch (err: any) {
      console.warn(`Proxy failed for ${targetUrl} using proxy URL:`, err.message);
      lastError = err;
    }
  }
  throw lastError || new Error(`Failed to fetch ${targetUrl} via all available proxies`);
};

export const fetchTrackInfoAndAudio = async (youtubeUrl: string) => {
  try {
    // Extract video ID from URL
    const videoIdMatch = youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    const PIPED_INSTANCES = [
      'https://api.piped.yt',
      'https://pipedapi.adminforge.de',
      'https://pipedapi.leptons.xyz',
      'https://pipedapi.nosebs.ru',
      'https://pipedapi.owo.si',
      'https://piped-api.privacy.com.de'
    ];

    let data = null;

    // Try multiple instances since public instances often go down (502/Rate limited)
    for (const instance of PIPED_INSTANCES) {
      try {
        const response = await fetchWithProxy(`${instance}/streams/${videoId}`);
        data = await response.json();
        if (data && data.audioStreams && data.audioStreams.length > 0) {
          break; // Successfully got data
        }
      } catch (err: any) {
        console.warn(`Instance ${instance} failed:`, err.message);
        data = null; // Reset data to try next
      }
    }

    if (!data) {
      throw new Error('すべての抽出サーバーが現在混雑しているかダウンしています。時間を置いて再度お試しください。');
    }

    // Find best audio stream (prefer m4a/mp4 or webm)
    const audioStream = data.audioStreams.find((s: any) => s.format === 'M4A') 
      || data.audioStreams[0];

    const audioUrl = audioStream.url;

    // Fetch the actual audio Blob to save offline via CORS proxy since googlevideo.com strictly blocks CORS
    const audioResponse = await fetchWithProxy(audioUrl);
    const audioBlob = await audioResponse.blob();

    return {
      track: {
        id: videoId,
        title: data.title || "Unknown Title",
        artist: data.uploader || "Unknown Artist",
        thumbnail: data.thumbnailUrl || "",
        duration: data.duration || 0,
        addedAt: Date.now()
      },
      audioBlob
    };

  } catch (error: any) {
    console.error('Error fetching track:', error);
    throw new Error(error.message || 'Failed to download track');
  }
};
