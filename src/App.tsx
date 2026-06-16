import { PlayerProvider } from './context/PlayerContext';
import { NowPlaying } from './components/NowPlaying';
import { PlayerControls } from './components/PlayerControls';
import { TrackList } from './components/TrackList';
import { AddTrackForm } from './components/AddTrackForm';
import { Music } from 'lucide-react';

function App() {
  return (
    <PlayerProvider>
      <div className="min-h-screen flex flex-col md:flex-row relative bg-black text-white">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 md:p-8 z-10 overflow-y-auto">
          <header className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Music className="text-[var(--accent)]" size={32} />
              Music PWA
            </h1>
          </header>

          <AddTrackForm />
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-[var(--text-secondary)]">Your Library</h2>
            <TrackList />
          </div>
        </div>

        {/* Right side Now Playing panel on Desktop, Modal/Bottom on mobile */}
        <div className="w-full md:w-[400px] border-t md:border-t-0 md:border-l border-[var(--glass-border)] bg-[var(--panel-bg)] backdrop-blur-2xl p-6 flex flex-col z-20">
          <NowPlaying />
          <PlayerControls />
        </div>
        
        {/* Background ambient blur */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--accent)] rounded-full blur-[150px] opacity-20"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[150px] opacity-20"></div>
        </div>
      </div>
    </PlayerProvider>
  );
}

export default App;
