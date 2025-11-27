# 🎼 Music Sheet Scanner & Player

A full-stack web application that converts sheet music images into digital notation and playable audio using Optical Music Recognition (OMR).

![Music Scanner](https://via.placeholder.com/800x400/1e3a8a/white?text=Music+Sheet+Scanner)

## ✨ Features

- 🔐 **User Authentication** - Secure signup/login via Supabase Auth
- 📤 **File Upload** - Drag & drop sheet music images (JPG, PNG, PDF)
- 🎵 **Audio Playback** - High-quality synthesis with Tone.js
- 🎛️ **Interactive Controls** - Play/pause, tempo, volume, progress scrubbing
- 📱 **Responsive Design** - Works on desktop and mobile
- 🔄 **Real-time Processing** - Live progress indicators
- 🎼 **Music Recognition** - OMR via Python FastAPI backend

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create `.env.local` with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OMR_API_URL=http://localhost:8000
```

### 3. Start Development
```bash
npm run dev
```

Visit http://localhost:5173 to see the app! 🎉

## 🎯 Usage

1. **Sign up** or **log in** to your account
2. **Upload** sheet music images via drag & drop
3. **Wait** for OMR processing (demo uses sample data)
4. **Play** your music with interactive controls
5. **Adjust** tempo, volume, and other settings

## 🏗️ Tech Stack

### Frontend
- **React 18** + TypeScript
- **Vite** for development
- **Tailwind CSS** for styling
- **Supabase** for auth & database
- **Tone.js** for audio synthesis

### Backend
- **FastAPI** for OMR processing
- **OpenCV** for image preprocessing
- **Music21** for notation handling

## 📱 Features Showcase

### Authentication System
- Secure user registration and login
- Protected routes requiring authentication
- Persistent sessions across browser reloads

### Upload & Processing
- Drag & drop file upload interface
- Real-time processing indicators
- File validation and error handling
- Supabase Storage integration

### Audio Playback Engine
- **Play/Pause/Stop controls**
- **Tempo adjustment** (40-240 BPM)
- **Volume control** with mute
- **Progress bar** with scrubbing
- **Loop mode** toggle

### Modern UI/UX
- Clean, responsive interface
- Smooth animations and transitions
- Loading states for all operations
- User-friendly error messages

## 🛠️ Development

### Available Scripts
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

### Project Structure
```
src/
├── components/
│   ├── auth/         # Authentication components
│   ├── upload/       # File upload components
│   ├── player/       # Audio player components
│   ├── layout/       # Layout components
│   └── ui/           # Base UI components
├── lib/
│   ├── audio/        # Audio processing utilities
│   ├── omr/          # OMR API client
│   └── supabase.ts   # Supabase configuration
├── hooks/            # Custom React hooks
├── types/            # TypeScript definitions
└── pages/            # Main page components
```

## 🔧 Database Setup

Run this SQL in your Supabase dashboard:

```sql
-- Create uploads table
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  image_url TEXT NOT NULL,
  processed_data JSONB,
  musicxml TEXT,
  midi_data TEXT,
  status TEXT CHECK (status IN ('processing', 'completed', 'failed')) DEFAULT 'processing',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own uploads" ON uploads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own uploads" ON uploads FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 🎵 Try It Out

The app is fully functional with demo data:

1. **Demo Player**: Test audio controls with sample music
2. **Upload Flow**: Experience the complete upload process
3. **Authentication**: Create accounts and secure login
4. **Responsive Design**: Try on different screen sizes

## 🚀 Deploy

### Frontend (Vercel)
```bash
npm run build
vercel --prod
```

### Backend
Deploy the `omr-service/` directory to your preferred Python hosting platform.

## 📞 Support

- 🐛 Issues: Open GitHub issues for bugs
- 💡 Features: Submit feature requests
- 📧 Contact: Reach out for support

Built with ❤️ using React, TypeScript, and modern web technologies.
