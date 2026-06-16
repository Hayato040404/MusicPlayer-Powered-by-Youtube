import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, Trash2 } from 'lucide-react';
import { deleteTrack } from '../utils/storage';

export const TrackList: React.FC = () => {
  const { tracks, currentTrack, isPlaying, playTrack, togglePlayPause, refreshTracks } = usePlayer();

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteTrack(id);
    await refreshTracks();
  };

  if (tracks.length === 0) {
    return (
      <div className="text-center text-white/50 py-10 glass-panel">
        <p>No tracks added yet. Download some music!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {tracks.map((track) => {
        const isCurrentTrack = currentTrack?.id === track.id;
        return (
          <div
            key={track.id}
            onClick={() => {
              if (isCurrentTrack) {
                togglePlayPause();
              } else {
                playTrack(track);
              }
            }}
            className={`flex items-center p-3 rounded-xl cursor-pointer transition-all ${
              isCurrentTrack ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className="w-12 h-12 rounded-md overflow-hidden mr-4 relative group shrink-0">
              <img src={track.thumbnail || 'https://via.placeholder.com/150'} alt={track.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isCurrentTrack && isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white" />}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-medium truncate ${isCurrentTrack ? 'text-[var(--accent)]' : 'text-white'}`}>
                {track.title}
              </p>
              <p className="text-sm text-white/60 truncate">{track.artist}</p>
            </div>
            
            {/* Audio Wave Animation for playing track */}
            {isCurrentTrack && isPlaying && (
              <div className="flex items-end gap-1 h-4 mx-4">
                <div className="w-1 bg-[var(--accent)] animate-[bounce_1s_infinite_0ms]"></div>
                <div className="w-1 bg-[var(--accent)] animate-[bounce_1s_infinite_200ms]"></div>
                <div className="w-1 bg-[var(--accent)] animate-[bounce_1s_infinite_400ms]"></div>
              </div>
            )}

            <button
              onClick={(e) => handleDelete(track.id, e)}
              className="p-2 text-white/40 hover:text-red-500 transition-colors ml-2"
              title="Delete Track"
            >
              <Trash2 size={18} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
