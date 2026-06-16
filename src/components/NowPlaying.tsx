import React from 'react';
import { usePlayer } from '../context/PlayerContext';

export const NowPlaying: React.FC = () => {
  const { currentTrack } = usePlayer();

  const defaultCover = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'><rect width='400' height='400' fill='%231a1a1a'/></svg>";

  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full relative mb-8">
      {/* Dynamic Background Blur */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center blur-[60px] opacity-30 z-0 transition-all duration-1000 rounded-3xl"
        style={{ backgroundImage: `url(${currentTrack?.thumbnail || defaultCover})` }}
      />
      
      {/* Album Art */}
      <div className="relative z-10 w-full max-w-[300px] aspect-square rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden mb-8 transition-transform duration-500 ease-out">
        <img 
          src={currentTrack?.thumbnail || defaultCover} 
          alt="Cover Art" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Track Info */}
      <div className="relative z-10 text-center w-full px-4">
        <h2 className="text-2xl font-bold truncate text-white mb-2">
          {currentTrack ? currentTrack.title : 'Not Playing'}
        </h2>
        <p className="text-lg text-white/60 truncate">
          {currentTrack ? currentTrack.artist : 'Select a track'}
        </p>
      </div>
    </div>
  );
};
