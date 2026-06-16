import React, { useEffect, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX } from 'lucide-react';

export const PlayerControls: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    isShuffle,
    isLoop,
    togglePlayPause,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleShuffle,
    toggleLoop,
  } = usePlayer();

  const [localProgress, setLocalProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) {
      setLocalProgress(progress);
    }
  }, [progress, isDragging]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDragging(true);
    setLocalProgress(Number(e.target.value));
  };

  const handleSeekEnd = () => {
    setIsDragging(false);
    seek(localProgress);
  };

  const isControlsDisabled = !currentTrack;

  return (
    <div className="w-full flex flex-col items-center pb-8 z-10 relative">
      {/* Progress Bar */}
      <div className="w-full flex items-center gap-3 mb-6 px-4">
        <span className="text-xs text-white/50 w-10 text-right">{formatTime(localProgress)}</span>
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={localProgress}
          onChange={handleSeekChange}
          onMouseUp={handleSeekEnd}
          onTouchEnd={handleSeekEnd}
          className="flex-1"
          disabled={isControlsDisabled}
        />
        <span className="text-xs text-white/50 w-10">{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <button
          onClick={toggleShuffle}
          className={`p-2 transition-colors ${isShuffle ? 'text-[var(--accent)]' : 'text-white/40 hover:text-white'}`}
          disabled={isControlsDisabled}
        >
          <Shuffle size={20} />
        </button>
        
        <button
          onClick={prevTrack}
          className="p-2 text-white/80 hover:text-white transition-colors"
          disabled={isControlsDisabled}
        >
          <SkipBack size={32} fill="currentColor" />
        </button>
        
        <button
          onClick={togglePlayPause}
          className={`w-16 h-16 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform ${isControlsDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isControlsDisabled}
        >
          {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
        </button>
        
        <button
          onClick={nextTrack}
          className="p-2 text-white/80 hover:text-white transition-colors"
          disabled={isControlsDisabled}
        >
          <SkipForward size={32} fill="currentColor" />
        </button>
        
        <button
          onClick={toggleLoop}
          className={`p-2 transition-colors ${isLoop ? 'text-[var(--accent)]' : 'text-white/40 hover:text-white'}`}
          disabled={isControlsDisabled}
        >
          <Repeat size={20} />
        </button>
      </div>

      {/* Volume */}
      <div className="w-full max-w-[200px] flex items-center gap-3 px-4">
        <button onClick={() => setVolume(volume === 0 ? 1 : 0)} className="text-white/50 hover:text-white transition-colors">
          {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="flex-1"
        />
      </div>
    </div>
  );
};
