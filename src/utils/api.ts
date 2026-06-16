export const fetchTrackInfoAndAudio = async (youtubeUrl: string) => {
  try {
    // Extract video ID from URL
    const videoIdMatch = youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    const PIPED_INSTANCES = [
      'https://pipedapi.kavin.rocks',
      'https://api.piped.projectsegfau.lt',
      'https://pipedapi.moomoo.me',
      'https://pipedapi.syncpundit.io',
      'https://piped-api.garudalinux.org'
    ];

    let data = null;
    let lastError = null;

    // Try multiple instances since public instances often go down (502/Rate limited)
    for (const instance of PIPED_INSTANCES) {
      try {
        const response = await fetch(`${instance}/streams/${videoId}`);
        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status}`);
        }
        data = await response.json();
        if (data && data.audioStreams && data.audioStreams.length > 0) {
          break; // Successfully got data
        }
      } catch (err: any) {
        console.warn(`Instance ${instance} failed:`, err.message);
        lastError = err;
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

    // Fetch the actual audio Blob to save offline
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error('Failed to download audio file');
    }
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
