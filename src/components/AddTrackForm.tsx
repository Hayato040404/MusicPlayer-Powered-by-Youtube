import React, { useState } from 'react';
import { fetchTrackInfoAndAudio } from '../utils/api';
import { saveTrack } from '../utils/storage';
import { usePlayer } from '../context/PlayerContext';
import { Download, Loader2 } from 'lucide-react';

export const AddTrackForm: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { refreshTracks } = usePlayer();

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    setError('');

    try {
      const { track, audioBlob } = await fetchTrackInfoAndAudio(url);
      await saveTrack(track, audioBlob);
      await refreshTracks();
      setUrl('');
    } catch (err: any) {
      setError(err.message || 'Failed to download track');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 mb-8">
      <h3 className="text-lg font-medium mb-4">Add from YouTube</h3>
      <form onSubmit={handleDownload} className="flex gap-4">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste YouTube URL here..."
          className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[var(--accent)] transition-colors"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !url}
          className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Download size={20} className="mr-2" /> Save</>}
        </button>
      </form>
      {error && <p className="text-red-400 mt-3 text-sm">{error}</p>}
    </div>
  );
};
