'use client';

import React, { useState, useEffect } from 'react';
import RegisterForm from '@/components/RegisterForm';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/AuthCard';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaGithub, FaSpotify, FaYoutube } from 'react-icons/fa';

const developerIds = [
  '850022237531668500',
  '579877252641325095',
  '1089577939080847360'
];
const developerLinks: Record<string, any> = {
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

const RegisterPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [developerData, setDeveloperData] = useState<Record<string, any>>({});
  const [loadingDevelopers, setLoadingDevelopers] = useState(true);
  const [developerPresence, setDeveloperPresence] = useState<Record<string, any>>({});
  const [youtubeUrls, setYoutubeUrls] = useState(['', '']);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [isPlaying, setIsPlaying] = useState([false, false]);

  useEffect(() => {
    async function fetchDevelopers() {
      setLoadingDevelopers(true);
      const results: Record<string, any> = {};
      await Promise.all(
        developerIds.map(async (id) => {
          try {
            const res = await fetch(`http://localhost:80/users/${id}`);
            if (res.ok) {
              const data = await res.json();
              results[id] = data;
            }
          } catch (e) {}
        })
      );
      setDeveloperData(results);
      setLoadingDevelopers(false);
    }
    fetchDevelopers();
  }, []);

  useEffect(() => {
    async function fetchPresence() {
      const results: Record<string, any> = {};
      await Promise.all(
        developerIds.map(async (id) => {
          try {
            const res = await fetch(`http://localhost:80/users/${id}/presence`);
            if (res.ok) {
              const data = await res.json();
              results[id] = data;
            }
          } catch (e) {}
        })
      );
      setDeveloperPresence(results);
    }
    fetchPresence();
  }, []);

  useEffect(() => {
    async function fetchYoutubeUrls() {
      try {
        const response = await fetch('/api/youtube-media');
        if (response.ok) {
          const data = await response.json();
          const fetchedUrls = Array.isArray(data.youtubeUrls) && data.youtubeUrls.length === 2 ? data.youtubeUrls : ['', ''];
          setYoutubeUrls(fetchedUrls);
          setIsPlaying([false, false]);
        } else {
          setYoutubeUrls(['', '']);
        }
      } catch (error) {
        setYoutubeUrls(['', '']);
      } finally {
        setLoadingVideo(false);
      }
    }
    fetchYoutubeUrls();
  }, []);

  if (status === 'authenticated') {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/images/background.png" 
            alt="Background" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/70 via-[#0A0A0A]/50 to-[#0A0A0A]/30"></div>
      </div>
      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center p-4 sm:p-8">
        <div className="flex flex-col lg:flex-row items-stretch justify-center gap-6 lg:gap-8 w-full max-w-7xl mx-auto">
          {/* Developers Section - Left */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full lg:w-80 bg-[#111111]/40 backdrop-blur-md rounded-2xl shadow-2xl border border-white/5 hover:border-white/10 transition-all duration-300"
          >
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-2">Sein Team's</h1>
            </div>
            <div className="space-y-2">
              {loadingDevelopers ? (
                <div className="text-white text-center py-8">Yükleniyor...</div>
              ) : (
                developerIds.map((id) => {
                  const dev = developerData[id];
                  if (!dev) return null;
                  return (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: developerIds.indexOf(id) * 0.2 }}
                      className={`rounded-xl p-4 transition-all duration-300 group relative ${developerPresence[id]?.spotify ? 'bg-gradient-to-br from-[#1DB954] to-[#1ed760] text-white shadow-lg' : 'bg-[#1E1E1E]/30 hover:bg-[#1E1E1E]/50'}`}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/30 bg-[#1E293B]">
                            <img
                              src={dev.avatar}
                              alt={dev.username}
                              className="w-full h-full object-cover"
                            />
                            {developerPresence[id] && (
                              <span
                                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#1E1E1E] ${
                                  developerPresence[id].status && developerPresence[id].status !== 'offline' ? 'bg-green-500' :
                                  developerPresence[id].status === 'idle' ? 'bg-yellow-400' :
                                  developerPresence[id].status === 'dnd' ? 'bg-red-500' :
                                  'bg-gray-500'
                                }`}
                                style={{ boxShadow: '0 0 0 2px #1E1E1E' }}
                              />
                            )}
                          </div>
                        </div>
                        <div>
                          <span className={`font-medium group-hover:text-white transition-colors ${developerPresence[id]?.spotify ? 'text-white' : 'text-white'}`}>{dev.username}</span>
                          <p className={`text-sm italic ${developerPresence[id]?.spotify ? 'text-white/90' : 'text-white'}`}>{id === '850022237531668500' ? 'Provider' : id === '579877252641325095' ? 'Developer' : id === '1089577939080847360' ? 'Discord Bot Builder' : ''}</p>
                        </div>
                      </div>
                      <div className="flex justify-center space-x-4 mt-3">
                        {developerLinks[id]?.github && (
                          <motion.a
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            href={developerLinks[id].github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${developerPresence[id]?.spotify ? 'text-white hover:text-white' : 'text-gray-400 hover:text-white'} transition-colors`}
                          >
                            <FaGithub size={20} />
                          </motion.a>
                        )}
                        {developerLinks[id]?.spotify && (
                          <motion.a
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            href={developerLinks[id].spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${developerPresence[id]?.spotify ? 'text-white hover:text-white' : 'text-gray-400 hover:text-white'} transition-colors`}
                          >
                            <FaSpotify size={20} />
                          </motion.a>
                        )}
                        {developerLinks[id]?.youtube && (
                          <motion.a
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            href={developerLinks[id].youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${developerPresence[id]?.spotify ? 'text-white hover:text-white' : 'text-gray-400 hover:text-white'} transition-colors`}
                          >
                            <FaYoutube size={20} />
                          </motion.a>
                        )}
                      </div>
                      {developerPresence[id]?.spotify && (
                        <div className="mt-4 flex items-center gap-3 animate-pulse">
                          {developerPresence[id].spotify.albumArt && (
                            <img src={developerPresence[id].spotify.albumArt} alt="album" className="w-10 h-10 rounded-md shadow-md" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate">{developerPresence[id].spotify.track}</div>
                            <div className="text-xs truncate opacity-80">{developerPresence[id].spotify.artist}</div>
                          </div>
                          {developerPresence[id].spotify.url && (
                            <a href={developerPresence[id].spotify.url} target="_blank" rel="noopener noreferrer" className="ml-2">
                              <FaSpotify size={24} className="text-white" />
                            </a>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
          {/* Main Section - Center */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-[480px] mx-auto"
          >
            <AuthCard title="Register">
        <RegisterForm />
            </AuthCard>
          </motion.div>
          {/* YouTube Media Section - Right */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
            className="w-full lg:w-80 bg-[#111111]/40 backdrop-blur-md rounded-2xl shadow-2xl border border-white/5 hover:border-white/10 transition-all duration-300"
          >
            <div className="p-6 space-y-6">
              <h2 className="text-2xl font-bold text-white text-center">Official Video</h2>
              <div className="aspect-video w-full rounded-lg overflow-hidden relative cursor-pointer">
                {loadingVideo ? (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400">Yükleniyor...</div>
                ) : youtubeUrls[0] ? (
                  isPlaying[0] ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeUrls[0].split('v=')[1] || youtubeUrls[0].split('youtu.be/')[1].split('?')[0]}?autoplay=1&showinfo=0&controls=1&rel=0`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  ) : (
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
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
