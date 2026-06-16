import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface Track {
  id: string; // YouTube video ID or unique ID
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
  blob?: Blob; // The actual audio file stored offline
  url?: string; // Fallback URL if not stored offline
  addedAt: number;
}

interface MusicPlayerDB extends DBSchema {
  tracks: {
    key: string;
    value: Track;
    indexes: { 'by-date': number };
  };
}

let dbPromise: Promise<IDBPDatabase<MusicPlayerDB>>;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<MusicPlayerDB>('music-player-db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('tracks', { keyPath: 'id' });
        store.createIndex('by-date', 'addedAt');
      },
    });
  }
  return dbPromise;
};

export const saveTrack = async (track: Track, audioBlob: Blob) => {
  const db = await initDB();
  const trackToSave = { ...track, blob: audioBlob };
  await db.put('tracks', trackToSave);
  return trackToSave;
};

export const getAllTracks = async (): Promise<Track[]> => {
  const db = await initDB();
  return db.getAllFromIndex('tracks', 'by-date');
};

export const deleteTrack = async (id: string) => {
  const db = await initDB();
  await db.delete('tracks', id);
};

export const getTrackBlobUrl = async (id: string): Promise<string | null> => {
  const db = await initDB();
  const track = await db.get('tracks', id);
  if (track && track.blob) {
    return URL.createObjectURL(track.blob);
  }
  return track?.url || null;
};
