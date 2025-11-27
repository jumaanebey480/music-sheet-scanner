// Authentication types
export interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
}

// Upload and processing types
export interface Upload {
  id: string;
  user_id: string;
  filename: string;
  image_url: string;
  processed_data: ProcessedData | null;
  musicxml: string | null;
  midi_data: string | null;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface ProcessedData {
  confidence: number;
  staves: Staff[];
  measures: number;
  key_signature?: string;
  time_signature?: string;
  tempo?: number;
}

export interface Staff {
  id: number;
  name: string;
  clef: 'G' | 'F' | 'C' | 'percussion';
  instrument?: string;
  color?: string;
  muted?: boolean;
  volume?: number;
}

// Audio playback types
export interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  tempo: number;
  volume: number;
  loop: boolean;
}

export interface AudioNote {
  pitch: string;
  duration: number;
  velocity: number;
  startTime: number;
  staff: number;
}

// MIDI types
export interface MidiData {
  tracks: MidiTrack[];
  ticksPerBeat: number;
  format: number;
}

export interface MidiTrack {
  name: string;
  notes: AudioNote[];
  instrument: number;
}

// UI component types
export interface UploadCardProps {
  upload: Upload;
  onPlay: (upload: Upload) => void;
  onDelete: (id: string) => void;
  onFavorite: (id: string) => void;
  isFavorited: boolean;
}

export interface PlayerControlsProps {
  playbackState: PlaybackState;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (time: number) => void;
  onTempoChange: (tempo: number) => void;
  onVolumeChange: (volume: number) => void;
}

// API response types
export interface OMRResponse {
  status: 'success' | 'error';
  message?: string;
  musicxml?: string;
  midi_data?: string;
  confidence?: number;
  staves?: Staff[];
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// Settings types
export interface UserSettings {
  user_id: string;
  default_tempo: number;
  default_volume: number;
  theme: 'light' | 'dark';
  updated_at: string;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  email: string;
  password: string;
  confirmPassword: string;
}

// Utility types
export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export type FileUploadState = {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  progress: number;
  error: string | null;
};