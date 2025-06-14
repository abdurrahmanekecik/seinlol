'use client';

import React, { useState, useEffect, useRef } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { FaGithub, FaSpotify, FaYoutube, FaHeart, FaComment, FaBookmark, FaShare } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';

// Developer Discord IDs
const developerIds = [
  '850022237531668500',
  '579877252641325095',
  '1089577939080847360'
];

// Social links for each developer by ID
const developerLinks: Record<string, { github?: string; spotify?: string; youtube?: string }> = {
  '850022237531668500': {
    github: 'https://github.com/seinlol',
    spotify: 'https://open.spotify.com/user/username1',
    youtube: 'https://youtube.com/@seinlol',
  },
  '579877252641325095': {
    github: 'https://github.com/Voidev1337',
    spotify: 'https://open.spotify.com/user/exzw0pbwd6dglif2cwz4rduh4',
  },
  '1089577939080847360': {
    github: 'https://github.com/lng999',
    spotify: 'https://open.spotify.com/user/username3',
    youtube: 'https://youtube.com/@lng999',
  },

};





export default function Home() {
  const { data: session } = useSession();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [likes, setLikes] = useState<{ [key: number]: boolean }>({});
  const [showAllComments, setShowAllComments] = useState<{ [key: number]: boolean }>({});
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const router = useRouter();

  // Developer info state
  const [developerData, setDeveloperData] = useState<Record<string, any>>({});
  const [loadingDevelopers, setLoadingDevelopers] = useState(true);

  // Add state for presence/spotify
  const [developerPresence, setDeveloperPresence] = useState<Record<string, any>>({});

  // State for YouTube video URL
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>(['', '']);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [isPlaying, setIsPlaying] = useState<boolean[]>([false, false]);

  const [showRegister, setShowRegister] = useState(false);

  const [now, setNow] = useState(Date.now());

  const [liveCurrent, setLiveCurrent] = useState<Record<string, number | null>>({});

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  useEffect(() => {
    async function fetchDevelopers() {
      setLoadingDevelopers(true);
      const results: Record<string, any> = {};
      
          try {
        // Discord presence API'sinden veri al
        const res = await fetch('/api/discord-presence');
            if (res.ok) {
          const presenceData = await res.json();
          
          // Her developer için veri oluştur
          developerIds.forEach(id => {
            const userData = presenceData[id];
            if (userData) {
              results[id] = {
                id: userData.id,
                username: userData.username || userData.display_name || 'Unknown',
                avatar: userData.avatar || '/images/users/default.png'
              };
            } else {
              // Fallback: Eğer presence verisi yoksa varsayılan veri
              results[id] = {
                id: id,
                username: id === '850022237531668500' ? 'seinlol' :
                         id === '579877252641325095' ? 'vfx_2tact' :
                         id === '1089577939080847360' ? 'lng999' : 'Unknown',
                avatar: '/images/users/default.png'
              };
            }
          });
        } else {
          // API hatası durumunda fallback veriler
          developerIds.forEach(id => {
            results[id] = {
              id: id,
              username: id === '850022237531668500' ? 'seinlol' :
                       id === '579877252641325095' ? 'vfx_2tact' :
                       id === '1089577939080847360' ? 'lng999' : 'Unknown',
              avatar: '/images/users/default.png'
            };
          });
            }
          } catch (e) {
        console.error('Error fetching developers:', e);
        // Hata durumunda fallback veriler
        developerIds.forEach(id => {
          results[id] = {
            id: id,
            username: id === '850022237531668500' ? 'seinlol' :
                     id === '579877252641325095' ? 'vfx_2tact' :
                     id === '1089577939080847360' ? 'lng999' : 'Unknown',
            avatar: '/images/users/default.png'
          };
        });
      }
      
      setDeveloperData(results);
      setLoadingDevelopers(false);
    }
    fetchDevelopers();
  }, []);

  useEffect(() => {
    async function fetchPresence() {
          try {
        const res = await fetch('/api/discord-presence');
            if (res.ok) {
              const data = await res.json();
          setDeveloperPresence(data);
        }
      } catch (e) {
        console.error('Presence fetch hatası:', e);
            }
    }
    
    fetchPresence();
    // Her 30 saniyede bir güncelle
    const interval = setInterval(fetchPresence, 15000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch YouTube video URLS
  useEffect(() => {
    async function fetchYoutubeUrls() {
      try {
        const response = await fetch('/api/youtube-media');
        if (response.ok) {
          const data = await response.json();
          // Ensure data.youtubeUrls is an array, default to two empty strings
          const fetchedUrls = Array.isArray(data.youtubeUrls) && data.youtubeUrls.length === 2 ? data.youtubeUrls : ['', ''];
          setYoutubeUrls(fetchedUrls);
          // Reset isPlaying state when URLs are fetched
          setIsPlaying([false, false]);
        } else {
          console.error('Failed to fetch YouTube URLs', response.status);
          setYoutubeUrls(['', '']);
        }
      } catch (error) {
        console.error('Error fetching YouTube URLs:', error);
        setYoutubeUrls(['', '']);
      } finally {
        setLoadingVideo(false);
      }
    }
    fetchYoutubeUrls();
  }, []);

  // Beğeni toggle fonksiyonu
  const toggleLike = (postId: number) => {
    setLikes(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleDoubleClick = (postId: number) => {
    if (!likes[postId]) {
      setLikes(prev => ({
        ...prev,
        [postId]: true
      }));
    }
    setShowHeartAnimation(true);
    setTimeout(() => {
      setShowHeartAnimation(false);
    }, 1500);
  };

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  useEffect(() => {
    developerIds.forEach((id) => {
      const presence = developerPresence[id];
      if (presence?.spotify?.current !== undefined) {
        setLiveCurrent((prev) => ({ ...prev, [id]: presence.spotify.current }));
      }
    });
    // eslint-disable-next-line
  }, [developerPresence]);

  useEffect(() => {
    const intervals: Record<string, NodeJS.Timeout> = {};
    developerIds.forEach((id) => {
      const presence = developerPresence[id];
      const duration = presence?.spotify?.duration ?? 0;
      if (presence?.spotify && liveCurrent[id] !== null && duration > 0) {
        intervals[id] = setInterval(() => {
          setLiveCurrent((prev) => {
            const current = prev[id] ?? 0;
            if (current < duration) {
              return { ...prev, [id]: current + 1 };
            }
            return prev;
          });
        }, 1000);
      }
    });
    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
    // eslint-disable-next-line
  }, [developerPresence, liveCurrent]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Background Image with Opacity */}
        <div className="absolute inset-0">
          <img 
            src="/images/background.png" 
            alt="YBN:Turkey Forum Background" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/70 via-[#0A0A0A]/50 to-[#0A0A0A]/30"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center p-4 sm:p-8">
        <div className="flex flex-col lg:flex-row items-stretch justify-center gap-6 lg:gap-8 w-full max-w-7xl mx-auto">
          {/* Developers Section - Left */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full lg:w-80 bg-gradient-to-br from-[#111111]/40 to-[#1a1a1a]/40 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300"
          >
            <div className="p-6 border-b border-white/10">
              <h1 className="text-xl font-semibold mb-1 bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent tracking-tight">
                Sein Team's
              </h1>
            </div>
            
            <div className="p-3 space-y-3">
              {loadingDevelopers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                  <span className="ml-3 text-gray-400">Loading...</span>
                </div>
              ) : (
                developerIds.map((id) => {
                  const dev = developerData[id];
                  if (!dev) return null;
                  
                  const presence = developerPresence[id];
                  const status = presence?.status;
                  const isOnline = status === 'online';
                  const isIdle = status === 'idle';
                  const isDnd = status === 'dnd';
                  const isOffline = !status || status === 'offline';
                  const isSpotify = presence?.spotify;
                  const isGaming = presence?.game;
                  const isActivity = presence?.activity;
                  
                  const start = isSpotify && presence.spotify.start ? presence.spotify.start * 1000 : 0;
                  const duration = isSpotify && presence.spotify.duration ? presence.spotify.duration * 1000 : 0;
                  const elapsed = start ? Math.max(0, Math.min(duration, now - start)) : 0;
                  
                  return (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: developerIds.indexOf(id) * 0.1 }}
                      className={`relative overflow-hidden rounded-lg p-3 transition-all duration-300 group 
                        ${isSpotify ? 'bg-gradient-to-br from-[#1DB954]/40 to-[#1ed760]/40 border border-[#1DB954]/60' : 'bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-white/10'}
                        hover:scale-[1.03] hover:shadow-lg`}
                    >
                      {/* Background Glow Effect */}
                      <div className={`absolute inset-0 opacity-10 ${isSpotify ? 'bg-gradient-to-r from-[#1DB954] to-[#1ed760]' : 'bg-gradient-to-r from-gray-600 to-gray-700'} blur-xl`}></div>
                      
                      <div className="relative z-10 flex items-center space-x-2 mb-2">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-white/10 bg-gradient-to-br from-gray-700 to-gray-800 shadow">
                            <img
                              src={dev.avatar || '/images/users/default.png'}
                              alt={dev.username}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {/* Status Indicator */}
                          <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-gray-900 shadow ${
                            isOnline ? 'bg-green-500' :
                            isIdle ? 'bg-yellow-400' :
                            isDnd ? 'bg-red-500' :
                            'bg-gray-500'
                          }`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white text-base truncate">
                            {dev.username}
                          </h3>
                          <p className="text-xs text-gray-400 font-normal">
                            {id === '579877252641325095' ? 'Admin' :
                             id === '850022237531668500' ? 'Admin' :
                             id === '1089577939080847360' ? 'Admin' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Activity Status */}
                      {isSpotify && (
                        <div className="mb-1 p-2 bg-[#1DB954]/10 rounded-lg flex items-center gap-3 shadow-sm hover:shadow-md transition-all duration-150">
                          <div className="w-14 h-14 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                            {presence.spotify.albumArt ? (
                              <img src={presence.spotify.albumArt} alt="album" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-[#1DB954] text-2xl">🎵</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-normal text-[#1DB954] text-base truncate">
                              {presence.spotify.track}
                            </div>
                            <div className="text-xs text-[#1DB954]/80 truncate mb-0.5">
                              {presence.spotify.artist}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[10px] text-gray-400">{formatTime(liveCurrent[id] ?? presence.spotify.current ?? 0)}</span>
                              <div className="flex-1 h-1 bg-gray-700 rounded">
                                <div
                                  className="h-1 bg-[#1DB954] rounded transition-all duration-200"
                                  style={{
                                    width: presence.spotify.duration
                                      ? `${((liveCurrent[id] ?? presence.spotify.current ?? 0) / presence.spotify.duration) * 100}%`
                                      : '0%',
                                  }}
                                />
                              </div>
                              <span className="text-[10px] text-gray-400">{formatTime(presence.spotify.duration)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {isGaming && (
                        <div className="mb-1 p-2 bg-purple-500/10 rounded border border-purple-500/10 flex items-center gap-2">
                          {/* Oyun resmi varsa göster */}
                          {presence.game.icon ? (
                            <img src={presence.game.icon} alt={presence.game.name} className="w-7 h-7 rounded-md bg-purple-500/20 object-cover" />
                          ) : (
                          <div className="w-7 h-7 rounded-md bg-purple-500/20 flex items-center justify-center">
                            <span className="text-purple-400 text-base">🎮</span>
                          </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-purple-400 text-xs truncate">
                              Playing: {presence.game.name}
                            </div>
                          </div>
                        </div>
                      )}

                      {isActivity && (
                        <div className="mb-1 p-2 bg-blue-500/10 rounded border border-blue-500/10 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-blue-500/20 flex items-center justify-center">
                            <span className="text-blue-400 text-base">⚡</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-blue-400 text-xs truncate">
                              {presence.activity.name}
                            </div>
                            {presence.activity.details && (
                              <div className="text-[11px] text-blue-400/80 truncate">
                                {presence.activity.details}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Main Login Section - Center */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-[480px] mx-auto"
          >
            <div className="bg-[#111111]/40 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/5 hover:border-white/10 transition-all duration-300">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-8"
              >
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FFFFFF] to-[#60A5FA] bg-clip-text text-transparent">
                  {showRegister ? 'Register' : 'Login'}
                </h1>
              </motion.div>
              <AnimatePresence mode="wait" initial={false}>
                {showRegister ? (
                <motion.div
                    key="register"
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -30 }}
                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <RegisterForm onSwitchToLogin={() => setShowRegister(false)} />
                </motion.div>
              ) : (
                <motion.div
                    key="login"
                    initial={{ opacity: 0, scale: 0.95, y: -30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 30 }}
                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <LoginForm onSwitchToRegister={() => setShowRegister(true)} />
                </motion.div>
              )}
              </AnimatePresence>
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">© 2024 Seinlol</p>
                <p className="mt-1 text-sm text-gray-500">All rights reserved by Seinlol<span className="font-bold text-gray-250 opacity-75"> </span></p>
              </div>
            </div>
          </motion.div>

          {/* YouTube Media Section - Right */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            className="w-full lg:w-80 bg-[#111111]/40 backdrop-blur-md rounded-2xl shadow-2xl border border-white/5 hover:border-white/10 transition-all duration-300"
          >
            <div className="p-6 space-y-6">
              <h2 className="text-2xl font-bold text-white text-center">Official Video</h2>
              {/* Placeholder for YouTube iframe */}
              <div className="aspect-video w-full rounded-lg overflow-hidden relative cursor-pointer">
                {loadingVideo ? (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400">Yükleniyor...</div>
                ) : youtubeUrls[0] ? (
                  isPlaying[0] ? (
                    // Iframe when playing
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeUrls[0].split('v=')[1] || youtubeUrls[0].split('youtu.be/')[1].split('?')[0]}?autoplay=1&showinfo=0&controls=1&rel=0`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  ) : (
                    // Thumbnail when not playing
                    <div
                      className="w-full h-full bg-cover bg-center flex items-center justify-center"
                      style={{ backgroundImage: `url(https://img.youtube.com/vi/${youtubeUrls[0].split('v=')[1] || youtubeUrls[0].split('youtu.be/')[1].split('?')[0]}/maxresdefault.jpg)`}}
                      onClick={() => setIsPlaying(prev => [true, prev[1]])}
                    >
                    </div>
                  )
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400">
                    Video bulunamadı.
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Optional Second YouTube Media Section */}
          {youtubeUrls[1] && (
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
              className="w-full lg:w-80 bg-[#111111]/40 backdrop-blur-md rounded-2xl shadow-2xl border border-white/5 hover:border-white/10 transition-all duration-300"
            >
              <div className="p-6 space-y-6">
                <h2 className="text-2xl font-bold text-white text-center">Official Video 2</h2>
                <div className="aspect-video w-full rounded-lg overflow-hidden relative cursor-pointer">
                  {loadingVideo ? (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400">Yükleniyor...</div>
                  ) : youtubeUrls[1] ? (
                    isPlaying[1] ? (
                      // Iframe when playing
                      <iframe
                        src={`https://www.youtube.com/embed/${youtubeUrls[1].split('v=')[1] || youtubeUrls[1].split('youtu.be/')[1].split('?')[0]}?autoplay=1&showinfo=0&controls=1&rel=0`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    ) : (
                      // Thumbnail when not playing
                      <div
                        className="w-full h-full bg-cover bg-center flex items-center justify-center"
                        style={{ backgroundImage: `url(https://img.youtube.com/vi/${youtubeUrls[1].split('v=')[1] || youtubeUrls[1].split('youtu.be/')[1].split('?')[0]}/maxresdefault.jpg)`}}
                        onClick={() => setIsPlaying(prev => [prev[0], true])}
                      >
                      </div>
                    )
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400">
                      Video Bulunamadı
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ 
              type: "spring", 
              damping: 30, 
              stiffness: 300,
              mass: 0.8
            }}
            className="relative w-full max-w-sm bg-black rounded-t-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
          
            
           
          </motion.div>
        </motion.div>
      )}

      
      <style jsx global>{`
        @keyframes float {
          0% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(10px, 10px) rotate(5deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        @keyframes float-delay {
          0% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-10px, 15px) rotate(-5deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        @keyframes float-slow {
          0% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(15px, -10px) rotate(8deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        .animate-float-delay {
          animation: float-delay 25s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 30s ease-in-out infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(107, 114, 128, 0.3);
          border-radius: 20px;
          border: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(107, 114, 128, 0.5);
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(107, 114, 128, 0.3) transparent;
        }
      `}</style>
    </div>
  );
} 