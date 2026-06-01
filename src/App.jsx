import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Music2, Globe, MessageCircle, MonitorPlay, Camera, Volume2, VolumeX, Loader2, ArrowLeft, Headphones, ExternalLink, Radio, Disc3 } from 'lucide-react';
import './App.css'; 

// 1. Katalog Vibe Engine 
const VIBE_CONFIG = {
  chill: {
    id: 'chill', name: 'Chill Vibes',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_114316_1c7889ad-2885-410e-b493-98119fee0ddb.mp4', 
    audio: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3',
    isScrubbable: false
  },
  // --- TAMBAHKAN BLOK INI DI SINI ---
  typing: {
    id: 'typing', name: 'Indie Folk',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4', 
    audio: 'https://cdn.pixabay.com/download/audio/2021/02/25/audio_9f7f252dfa.mp3', // Cari audio indie/folk
    isScrubbable: false
  },
  // ----------------------------------
  edm: {
    id: 'edm', name: 'Electronic',
    // VIDEO MAINFRAME 3D ADA DI SINI
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260601_110537_3a579fa0-7bbc-4d94-9d25-0e816c7840f5.mp4', 
    audio: 'https://cdn.pixabay.com/download/audio/2022/02/10/audio_5af8a66504.mp3',
    isScrubbable: true // Sensor mouse 3D AKTIF
  },
  retro: {
    id: 'retro', name: '90s Slow',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4', 
    audio: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_2435a22839.mp3',
    isScrubbable: false
  },
  phonk: {
    id: 'phonk', name: 'Dark Phonk',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_063509_7d167302-4fd4-480b-8260-18ab572333d4.mp4', 
    audio: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_a163155729.mp3',
    isScrubbable: false
  },
pop: {
    id: 'pop', name: 'Pop & Sunny',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260427_054418_a6d194f0-ac86-4df9-abe5-ded73e596d7c.mp4', 
    audio: 'https://cdn.pixabay.com/download/audio/2022/11/22/audio_78ec7b0999.mp3',
    isScrubbable: false,
    hasTypingEffect: true // Flag baru untuk mengaktifkan TypingMessages
  },
rock: {
    id: 'rock', name: 'Rock Energy',
    // GANTI KE VIDEO PREMUM:
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260210_031346_d87182fb-b0af-4273-84d1-c6fd17d6bf0f.mp4', 
    audio: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939ef926b.mp3',
    isScrubbable: false,
    isPremiumHero: true // FLAG BARU: Untuk membedakan layout hero ini dengan yang lain
  },
// Di dalam VIBE_CONFIG (Baris sekitar 48)
  rnb: {
    id: 'rnb', name: 'Midnight R&B',
    // Gunakan flag ini untuk memanggil komponen MidnightHero
    isPremiumHero: true, 
    video: 'https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8',
    audio: 'https://cdn.pixabay.com/download/audio/2021/11/23/audio_72002572b6.mp3',
    isScrubbable: false
  },
jazz: {
    id: 'jazz', 
    name: 'Vintage Jazz',
    video: 'https://cdn.pixabay.com/video/2021/08/04/83906-584742616_large.mp4', 
    audio: 'https://cdn.pixabay.com/download/audio/2021/10/21/audio_0344d41a87.mp3',
    isScrubbable: false,
    isVintage: true // TAMBAHKAN INI
  }
};

export default function App() {
  const [currentVibe, setCurrentVibe] = useState(VIBE_CONFIG.chill);
  const [isChangingVibe, setIsChangingVibe] = useState(false);
  const [showVibeMenu, setShowVibeMenu] = useState(false);

  const [moodText, setMoodText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [apiData, setApiData] = useState({ pesan: "", keyword: "", songs: [] });
  
  const audioRef = useRef(null);
  const menuRef = useRef(null);
  const bgVideoRef = useRef(null);
  
  // Ref khusus untuk menyimpan state pergerakan mouse agar tidak keriset
  const scrubState = useRef({ prevX: null, targetTime: 0, isSeeking: false });

  // Klik di luar menu untuk menutup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowVibeMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hook Logika Interaktif Video Scrubbing (VERSI ANTI FREEZE & DELTA MAPPING)
  useEffect(() => {
    const video = bgVideoRef.current;
    if (!video || isChangingVibe) return;

    if (currentVibe.isScrubbable && window.innerWidth >= 1024) {
      // Reset state untuk sesi video baru
      scrubState.current = { prevX: null, targetTime: video.currentTime || 0, isSeeking: false };
      video.pause();

      const handleMouseMove = (e) => {
        // Cegah eksekusi jika durasi belum terbaca
        if (!video.duration || isNaN(video.duration)) return; 

        // Set kordinat awal saat mouse pertama kali bergerak
        if (scrubState.current.prevX === null) {
          scrubState.current.prevX = e.clientX;
          return;
        }

        const currentX = e.clientX;
        const delta = currentX - scrubState.current.prevX;
        scrubState.current.prevX = currentX;

        // Kalkulasi target waktu berdasarkan delta persis sesuai blueprint kamu
        const timeDelta = (delta / window.innerWidth) * 0.8 * video.duration;
        let newTarget = scrubState.current.targetTime + timeDelta;
        
        // Kunci waktu agar tidak minus atau melebihi durasi
        newTarget = Math.max(0, Math.min(video.duration, newTarget));
        scrubState.current.targetTime = newTarget;

        // EKSEKUSI: Hanya geser waktu jika browser sudah selesai merender frame sebelumnya
        if (!scrubState.current.isSeeking) {
          scrubState.current.isSeeking = true;
          video.currentTime = newTarget;
        }
      };

      // EVENT SEEKED: Ini kunci utamanya agar video tidak lag/freeze!
      const handleSeeked = () => {
        scrubState.current.isSeeking = false;
        // Jika mouse ternyata masih geser saat video tadi lagi loading frame, kejar targetnya!
        if (Math.abs(video.currentTime - scrubState.current.targetTime) > 0.05) {
          scrubState.current.isSeeking = true;
          video.currentTime = scrubState.current.targetTime;
        }
      };

      window.addEventListener('mousemove', handleMouseMove);
      video.addEventListener('seeked', handleSeeked);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        video.removeEventListener('seeked', handleSeeked);
      };
    } else {
      // Jika mode standar (bukan 3D) atau dibuka di layar HP, putar otomatis
      video.play().catch(e => console.log("Autoplay blocked:", e));
    }
  }, [currentVibe.id, isChangingVibe]); 

  const handleVibeChange = (vibeKey) => {
    if (vibeKey === currentVibe.id) return;
    
    setIsChangingVibe(true);
    setShowVibeMenu(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    setTimeout(() => {
      setCurrentVibe(VIBE_CONFIG[vibeKey]);
      
      if (isPlaying && audioRef.current) {
        setTimeout(() => {
          audioRef.current.play().catch(e => console.log("Audio transisi dicegah browser:", e));
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
    const embedUrl = `http://googleusercontent.com/spotify.com/5{songId}?utm_source=generator`;
    window.open(embedUrl, 'SpotifyMiniPlayer', 'width=400,height=450,scrollbars=no,resizable=no');
  };

  const handleAnalyze = async () => {
    if (!moodText.trim()) return alert("Ceritain dulu perasaanmu sedikit ya!");
    setIsLoading(true);
    try {
      const response = await fetch('https://api-try.xgrow.studio/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moodText })
      });
      if (!response.ok) throw new Error("Gagal mengambil data dari server");
      const data = await response.json();
      setApiData(data);
      setShowResult(true);
    } catch (error) {
      console.error(error);
      alert("Waduh, server backend sepertinya belum nyala atau ada error API!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setShowResult(false);
    setMoodText('');
  };

  return (
    // UBAH BARIS 214 MENJADI:
<main className="relative bg-[#001721] w-full min-h-screen overflow-x-hidden flex flex-col items-center font-sans">
      
      <audio ref={audioRef} src={currentVibe.audio} loop />

{/* Layer Transisi Hitam Halus */}
      <AnimatePresence>
        {isChangingVibe && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-xl"
          >
            {/* Animasi loading yang lebih elegan */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-6"
            >
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

      {/* Video Background Dinamis (Ditambah ref & flag crossOrigin) */}
{/* GANTI BLOK motion.video KAMU DENGAN INI: */}
{/* GANTI BLOK INI (SEKITAR BARIS 243) */}
<AnimatePresence mode="wait">
  <motion.video 
    key={currentVibe.id}
    ref={bgVideoRef}
    initial={{ opacity: 0 }} 
    animate={{ opacity: 0.5 }} 
    exit={{ opacity: 0 }} 
    transition={{ duration: 1.2 }}
    autoPlay={!currentVibe.isScrubbable} 
    loop 
    muted 
    playsInline
    preload="auto"
    // INI YANG MEMBUAT EFEK VINTAGE JAZZ MUNCUL:
    className={`fixed inset-0 w-full h-full object-cover z-[0] ${currentVibe.isVintage ? 'vibe-vintage-jazz' : ''}`}
    src={currentVibe.video}
  />
</AnimatePresence>

{/* Top Navigation Bar - FIX ANTI-BUG */}
<header className="fixed top-0 left-0 w-full z-50 bg-transparent">
  <div className="max-w-7xl mx-auto px-6 md:px-12 navbar-height flex items-center justify-between">
    
    {/* Logo: Kunci posisinya */}
    <div className="flex items-center gap-2 flex-none">
      <h1 className="text-2xl md:text-3xl text-white tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
        Velorah<sup className="text-[10px] ml-1">®</sup>
      </h1>
    </div>

    {/* Tengah: Vibe Selector */}
    <div className="relative flex-none" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={() => setShowVibeMenu(!showVibeMenu)}
        className="liquid-glass flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] sm:text-xs font-semibold text-white/90 cursor-pointer border border-white/10 shadow-lg"
      >
        <Disc3 size={14} className={isPlaying ? "animate-spin-slow text-white" : "text-white/50"} />
        <span className="uppercase tracking-widest">{currentVibe.name}</span>
      </motion.button>

      <AnimatePresence>
        {showVibeMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            // Gunakan class dropdown-position dari CSS
            className="absolute dropdown-position right-0 w-[240px] p-2 rounded-2xl liquid-glass border border-white/10 grid grid-cols-1 gap-1 z-[999] shadow-2xl"
          >
            {Object.values(VIBE_CONFIG).map((vibe) => (
              <button 
                key={vibe.id}
                onClick={() => handleVibeChange(vibe.id)}
                className={`px-4 py-3 rounded-lg text-[10px] uppercase tracking-widest text-left transition-all ${currentVibe.id === vibe.id ? 'bg-white/20 text-white' : 'text-white/50 hover:bg-white/10'}`}
              >
                {vibe.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Mute Button */}
    <motion.button
      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleMusic}
      className="liquid-glass p-3 rounded-full text-white border border-white/10 flex-none"
    >
      {isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
    </motion.button>
  </div>
</header>

      {/* Konten Utama Aplikasi */}
      <div className="relative z-10 w-full max-w-7xl flex flex-col justify-between px-6 md:px-12 h-full flex-grow pb-10 pt-32 min-h-screen">
        
        <div className="flex-grow flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            
            {!showResult ? (
              <motion.div
                key="input-form"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}
                className="w-full flex flex-col gap-6 liquid-glass p-6 sm:p-8 rounded-3xl"
              >
                <div className="text-center space-y-4">
                  <h1 className="text-5xl sm:text-6xl md:text-7xl text-white tracking-tighter leading-[0.95]" style={{ fontFamily: "'Instrument Serif', serif" }}>
                     Where feelings <em className="not-italic text-white/50">find</em> their rhythm.
                  </h1>
                  <p className="text-white/70 text-xs sm:text-sm md:text-base font-body leading-relaxed max-w-md mx-auto">
                    Ceritakan kondisimu, tren favorit, atau nama band. AI akan meracik rekomendasi yang paling tepat untukmu.
                  </p>
                </div>

                <div className="bg-black/30 border border-white/10 p-5 rounded-2xl shadow-inner mt-4 focus-within:border-white/30 transition-colors">
                  <textarea
                    disabled={isLoading || isChangingVibe}
                    className="w-full h-32 bg-transparent resize-none outline-none placeholder-white/30 text-base sm:text-lg text-white disabled:opacity-50 font-body"
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
                  className="w-full py-4 liquid-glass hover:bg-white/10 border border-white/20 text-white font-medium text-sm tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 transition-all min-h-[60px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-white/70" />
                      <span>Sistem Menganalisis...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} className="text-white" />
                      <span>Begin Journey</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="result-screen"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5 }}
                className="w-full flex flex-col gap-6 liquid-glass p-6 sm:p-8 rounded-3xl"
              >
                 <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <button onClick={handleReset} className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors cursor-pointer">
                    <ArrowLeft size={16} />
                    <span>Kembali</span>
                  </button>
                  <span className="px-3 py-1.5 bg-white/10 text-white border border-white/20 rounded-full text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest max-w-[150px] sm:max-w-none truncate">
                    {apiData.keyword}
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl text-white flex items-center gap-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
                    <Sparkles size={24} className="text-white/70" /> 
                    Respon AI:
                  </h2>
                  <p className="text-white/80 text-sm sm:text-base leading-relaxed italic font-body">
                    "{apiData.pesan}"
                  </p>
                </div>

                <div className="space-y-3 mt-2">
                  {apiData.songs.length > 0 ? apiData.songs.map((song, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.15 }}
                      className="flex flex-col p-4 bg-white/5 border border-white/5 hover:border-white/20 rounded-xl transition-all group gap-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img src={song.cover} alt="Cover" className="w-14 h-14 rounded-lg object-cover border border-white/10 shadow-lg" />
                          <div>
                            <h4 className="font-medium text-white text-sm sm:text-base leading-tight line-clamp-1">{song.title}</h4>
                            <p className="text-xs text-white/50 line-clamp-1 mt-1">{song.artist}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-3 border-t border-white/5">
                        <button onClick={() => openSpotifyMiniPlayer(song.id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all text-[10px] sm:text-xs font-semibold tracking-wider">
                          <Headphones size={14} /> MINI PLAYER
                        </button>
                        <button onClick={() => window.open(song.spotifyUrl, "_blank")} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#1DB954]/20 text-[#1DB954] hover:bg-[#1DB954] hover:text-white transition-all text-[10px] sm:text-xs font-semibold tracking-wider">
                          <ExternalLink size={14} /> SPOTIFY
                        </button>
                      </div>
                    </motion.div>
                  )) : (
                    <p className="text-center text-white/50 py-4 font-body text-sm">Waduh, AI gagal menemukan lagu. Coba ubah kata-katamu.</p>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4 }}
          className="liquid-glass w-full rounded-3xl p-6 md:p-10 text-white/70 mt-20 mb-6"
        >
            <div className="flex flex-col items-center justify-center gap-4 text-center">
                <h2 className="text-3xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>Velorah</h2>
                <p className="text-[10px] uppercase tracking-widest opacity-50 font-body">Curated by @QistySauva</p>
            </div>
        </motion.footer>

      </div>
    </main>
  );
}