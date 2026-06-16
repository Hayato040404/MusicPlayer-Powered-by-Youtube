export const fetchTrackInfoAndAudio = async (youtubeUrl: string) => {
  try {
    // Extract video ID from URL
    const videoIdMatch = youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // Use Piped API which supports CORS and simple GET requests
    // Using a reliable public instance
    const response = await fetch(`https://pipedapi.kavin.rocks/streams/${videoId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch from Piped API (Rate limited or down)');
    }

    const data = await response.json();
    
    if (!data.audioStreams || data.audioStreams.length === 0) {
      throw new Error('No audio streams found for this video');
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
