import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Volume2, VolumeX, Loader2, ArrowLeft, Headphones, ExternalLink, Disc3 } from 'lucide-react';
import './App.css'; 

// 1. Katalog Vibe Engine 
const VIBE_CONFIG = {
  chill: {
    id: 'chill', name: 'Chill Vibes',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_114316_1c7889ad-2885-410e-b493-98119fee0ddb.mp4', 
    audio: '/audio/chill.mp3',
    isScrubbable: false
  },
  typing: {
    id: 'typing', name: 'Indie Folk',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4', 
    audio: '/audio/indie.mp3',
    isScrubbable: false
  },
  edm: {
    id: 'edm', name: 'Electronic',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260601_110537_3a579fa0-7bbc-4d94-9d25-0e816c7840f5.mp4', 
    audio: '/audio/edm.mp3',
    isScrubbable: true 
  },
  retro: {
    id: 'retro', name: '90s Slow',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4', 
    audio: '/audio/90s.mp3',
    isScrubbable: false
  },
  phonk: {
    id: 'phonk', name: 'Dark Phonk',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_063509_7d167302-4fd4-480b-8260-18ab572333d4.mp4', 
    audio: '/audio/phonk.mp3',
    isScrubbable: false
  },
  pop: {
    id: 'pop', name: 'Pop & Sunny',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260427_054418_a6d194f0-ac86-4df9-abe5-ded73e596d7c.mp4', 
    audio: '/audio/pop.mp3',
    isScrubbable: false,
    hasTypingEffect: true 
  },
  rock: {
    id: 'rock', name: 'Rock Energy',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260210_031346_d87182fb-b0af-4273-84d1-c6fd17d6bf0f.mp4', 
    audio: '/audio/rock.mp3',
    isScrubbable: false,
    isPremiumHero: true 
  },
  rnb: {
    id: 'rnb', name: 'Midnight R&B',
    isPremiumHero: true, 
    video: 'https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8',
    audio: '/audio/rnb.mp3',
    isScrubbable: false
  },
  jazz: {
    id: 'jazz', name: 'Vintage Jazz',
    video: 'https://videos.pexels.com/video-files/855016/855016-hd_1920_1080_25fps.mp4', 
    audio: '/audio/jazz.mp3',
    isScrubbable: true, 
    isVintage: true 
  }
};

export default function App() {
  const [currentVibe, setCurrentVibe] = useState(() => {
    const keys = Object.keys(VIBE_CONFIG);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return VIBE_CONFIG[randomKey];
  });
  const [isChangingVibe, setIsChangingVibe] = useState(false);
  const [showVibeMenu, setShowVibeMenu] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const [moodText, setMoodText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [apiData, setApiData] = useState({ pesan: "", keyword: "", songs: [] });
  
  const audioRef = useRef(null);
  const menuRef = useRef(null);
  const bgVideoRef = useRef(null);

// 4. Autoplay Attempt (Pancingan Audio)
  useEffect(() => {
    const tryAutoPlay = async () => {
      try {
        if (audioRef.current) {
          await audioRef.current.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.log("Autoplay diblokir oleh browser, menunggu interaksi user.");
      }
    };
    
    // Memberi sedikit jeda agar semua komponen siap
    const timer = setTimeout(tryAutoPlay, 1000);
    return () => clearTimeout(timer);
  }, []);

  // 2. Video Scrubbing Logic
  useEffect(() => {
    const video = bgVideoRef.current;
    if (!video || isChangingVibe) return;

    if (currentVibe.isScrubbable && window.innerWidth >= 1024) {
      let isSeeking = false;
      let targetTime = 0;

      video.pause();

      const handleMouseMove = (e) => {
        if (!video.duration || isNaN(video.duration)) return;
        const screenPercentage = e.clientX / window.innerWidth;
        targetTime = screenPercentage * video.duration;

        if (!isSeeking) {
          isSeeking = true;
          video.currentTime = targetTime;
        }
      };

      const handleSeeked = () => {
        isSeeking = false;
        if (Math.abs(video.currentTime - targetTime) > 0.05) {
          isSeeking = true;
          video.currentTime = targetTime;
        }
      };

      window.addEventListener('mousemove', handleMouseMove);
      video.addEventListener('seeked', handleSeeked);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        video.removeEventListener('seeked', handleSeeked);
      };

    } else {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => console.log("Autoplay diblokir browser:", error));
      }
    }
  }, [currentVibe.id, isChangingVibe]); 

  // 3. Handle Vibe Change
  const handleVibeChange = (vibeKey) => {
    if (vibeKey === currentVibe.id) return;
    
    setIsChangingVibe(true);
    setShowVibeMenu(false);
    
    if (audioRef.current) audioRef.current.pause();
    
    setTimeout(() => {
      setCurrentVibe(VIBE_CONFIG[vibeKey]);
      
      if (isPlaying && audioRef.current) {
        setTimeout(() => {
          audioRef.current.play().catch(e => console.log("Audio diblokir:", e));
        }, 150);
      }
      setIsChangingVibe(false);
    }, 800); 
  };

  const toggleMusic = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => console.log("Autoplay diblokir", err));
    }
    setIsPlaying(!isPlaying);
  };

  const openSpotifyMiniPlayer = (songId) => {
    if (!songId) return alert("ID lagu tidak ditemukan.");
    const embedUrl = `http://googleusercontent.com/spotify.com/5${songId}?utm_source=generator`;
    window.open(embedUrl, 'SpotifyMiniPlayer', 'width=400,height=450,scrollbars=no,resizable=no');
  };

  const handleAnalyze = async () => {
    if (!moodText.trim()) return alert("Ceritain dulu perasaanmu sedikit ya!");
    setIsLoading(true);
    try {
      const response = await fetch('https://apimusichealt.xgrow.studio/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moodText })
      });
      if (!response.ok) throw new Error("Gagal mengambil data");
      const data = await response.json();
      setApiData(data);
      setShowResult(true);
    } catch (error) {
      console.error(error);
      alert("Server backend sepertinya belum nyala!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setShowResult(false);
    setMoodText('');
  };

  return (
    
    <main className="relative bg-[#001721] w-full min-h-[100svh] overflow-x-hidden flex flex-col font-sans">
      <audio ref={audioRef} src={currentVibe.audio} loop />

      {/* --- LAYER LOADING --- */}
      <AnimatePresence>
        {isChangingVibe && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-xl"
          >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-6">
              <div className="relative">
                <Loader2 size={40} className="animate-spin text-white" />
                <div className="absolute inset-0 blur-lg bg-white/20 rounded-full" />
              </div>
              <p className="text-white text-xs tracking-[0.4em] uppercase font-light animate-pulse">
                Syncing {currentVibe.name}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- VIDEO BACKGROUND --- */}
      <AnimatePresence mode="wait">
        <motion.video 
          key={currentVibe.id}
          ref={bgVideoRef}
          initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}
          autoPlay={!currentVibe.isScrubbable} 
          loop 
          muted={true}
          playsInline 
          preload="auto"
          crossOrigin="anonymous"
          className={`fixed inset-0 w-full h-full object-cover z-[0] pointer-events-none ${currentVibe.isVintage ? 'vibe-vintage-jazz' : ''}`}
        >
          <source src={currentVibe.video} type="video/mp4" />
        </motion.video>
      </AnimatePresence>

      {/* --- NAVBAR --- */}
      <header className="fixed top-0 left-0 w-full pt-4 sm:pt-6 z-50 pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-start justify-between pointer-events-auto">
          
          {/* LOGO */}
          <div className="flex-1 flex justify-start">
            <h1 className="text-xl sm:text-2xl md:text-3xl text-white tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Musichealt<sup className="text-[8px] sm:text-[10px] ml-1">®</sup>
            </h1>
          </div>

          {/* MENU TENGAH */}
          <div className="flex-1 flex justify-center">
            <div className="relative flex flex-col items-center" ref={menuRef}>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setShowVibeMenu(!showVibeMenu)}
                className="liquid-glass flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-semibold text-white/90 cursor-pointer border border-white/10 shadow-lg min-w-[120px] sm:min-w-[150px]"
              >
                <Disc3 size={14} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isPlaying ? "animate-spin-slow text-white" : "text-white/50"}`} />
                <span className="uppercase tracking-widest truncate">{currentVibe.name}</span>
              </motion.button>

              <AnimatePresence>
                {showVibeMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-[10px]-calc(100%+8px)] w-[180px] sm:w-[220px] p-2 rounded-xl sm:rounded-2xl liquid-glass border border-white/10 flex flex-col gap-1 shadow-2xl origin-top"
                  >
                    {Object.values(VIBE_CONFIG).map((vibe) => (
                      <button 
                        key={vibe.id}
                        onClick={() => handleVibeChange(vibe.id)}
                        className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] uppercase tracking-widest text-center transition-all ${currentVibe.id === vibe.id ? 'bg-white/20 text-white font-bold shadow-inner' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
                      >
                        {vibe.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* MUTE BUTTON */}
          <div className="flex-1 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleMusic}
              className="liquid-glass p-2.5 sm:p-3 rounded-full text-white border border-white/10"
            >
              {isPlaying ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
            </motion.button>
          </div>

        </div>
      </header>

      {/* --- KONTEN UTAMA --- */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col justify-between px-4 sm:px-6 md:px-12 flex-grow pb-6 sm:pb-10 pt-[110px] sm:pt-[140px] min-h-[100svh]">
        
        <div className="flex-grow flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {!showResult ? (
              <motion.div
                key="input-form"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}
                className="w-full flex flex-col gap-4 sm:gap-6 liquid-glass p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl"
              >
                <div className="text-center space-y-2 sm:space-y-4">
                  <h1 className="text-4xl sm:text-5xl md:text-7xl text-white tracking-tighter leading-[0.95]" style={{ fontFamily: "'Instrument Serif', serif" }}>
                     Where feelings <em className="not-italic text-white/50">find</em> their rhythm.
                  </h1>
                  <p className="text-white/70 text-[11px] sm:text-sm md:text-base font-body leading-relaxed max-w-md mx-auto">
                    Ceritakan kondisimu, tren favorit, atau nama band. AI akan meracik rekomendasi yang paling tepat untukmu.
                  </p>
                </div>

                <div className="bg-black/30 border border-white/10 p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-inner mt-2 sm:mt-4 focus-within:border-white/30 transition-colors">
                  <textarea
                    disabled={isLoading || isChangingVibe}
                    className="w-full h-24 sm:h-32 bg-transparent resize-none outline-none placeholder-white/30 text-sm sm:text-lg text-white disabled:opacity-50 font-body"
                    placeholder="Ketik di sini... (contoh: lagu edm yang ngebeat banget)"
                    value={moodText}
                    onChange={(e) => setMoodText(e.target.value)}
                    onFocus={() => { if(!isPlaying) toggleMusic(); setShowVibeMenu(false); }}
                  />
                </div>

                <motion.button
                  disabled={isLoading || isChangingVibe}
                  whileHover={{ scale: (isLoading || isChangingVibe) ? 1 : 1.02 }}
                  whileTap={{ scale: (isLoading || isChangingVibe) ? 1 : 0.98 }}
                  onClick={handleAnalyze}
                  className="w-full py-3.5 sm:py-4 liquid-glass hover:bg-white/10 border border-white/20 text-white font-medium text-[11px] sm:text-sm tracking-widest uppercase rounded-lg sm:rounded-xl flex items-center justify-center gap-2 transition-all min-h-[50px] sm:min-h-[60px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-white/70" />
                      <span>Sistem Menganalisis...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} className="text-white" />
                      <span>Begin Journey</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="result-screen"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5 }}
                className="w-full flex flex-col gap-4 sm:gap-6 liquid-glass p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl"
              >
                 <div className="flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4">
                  <button onClick={handleReset} className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm text-white/60 hover:text-white transition-colors cursor-pointer">
                    <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
                    <span>Kembali</span>
                  </button>
                  <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white/10 text-white border border-white/20 rounded-full text-[8px] sm:text-[10px] font-semibold uppercase tracking-widest max-w-[120px] sm:max-w-[150px] md:max-w-none truncate">
                    {apiData.keyword}
                  </span>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <h2 className="text-xl sm:text-2xl text-white flex items-center gap-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
                    <Sparkles size={20} className="text-white/70 sm:w-6 sm:h-6" /> 
                    Respon AI:
                  </h2>
                  <p className="text-white/80 text-xs sm:text-sm md:text-base leading-relaxed italic font-body">
                    "{apiData.pesan}"
                  </p>
                </div>

                <div className="space-y-2.5 sm:space-y-3 mt-1 sm:mt-2">
                  {apiData.songs.length > 0 ? apiData.songs.map((song, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.15 }}
                      className="flex flex-col p-3 sm:p-4 bg-white/5 border border-white/5 hover:border-white/20 rounded-xl transition-all group gap-3 sm:gap-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4 w-full">
                          <img src={song.cover} alt="Cover" className="w-12 h-12 sm:w-14 sm:h-14 rounded-md sm:rounded-lg object-cover border border-white/10 shadow-lg flex-shrink-0" />
                          <div className="min-w-0">
                            <h4 className="font-medium text-white text-xs sm:text-sm md:text-base leading-tight truncate">{song.title}</h4>
                            <p className="text-[10px] sm:text-xs text-white/50 truncate mt-0.5 sm:mt-1">{song.artist}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-row items-center gap-2 pt-2 sm:pt-3 border-t border-white/5">
                        <button onClick={() => openSpotifyMiniPlayer(song.id)} className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-md sm:rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all text-[9px] sm:text-[10px] md:text-xs font-semibold tracking-wider">
                          <Headphones size={12} className="sm:w-3.5 sm:h-3.5" /> MINI PLAYER
                        </button>
                        <button onClick={() => window.open(song.spotifyUrl, "_blank")} className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-md sm:rounded-lg bg-[#1DB954]/20 text-[#1DB954] hover:bg-[#1DB954] hover:text-white transition-all text-[9px] sm:text-[10px] md:text-xs font-semibold tracking-wider">
                          <ExternalLink size={12} className="sm:w-3.5 sm:h-3.5" /> SPOTIFY
                        </button>
                      </div>
                    </motion.div>
                  )) : (
                    <p className="text-center text-white/50 py-3 sm:py-4 font-body text-xs sm:text-sm">Waduh, AI gagal menemukan lagu. Coba ubah kata-katamu.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- FOOTER --- */}
        <motion.footer
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4 }}
          className="liquid-glass w-full rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-10 text-white/70 mt-10 sm:mt-20 mb-4 sm:mb-6"
        >
            <div className="flex flex-col items-center justify-center gap-2 sm:gap-4 text-center">
                <h2 className="text-2xl sm:text-3xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>Musichealt</h2>
                <p className="text-[8px] sm:text-[10px] uppercase tracking-widest opacity-50 font-body">Curated by @Prabualam @Qistysauva @Juannico</p>
            </div>
        </motion.footer>

      </div>
    </main>
  );
}