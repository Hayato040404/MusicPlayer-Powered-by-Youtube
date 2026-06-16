// using Cobalt API (api.cobalt.tools) for extracting media from YouTube URLs.
export const fetchTrackInfoAndAudio = async (youtubeUrl: string) => {
  try {
    // Note: Cobalt API requires specific headers and payload.
    // As public instances can be rate-limited or go down, error handling is crucial.
    const response = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        url: youtubeUrl,
        isAudioOnly: true,
        aFormat: "mp3"
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from Cobalt API');
    }

    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(data.text || 'Error from API');
    }

    // Usually data.url contains the direct download link
    const audioUrl = data.url;

    // We also want to fetch the Blob to save it offline
    // We will do it via the browser if CORS allows, otherwise we might just stream it.
    // Cobalt's returned URLs usually allow CORS.
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error('Failed to download audio file');
    }
    const audioBlob = await audioResponse.blob();

    // To get metadata (title, artist, thumbnail), Cobalt doesn't always provide rich metadata in the basic response.
    // Sometimes we need a separate endpoint or just parse basic data. 
    // For a highly polished UI, we ideally want good metadata.
    // We'll use oEmbed API for basic YouTube metadata since it's free and no API key is required.
    
    // Extract video ID from URL
    const videoIdMatch = youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : Date.now().toString();

    let title = "Unknown Title";
    let author = "Unknown Artist";
    let thumbnail = "";

    try {
      const oembedRes = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(youtubeUrl)}`);
      const oembedData = await oembedRes.json();
      if (oembedData.title) title = oembedData.title;
      if (oembedData.author_name) author = oembedData.author_name;
      if (oembedData.thumbnail_url) thumbnail = oembedData.thumbnail_url;
    } catch (e) {
      console.warn("Failed to fetch metadata, using defaults");
    }

    return {
      track: {
        id: videoId,
        title,
        artist: author,
        thumbnail,
        duration: 0, // Hard to get exact duration without loading metadata
        addedAt: Date.now()
      },
      audioBlob
    };

  } catch (error) {
    console.error('Error fetching track:', error);
    throw error;
  }
};
