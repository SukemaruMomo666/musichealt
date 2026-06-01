import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Music2, Globe, MessageCircle, MonitorPlay, Camera, Volume2, VolumeX, Loader2, ArrowLeft, Play } from 'lucide-react';

export default function App() {
  const [moodText, setMoodText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  
  // State baru untuk menyimpan data asli dari Backend
  const [apiData, setApiData] = useState({ pesan: "", keyword: "", songs: [] });
  
  const audioRef = useRef(null);

  const toggleMusic = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => console.log("Autoplay diblokir", err));
    }
    setIsPlaying(!isPlaying);
  };

  // Fungsi yang sudah disambungkan ke Backend Node.js
  const handleAnalyze = async () => {
    if (!moodText.trim()) return alert("Ceritain dulu perasaanmu sedikit ya!");
    
    setIsLoading(true);
    
    try {
      // Menembak API lokal yang tadi kita buat
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moodText })
      });

      if (!response.ok) throw new Error("Gagal mengambil data dari server");

      const data = await response.json();
      
      // Simpan data dari server ke state React
      setApiData(data);
      setShowResult(true);

    } catch (error) {
      console.error(error);
      alert("Waduh, server backend sepertinya belum nyala atau ada error!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setShowResult(false);
    setMoodText('');
  };

  return (
    <main className="relative bg-gray-950 w-full min-h-[115vh] overflow-x-hidden flex flex-col items-center font-sans selection:bg-white/20 selection:text-white">
      
      <audio ref={audioRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" loop />

      {/* Background Video */}
      <video 
        autoPlay loop muted playsInline
        className="fixed inset-0 w-full h-full object-cover z-[0] opacity-50"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_114316_1c7889ad-2885-410e-b493-98119fee0ddb.mp4"
      />

      {/* Floating Ambient Music Controller */}
      <div className="fixed top-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleMusic}
          className="liquid-glass flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium text-white/90 shadow-lg cursor-pointer border border-white/10 backdrop-blur-md"
        >
          {isPlaying ? (
            <>
              <Volume2 size={16} className="text-teal-400 animate-pulse" />
              <span>Playing Chill Music</span>
            </>
          ) : (
            <>
              <VolumeX size={16} className="text-white/40" />
              <span>Music Paused</span>
            </>
          )}
        </motion.button>
      </div>

      <div className="relative z-10 w-full max-w-7xl flex flex-col justify-between px-6 md:px-12 h-full flex-grow pb-10 min-h-screen">
        
        <div className="flex-grow flex flex-col items-center justify-center pt-32 w-full max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            
            {!showResult ? (
              // HALAMAN INPUT FORM
              <motion.div
                key="input-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="w-full flex flex-col gap-6 liquid-glass p-8 rounded-3xl"
              >
                <div className="text-center space-y-3">
                  <h1 className="text-4xl md:text-5xl font-bold flex items-center justify-center gap-3 text-white tracking-tight">
                    <Brain size={40} className="text-teal-400" />
                    MusicHealt
                  </h1>
                  <p className="text-white/70 text-sm md:text-base">
                    Ceritakan kondisimu hari ini. AI akan meracik rekomendasi musik yang tepat untukmu.
                  </p>
                </div>

                <div className="bg-black/20 border border-white/10 p-5 rounded-2xl shadow-inner">
                  <textarea
                    disabled={isLoading}
                    className="w-full h-32 bg-transparent resize-none outline-none placeholder-white/40 text-lg text-white disabled:opacity-50"
                    placeholder="Ketik di sini... (contoh: capek banget habis ngerjain tugas, butuh yang santai)"
                    value={moodText}
                    onChange={(e) => setMoodText(e.target.value)}
                    onFocus={() => { if(!isPlaying) toggleMusic(); }}
                  />
                </div>

                <motion.button
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  onClick={handleAnalyze}
                  className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 transition-all backdrop-blur-sm min-h-[60px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin text-teal-400" />
                      <span>AI Sedang Menganalisis Jiwamu...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} className="text-teal-400" />
                      <span>Analisis & Cari Lagu</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            ) : (
              // HALAMAN HASIL REKOMENDASI DARI API
              <motion.div
                key="result-screen"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="w-full flex flex-col gap-6 liquid-glass p-8 rounded-3xl"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <button onClick={handleReset} className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors cursor-pointer">
                    <ArrowLeft size={16} />
                    <span>Coba Lagi</span>
                  </button>
                  <span className="px-3 py-1 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-full text-xs font-semibold uppercase tracking-wider">
                    Keyword: {apiData.keyword}
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Sparkles size={24} className="text-teal-400" /> 
                    Pesan AI:
                  </h2>
                  <p className="text-white/80 text-lg leading-relaxed italic">
                    "{apiData.pesan}"
                  </p>
                </div>

                {/* List Card Lagu Asli dari iTunes API */}
                <div className="space-y-3 mt-2">
                  {apiData.songs.length > 0 ? apiData.songs.map((song, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.15 }}
                      className="flex items-center justify-between p-4 bg-white/5 border border-white/5 hover:border-white/20 rounded-xl transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        {/* Menampilkan Cover Album Asli */}
                        <img 
                          src={song.cover} 
                          alt="Album Cover" 
                          className="w-12 h-12 rounded-lg object-cover border border-white/10 group-hover:scale-105 transition-transform"
                        />
                        <div>
                          <h4 className="font-semibold text-white text-base group-hover:text-teal-300 transition-colors line-clamp-1">{song.title}</h4>
                          <p className="text-xs text-white/50 line-clamp-1">{song.artist}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex gap-1.5">
                          <span className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 text-white/60 rounded-md">
                            {song.genre}
                          </span>
                        </div>
                        {/* Tombol Play ini sekarang akan membuka link preview audio di tab baru */}
                        <button 
                          onClick={() => window.open(song.previewUrl, "_blank")}
                          title="Dengarkan Preview"
                          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-teal-500 hover:text-gray-950 transition-all cursor-pointer flex-shrink-0"
                        >
                          <Play size={14} fill="currentColor" className="ml-0.5" />
                        </button>
                      </div>
                    </motion.div>
                  )) : (
                    <p className="text-center text-white/50 py-4">Waduh, AI gagal menemukan lagu yang cocok. Coba cerita lagi ya!</p>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* The Liquid Glass Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="liquid-glass w-full rounded-3xl p-6 md:p-10 text-white/70 mt-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 mb-10">
            <div className="md:col-span-5 flex flex-col gap-4">
              <div className="flex items-center gap-3 text-white">
                <Brain size={24} className="text-teal-400" />
                <span className="text-xl font-medium uppercase tracking-widest">MUSICHEALT</span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">
                Platform cerdas yang menganalisis sentimen dari ceritamu dan mengubahnya menjadi rekomendasi musik penyembuh jiwa.
              </p>
            </div>

            <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-sm uppercase tracking-wider text-white font-medium mb-4">Fitur</h4>
                <div className="text-xs space-y-2 flex flex-col">
                  {['Analisis Mood', 'Integrasi iTunes', 'Riwayat Lagu'].map(item => (
                    <a key={item} href="#" className="hover:text-white transition-colors">{item}</a>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm uppercase tracking-wider text-white font-medium mb-4">Dukungan</h4>
                <div className="text-xs space-y-2 flex flex-col">
                  {['Pusat Bantuan', 'Kebijakan Privasi', 'Syarat & Ketentuan'].map(item => (
                    <a key={item} href="#" className="hover:text-white transition-colors">{item}</a>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm uppercase tracking-wider text-white font-medium mb-4">Komunitas</h4>
                <div className="text-xs space-y-2 flex flex-col">
                  {['Discord', 'Blog Kesehatan', 'Event'].map(item => (
                    <a key={item} href="#" className="hover:text-white transition-colors">{item}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
            <p className="text-[10px] uppercase tracking-widest opacity-50">Curated by @QistySauva</p>
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-widest opacity-50">Join the Journey:</span>
              <div className="flex items-center gap-4">
                {[Music2, Globe, MessageCircle, MonitorPlay, Camera].map((Icon, idx) => (
                  <a key={idx} href="#" className="opacity-70 hover:opacity-100 transition-colors hover:text-white">
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </motion.footer>

      </div>
    </main>
  );
}