'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiDashboardLine,
  RiUser3Line,
  RiMenuLine,
  RiCloseLine,
  RiNotification3Line,
  RiSearchLine,
  RiLogoutBoxRLine,
  RiSettings4Line,
  RiShoppingBag3Line,
  RiKeyLine,
  RiStore2Line,
  RiCoinLine,
  RiGithubFill,
  RiSpotifyFill,
  RiYoutubeFill,
  RiFileList3Line
} from 'react-icons/ri';
import { signOut } from 'next-auth/react';
import type { ServerStatus, Activity, Announcement } from '@/utils/database';
import admins from '@/data/helele.json';
import Select from 'react-select';

// Interfaces for handling purchase and license data
interface Purchase {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  productId: number;
  productName: string;
  licenseCode: string;
  amount: number;
  price: number;
  currency: string;
  purchaseDate: string;
  status: 'completed' | 'pending' | 'failed';
}

interface LicenseCode {
  id: string;
  code: string;
  productId: number;
  productName: string;
  isAssigned: boolean;
  assignedToUserId?: string;
  assignedToUserName?: string;
  assignedDate?: string;
  expiryDate?: string;
}

// Developer Discord IDs (Same as main page)
const developerIds = [
  '850022237531668500',
  '579877252641325095',
  '1089577939080847360'
];

// Social links for each developer by ID (Same as main page)
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

// Dashboard bileşenleri
const DashboardContent = ({ currentLanguage }: { currentLanguage: 'tr' | 'en' }) => {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isBotOnline, setIsBotOnline] = useState(true);
  const [botStatus, setBotStatus] = useState<string | null>(null);
  const [teamsVideoUrl, setTeamsVideoUrl] = useState<string | null>(null);
  const [seinTeamsVideos, setSeinTeamsVideos] = useState<string[]>(['', '']); // State for Sein Teams videos (from main page)
  const [developers, setDevelopers] = useState<any[]>([]); // State for developers
  const [loadingDevelopers, setLoadingDevelopers] = useState(true);
  const [developerPresence, setDeveloperPresence] = useState<Record<string, any>>({}); // State for developer presence
  const [now, setNow] = useState(Date.now());
  const [liveCurrent, setLiveCurrent] = useState<Record<string, number | null>>({});
  const [topUsers, setTopUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, activitiesRes, announcementsRes] = await Promise.all([
          fetch('/api/server-status'),
          fetch('/api/activities'),
          fetch('/api/announcements')
        ]);

        const status = await statusRes.json();
        const activities = await activitiesRes.json();
        const announcements = await announcementsRes.json();

        setServerStatus(status);
        // Only take the last 3 activities and sort by timestamp
        setActivities(activities.sort((a: Activity, b: Activity) => 
          new Date(b.timestamp || Date.now()).getTime() - new Date(a.timestamp || Date.now()).getTime()
        ).slice(0, 3));
        setAnnouncements(announcements);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Bot durumunu kontrol eden useEffect
  useEffect(() => {
    // Bot her zaman online
    setIsBotOnline(true);
  }, []);

  useEffect(() => {
    const fetchTeamsVideoUrl = async () => {
      try {
        const response = await fetch('/api/youtube-teams-media');
        const data = await response.json();
        if (data && data.youtubeUrl) {
          setTeamsVideoUrl(data.youtubeUrl);
        }
      } catch (error) {
        console.error('Error fetching teams video URL:', error);
      }
    };

    fetchTeamsVideoUrl();
  }, []);

  useEffect(() => { // Add useEffect to fetch Sein Teams videos from main page source
    const fetchSeinTeamsVideos = async () => {
      try {
        const response = await fetch('/api/youtube-media'); // Fetch from the same API as the main page
        const data = await response.json();
        if (data && Array.isArray(data.youtubeUrls)) {
          setSeinTeamsVideos(data.youtubeUrls);
        }
      } catch (error) {
        console.error('Error fetching Sein Teams videos:', error);
      }
    };

    fetchSeinTeamsVideos();
  }, []);

  // Fetch developers data (same as main page)
  useEffect(() => {
    async function fetchDevelopers() {
      setLoadingDevelopers(true);
      const results: {id: string, username: string, avatar: string}[] = [];
          try {
        const res = await fetch('/api/discord-presence');
            if (res.ok) {
          const presenceData = await res.json();
          developerIds.forEach(id => {
            const userData = presenceData[id];
            if (userData) {
              results.push({
                id: userData.id,
                username: userData.username || userData.display_name ||
                  (id === '850022237531668500' ? 'seinlol' :
                   id === '579877252641325095' ? 'vfx_2tact' :
                   id === '1089577939080847360' ? 'lng999' : 'Unknown'),
                avatar: userData.avatar || '/images/users/default.png'
              });
            } else {
              results.push({
                id: id,
                username: id === '850022237531668500' ? 'seinlol' :
                          id === '579877252641325095' ? 'vfx_2tact' :
                          id === '1089577939080847360' ? 'lng999' : 'Unknown',
                avatar: '/images/users/default.png'
              });
            }
          });
        } else {
          developerIds.forEach(id => {
            results.push({
              id: id,
              username: id === '850022237531668500' ? 'seinlol' :
                        id === '579877252641325095' ? 'vfx_2tact' :
                        id === '1089577939080847360' ? 'lng999' : 'Unknown',
              avatar: '/images/users/default.png'
            });
          });
            }
          } catch (e) {
        developerIds.forEach(id => {
          results.push({
            id: id,
            username: id === '850022237531668500' ? 'seinlol' :
                      id === '579877252641325095' ? 'vfx_2tact' :
                      id === '1089577939080847360' ? 'lng999' : 'Unknown',
            avatar: '/images/users/default.png'
          });
        });
      }
      setDevelopers(results);
      setLoadingDevelopers(false);
    }
    fetchDevelopers();
  }, []);

  // Fetch developer presence (same as main page)
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
    
    // Fetch presence initially and then every 5 seconds
    fetchPresence();
    const presenceInterval = setInterval(fetchPresence, 5000); // Refresh every 5 seconds
    return () => clearInterval(presenceInterval);
  }, []);

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

  // Helper function to format relative time
  const getRelativeTime = (timestamp: string | number) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - activityTime.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} saniye önce`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
    return `${Math.floor(diffInSeconds / 86400)} gün önce`;
  };

  // Helper function to get activity color
  const getActivityColor = (action: string, type: string) => {
    if (type === 'application') {
      switch (action) {
        case 'Başvuru Yaptı':
          return 'text-yellow-400';
        case 'Başvurusu Onaylandı':
          return 'text-green-400';
        case 'Başvurusu Reddedildi':
          return 'text-red-400';
        default:
          return 'text-gray-400';
      }
    } else {
      switch (action) {
        case 'Giriş Yaptı':
          return 'text-blue-400';
        case 'Çıkış Yaptı':
          return 'text-gray-400';
        default:
          return 'text-gray-400';
      }
    }
  };

  // Helper function to get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application':
        return 'bg-yellow-500/20 ring-yellow-500/20';
      default:
        return 'bg-blue-500/20 ring-blue-500/20';
    }
  };

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
    fetch('/api/users')
      .then(res => res.json())
      .then(usersData => {
        const users = Array.isArray(usersData) ? usersData : usersData.users;
        const sorted = users
          .filter((user: { coin: number }) => typeof user.coin === 'number')
          .sort((a: { coin: number }, b: { coin: number }) => b.coin - a.coin)
          .slice(0, 3);
        setTopUsers(sorted);
      });
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-gray-900/70 to-black/70 p-5 rounded-2xl border border-gray-800/40 shadow-2xl backdrop-blur-sm"
      >
        <h3 className="text-xl font-semibold mb-4 text-white">
          {currentLanguage === 'en' ? 'Server Status' : 'Sunucu Durumu'}
        </h3>
        <div className="flex flex-col space-y-4">
          {/* Sunucu Durumu Göstergesi */}
        <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-green-500" />
          </div>
          <div>
              <p className="text-white font-medium text-base">Online</p>
              <p className="text-gray-400 text-sm">
                {currentLanguage === 'en' ? 'Running' : 'Çalışıyor'}
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-4 text-white">
            {currentLanguage === 'en' ? 'Bot Status' : 'Bot Durumu'}
          </h3>
          {/* Bot Durumu Göstergesi */}
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 rounded-full ${isBotOnline ? 'bg-green-500/20' : 'bg-red-500/20'} flex items-center justify-center`}>
              <div className={`w-4 h-4 rounded-full ${isBotOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <div>
              <p className="text-white font-medium text-base">{isBotOnline ? 'Online' : 'Offline'}</p>
              <p className="text-gray-400 text-sm">
                {isBotOnline 
                  ? (currentLanguage === 'en' ? 'Running' : 'Çalışıyor')
                  : (currentLanguage === 'en' ? 'Stopped' : 'Kapalı')
                }
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-gray-900/70 to-black/70 p-5 rounded-2xl border border-gray-800/40 shadow-2xl backdrop-blur-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">
            {currentLanguage === 'en' ? 'Top 3 Richest Users' : 'En Zengin 3 Kullanıcı'}
          </h3>
        </div>
        <div className="space-y-3">
          {topUsers.map((user: { id: string; name: string; image: string; coin: number }) => (
            <div key={user.id} className="bg-white/5 rounded-lg p-3 transition-colors hover:bg-white/10">
              <div className="flex items-center space-x-3">
                <img src={user.image || '/images/users/default.png'} alt={user.name} className="w-8 h-8 rounded-full" />
                <span className="text-white font-medium">{user.name}</span>
                <span className="ml-auto text-yellow-400 font-bold">{user.coin} coin</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-gray-900/70 to-black/70 p-5 rounded-2xl border border-gray-800/40 shadow-2xl backdrop-blur-sm"
      >
        <h3 className="text-xl font-semibold mb-4 text-white">
          {currentLanguage === 'en' ? 'Announcements' : 'Duyurular'}
        </h3>
        <div className="space-y-3">
          {announcements.slice(0, 2).map((announcement) => (
            <div
              key={announcement.id}
              className={`p-4 ${
                announcement.isImportant ? 'bg-red-500/10' : 'bg-white/5'
              } rounded-lg`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center ring-1 ring-blue-500/20">
                  <img
                    src={announcement.adminImage || '/images/users/default.png'}
                    alt={announcement.adminName || 'Admin'}
                    className="w-6 h-6 rounded-full"
                  />
                </div>
                <div>
                  <p className="text-sm text-blue-400">{announcement.adminName || 'Admin'}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(announcement.createdAt).toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'tr-TR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <p className="text-white text-sm font-medium mb-1 truncate">{announcement.title}</p>
              <p className="text-gray-400 text-sm line-clamp-2">{announcement.description}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Nasıl Kullanılır Section (Spans 2 columns, Row 2) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="lg:col-span-2 bg-gradient-to-br from-gray-900/70 to-black/70 p-7 rounded-2xl border border-gray-800/40 shadow-2xl backdrop-blur-sm"
      >
        <h2 className="text-2xl font-semibold mb-6 text-white">
          {currentLanguage === 'en' ? 'How to Use' : 'Nasıl Kullanılır'}
        </h2>
        {/* YouTube Video */}
        {(() => {
          const [isVideoPlaying, setIsVideoPlaying] = useState(false);
          return (
            <div className="w-full md:w-3/4 lg:w-2/3 aspect-video bg-zinc-900 rounded-lg flex items-center justify-center text-gray-400 overflow-hidden">
              {teamsVideoUrl ? (
                isVideoPlaying ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${teamsVideoUrl.split('v=')[1]}?autoplay=1&showinfo=0&controls=1&rel=0`}
                    title="How to Use Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full rounded-lg"
                  ></iframe>
                ) : (
                  <img
                    src={`https://img.youtube.com/vi/${teamsVideoUrl.split('v=')[1]}/maxresdefault.jpg`}
                    alt="How to Use Video Thumbnail"
                    className="w-full h-full object-cover rounded-lg cursor-pointer"
                    onClick={() => setIsVideoPlaying(true)}
                  />
                )
              ) : (
                <span className="text-gray-400 text-sm">
                  {currentLanguage === 'en' 
                    ? 'Video not found. Please add from admin panel.' 
                    : 'Video bulunamadı. Lütfen admin panelinden ekleyin.'
                  }
                </span>
              )}
            </div>
          );
        })()}
      </motion.div>

      {/* Sein Teams Section (Developer Info, Column 3, Row 2) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-gray-900/70 to-black/70 p-7 rounded-2xl border border-gray-800/40 shadow-2xl backdrop-blur-sm w-full max-w-2xl"
      >
        <h2 className="text-xl font-semibold mb-4 text-white">Sein Teams</h2>
        <div className="text-gray-400">
          {loadingDevelopers ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
              <span className="ml-2 text-gray-400 text-sm">
                {currentLanguage === 'en' ? 'Loading members...' : 'Üyeler yükleniyor...'}
              </span>
            </div>
          ) : developers.length === 0 ? (
            <div className="text-center text-gray-400 text-base py-4">
              {currentLanguage === 'en' ? 'Member information not found.' : 'Üye bilgileri bulunamadı.'}
            </div>
          ) : (
            <div className="space-y-4">
              {developers.slice(0, 3).map(developer => {
                const presence = developerPresence[developer.id];
                const status = presence?.status;
                const isOnline = status === 'online';
                const isIdle = status === 'idle';
                const isDnd = status === 'dnd';
                const isOffline = !status || status === 'offline';
                const isSpotify = presence?.spotify;
                const isGaming = presence?.game;
                const isActivity = presence?.activity;
                const start = presence?.spotify?.start ? presence.spotify.start * 1000 : 0;
                const duration = presence?.spotify?.duration ? presence.spotify.duration * 1000 : 0;
                const elapsed = start ? Math.max(0, Math.min(duration, now - start)) : 0;
                let statusText = '';
                if (developer.id === '579877252641325095') statusText = 'Admin';
                else if (developer.id === '850022237531668500') statusText = 'Admin';
                else if (developer.id === '1089577939080847360') statusText = 'Admin';
                return (
                  <div key={developer.id} className={`relative overflow-hidden rounded-lg p-3 transition-all duration-300 group ${isSpotify ? 'bg-gradient-to-br from-[#1DB954]/20 to-[#1ed760]/20 border border-[#1DB954]/30' : 'bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-white/5'} hover:scale-[1.02] hover:shadow-lg flex items-center gap-3`}>
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-white/10 bg-gradient-to-br from-gray-700 to-gray-800 shadow-sm">
                    <img src={developer.avatar || '/images/users/default.png'} alt={developer.username} className="w-full h-full object-cover" />
                  </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-gray-900 shadow-sm ${
                        isOnline ? 'bg-green-500' :
                        isIdle ? 'bg-yellow-400' :
                        isDnd ? 'bg-red-500' :
                        'bg-gray-500'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-medium text-white text-base truncate">{developer.username}</span>
                        {statusText && <span className="ml-1 px-2 py-0.5 rounded-md bg-white/8 text-xs text-gray-300 font-normal whitespace-nowrap">{statusText}</span>}
                      </div>
                      
                      {/* Spotify Activity */}
                      {isSpotify && (
                        <div className="flex items-center gap-3 p-2 bg-[#1DB954]/8 rounded-lg">
                          <div className="w-12 h-12 rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                            {presence.spotify.albumArt ? (
                              <img src={presence.spotify.albumArt} alt="album" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#1DB954]/20">
                                <span className="text-[#1DB954] text-lg">🎵</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-[#1DB954] text-sm truncate">
                              {presence.spotify.track}
                            </div>
                            <div className="text-xs text-[#1DB954]/70 truncate mb-1">
                              {presence.spotify.artist}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-gray-400">{formatTime(liveCurrent[developer.id] ?? presence.spotify.current ?? 0)}</span>
                              <div className="flex-1 h-1 bg-gray-700/50 rounded">
                                <div
                                  className="h-1 bg-[#1DB954] rounded transition-all duration-200"
                                  style={{
                                    width: presence.spotify.duration
                                      ? `${((liveCurrent[developer.id] ?? presence.spotify.current ?? 0) / presence.spotify.duration) * 100}%`
                                      : '0%',
                                  }}
                                />
                              </div>
                              <span className="text-[10px] text-gray-400">{formatTime(presence.spotify.duration)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Gaming Activity */}
                      {isGaming && !isSpotify && (
                        <div className="flex items-center gap-2 p-2 bg-purple-500/10 rounded border border-purple-500/10">
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
                      
                      {/* Other Activity */}
                      {isActivity && !isSpotify && !isGaming && (
                        <p className="text-blue-400 text-sm truncate">
                          ⚡ {presence.activity.name}
                        </p>
                      )}
                      
                      {/* Status */}
                      {!isSpotify && !isGaming && !isActivity && presence?.status && (
                        <p className="text-gray-400 text-sm">
                          {currentLanguage === 'en' ? 'Status: ' : 'Durum: '}{presence.status}
                        </p>
                      )}
                      
                      {/* Offline */}
                      {!isSpotify && !isGaming && !isActivity && !presence?.status && (
                        <p className="text-gray-400 text-sm">
                          {currentLanguage === 'en' ? 'Offline' : 'Çevrimdışı'}
                        </p>
                     )}
                  </div>
                </div>
                );
              })}
              {developers.length > 3 && (
                <div className="text-center text-gray-400 text-sm pt-2">
                  +{developers.length - 3} üye daha
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const ProfileContent = ({ currentLanguage }: { currentLanguage: 'tr' | 'en' }) => {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [licenseCodes, setLicenseCodes] = useState<LicenseCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/users');
        const users = await response.json();
        const currentUser = users.find((user: any) => user.id === session?.user?.id);
        setUserData(currentUser);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Kullanıcı bilgileriniz yüklenirken bir hata oluştu.');
      }
    };

    const fetchLicenseCodes = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch(`/api/license-codes?userId=${session.user.id}`);
        
        if (!response.ok) {
          throw new Error('Lisans kodları alınamadı');
        }
        
        const data = await response.json();
        setLicenseCodes(data);
      } catch (error) {
        console.error('Error fetching license codes:', error);
        setError('Lisans kodlarınız yüklenirken bir hata oluştu.');
      }
    };

    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchUserData(), fetchLicenseCodes()]);
      setIsLoading(false);
    };

    if (session?.user?.id) {
      fetchData();
    }
  }, [session]);

  if (!session?.user) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-400">Lütfen giriş yapın</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-8 rounded-2xl border border-white/10 backdrop-blur-sm mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-blue-500/20 bg-gradient-to-br from-blue-600/20 to-purple-600/20">
                <img
                  src={session.user.image || '/images/users/default.png'}
                  alt={session.user.name || 'Profile'}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{session.user.name}</h2>
              <p className="text-gray-400 mb-4">@{session.user.name?.toLowerCase().replace(/\s+/g, '')}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                  {userData?.role || 'Üye'}
                </span>
                <span className="px-4 py-1.5 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                  {new Date(userData?.joinedAt || userData?.createdAt || Date.now()).toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'tr-TR')} {currentLanguage === 'en' ? 'joined' : 'tarihinde katıldı'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Stats */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-600/5 to-blue-400/10 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">Son Giriş</h3>
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500/10">
                <RiUser3Line className="text-blue-400" size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              {new Date(userData?.lastLogin || Date.now()).toLocaleDateString('tr-TR')}
            </p>
          </div>
        </div>

        {/* License Codes */}
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-8 rounded-2xl border border-white/10 backdrop-blur-sm mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <RiKeyLine className="text-blue-400" size={24} />
              <h3 className="text-xl font-semibold text-white">Lisans Kodlarım</h3>
            </div>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
              {licenseCodes.length} kod
            </span>
          </div>
          
          {error ? (
            <div className="p-4 bg-red-500/10 rounded-lg text-red-400 text-center">
              {error}
            </div>
          ) : licenseCodes.length === 0 ? (
            <div className="p-6 bg-white/5 rounded-lg text-gray-400 text-center">
              Henüz bir lisans kodunuz bulunmamaktadır. Market'ten SLC satın alarak lisans kodu edinebilirsiniz.
            </div>
          ) : (
            <div className="space-y-4">
              {licenseCodes.map(license => (
                <div key={license.id} className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                          Aktif
                        </span>
                        <h4 className="text-white font-medium">{license.productName}</h4>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">{license.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-400">
                        Atandı: {new Date(license.assignedDate || Date.now()).toLocaleDateString('tr-TR')}
                      </p>
                      {license.expiryDate && (
                        <p className="text-sm text-gray-400">
                          Bitiş: {new Date(license.expiryDate).toLocaleDateString('tr-TR')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 text-center">
                <a href="#/market" onClick={(e) => { e.preventDefault(); window.location.hash = 'market'; }} className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm inline-block">
                  Yeni Lisans Kodu Al
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const SettingsContent = ({ currentLanguage }: { currentLanguage: 'tr' | 'en' }) => {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(session?.user?.image || '/images/users/default.png');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', newPasswordRepeat: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [canChangePassword, setCanChangePassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Kullanıcı verisini çek
  useEffect(() => {
    async function fetchUserData() {
      if (!session?.user?.id) return;
      try {
        const response = await fetch('/api/users');
        const users = await response.json();
        const currentUser = users.find((user: any) => user.id === session.user.id);
        setUserData(currentUser);
      } catch (error) {
        setUserData(null);
      }
    }
    fetchUserData();
  }, [session]);

  // Kullanıcıda password alanı var mı kontrolü
  useEffect(() => {
    async function checkPassword() {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(`/api/users?id=${session.user.id}`);
        const users = await res.json();
        const currentUser = Array.isArray(users) ? users.find((u: any) => u.id === session.user.id) : users;
        setCanChangePassword(!!currentUser?.password);
      } catch {
        setCanChangePassword(false);
      }
    }
    checkPassword();
  }, [session]);

  // Profil resmi yükleme fonksiyonu
  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    setPasswordError('');
    setPasswordSuccess('');
    try {
      const res = await fetch('/api/users/upload-profile-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        await fetch('/api/users/profile-image', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: data.url }),
        });
        setProfileImage(data.url);
        setPasswordSuccess('Profil resmi başarıyla güncellendi!');
      } else {
        setPasswordError(data.error || 'Profil resmi yüklenemedi.');
      }
    } catch (err) {
      setPasswordError('Bir hata oluştu.');
    } finally {
      setUploading(false);
    }
  };

  // Şifre değiştirme fonksiyonu
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.newPasswordRepeat) {
      setPasswordError('Tüm alanları doldurun.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.newPasswordRepeat) {
      setPasswordError('Yeni şifreler eşleşmiyor.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Yeni şifre en az 6 karakter olmalı.');
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
          newPasswordRepeat: passwordForm.newPasswordRepeat,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess('Şifre başarıyla değiştirildi!');
        setShowPasswordModal(false);
        setPasswordForm({ oldPassword: '', newPassword: '', newPasswordRepeat: '' });
      } else {
        setPasswordError(data.error || 'Şifre değiştirilemedi.');
      }
    } catch (err) {
      setPasswordError('Bir hata oluştu.');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="max-w-4xl mx-auto">
        {/* Profile Header (Kopyalandı) */}
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-8 rounded-2xl border border-white/10 backdrop-blur-sm mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-blue-500/20 bg-gradient-to-br from-blue-600/20 to-purple-600/20">
                <img
                  src={session?.user?.image || '/images/users/default.png'}
                  alt={session?.user?.name || 'Profile'}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{session?.user?.name}</h2>
              <p className="text-gray-400 mb-4">@{session?.user?.name?.toLowerCase().replace(/\s+/g, '')}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                  {userData?.role || (currentLanguage === 'en' ? 'Member' : 'Üye')}
                </span>
                <span className="px-4 py-1.5 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                  {new Date(userData?.joinedAt || userData?.createdAt || Date.now()).toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'tr-TR')} {currentLanguage === 'en' ? 'joined' : 'tarihinde katıldı'}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Hesap Ayarları kutusu aşağıda */}
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-8 rounded-2xl border border-white/10 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">{currentLanguage === 'en' ? 'Account Settings' : 'Hesap Ayarları'}</h3>
          </div>
          <div className="space-y-6">
            {/* Profil Görünürlüğü ve Profil Resmi Yükleme */}
            <div
              className="p-6 bg-white/5 rounded-xl border border-white/5"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-white font-medium mb-1">{currentLanguage === 'en' ? 'Profile Visibility' : 'Profil Görünürlüğü'}</h4>
                  <p className="text-gray-400 text-sm">{currentLanguage === 'en' ? 'Set who can see your profile' : 'Profilinizin kimler tarafından görüntülenebileceğini ayarlayın'}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div
                    className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg mb-2 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {currentLanguage === 'en' ? 'Upload Profile Image' : 'Profil Resmi Yükle'}
                </div>
                  <div className="flex items-center gap-2">
                    <img src={profileImage} alt="Profil" className="w-12 h-12 rounded-full object-cover border border-white/10" />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfileImageChange}
                      disabled={uploading}
                    />
              </div>
                  {passwordSuccess && <div className="text-green-400 text-xs mt-1">{passwordSuccess}</div>}
                  {passwordError && <div className="text-red-400 text-xs mt-1">{passwordError}</div>}
            </div>
                </div>
                </div>
            {/* Güvenlik Ayarları ve Şifre Değiştirme */}
            <div className="p-6 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium mb-1">{currentLanguage === 'en' ? 'Security Settings' : 'Güvenlik Ayarları'}</h4>
                  <p className="text-gray-400 text-sm">{currentLanguage === 'en' ? 'Manage your account security' : 'Hesap güvenliğinizi yönetin'}</p>
                </div>
                {canChangePassword && (
                  <button
                    className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    {currentLanguage === 'en' ? 'Edit' : 'Düzenle'}
                  </button>
                )}
                </div>
              </div>
            </div>
                </div>
                </div>
      {/* Şifre Değiştirme Modalı */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#181A20] rounded-2xl p-8 w-full max-w-md border border-white/10 shadow-2xl relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-white" onClick={() => setShowPasswordModal(false)}>&times;</button>
            <h3 className="text-xl font-semibold text-white mb-4">{currentLanguage === 'en' ? 'Change Password' : 'Şifre Değiştir'}</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-1 text-sm">{currentLanguage === 'en' ? 'Old Password' : 'Eski Şifre'}</label>
                <input
                  type="password"
                  className="w-full p-2 rounded bg-[#232733] text-white border border-gray-700 focus:border-blue-500 focus:outline-none text-sm"
                  value={passwordForm.oldPassword}
                  onChange={e => setPasswordForm(f => ({ ...f, oldPassword: e.target.value }))}
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1 text-sm">{currentLanguage === 'en' ? 'New Password' : 'Yeni Şifre'}</label>
                <input
                  type="password"
                  className="w-full p-2 rounded bg-[#232733] text-white border border-gray-700 focus:border-blue-500 focus:outline-none text-sm"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                  autoComplete="new-password"
                />
            </div>
              <div>
                <label className="block text-gray-300 mb-1 text-sm">{currentLanguage === 'en' ? 'New Password (Repeat)' : 'Yeni Şifre (Tekrar)'}</label>
                <input
                  type="password"
                  className="w-full p-2 rounded bg-[#232733] text-white border border-gray-700 focus:border-blue-500 focus:outline-none text-sm"
                  value={passwordForm.newPasswordRepeat}
                  onChange={e => setPasswordForm(f => ({ ...f, newPasswordRepeat: e.target.value }))}
                  autoComplete="new-password"
                />
          </div>
              {passwordError && <div className="text-red-400 text-xs">{passwordError}</div>}
              {passwordSuccess && <div className="text-green-400 text-xs">{passwordSuccess}</div>}
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition duration-200 disabled:opacity-50 text-sm"
                disabled={changingPassword}
              >
                {changingPassword ? (currentLanguage === 'en' ? 'Saving...' : 'Kaydediliyor...') : (currentLanguage === 'en' ? 'Change Password' : 'Şifreyi Değiştir')}
              </button>
            </form>
        </div>
      </div>
      )}
    </motion.div>
  );
};

const PurchaseHistoryContent = ({ currentLanguage }: { currentLanguage: 'tr' | 'en' }) => {
  const { data: session } = useSession();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  // URL'leri tespit eden fonksiyon
  const renderLineWithLinks = (line: string) => {
    // Regex: http://, https://, http:\\, https:\\ ile başlayan ve boşluğa kadar olan kısmı bul
    const urlRegex = /(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+|https?:\\\\[\w\-._~:/?#[\]@!$&'()*+,;=%]+)/g;
    const parts = line.split(urlRegex);
    return parts.map((part, idx) => {
      if (urlRegex.test(part)) {
        // Eğer başında \\ varsa, / ile değiştir
        let url = part.replace(/\\\\/g, '/');
        return (
          <a
            key={idx}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 break-all"
            onClick={e => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!session?.user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/users/${session.user.id}/purchases`);
        if (!res.ok) throw new Error('Satın alım geçmişiniz yüklenirken bir hata oluştu.');
        const data = await res.json();
        // Sadece coin satın alımlarını filtrele
        const coinPurchases = data.filter((purchase: any) => purchase.amount);
        setPurchases(coinPurchases);
      } catch (err) {
        setError('Satın alım geçmişiniz yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, [session]);

  if (loading) {
    return <div className="p-6">{currentLanguage === 'en' ? 'Loading...' : 'Yükleniyor...'}</div>;
  }
  if (error) {
    return <div className="p-6 text-red-400">{error}</div>;
  }
  if (purchases.length === 0) {
    return <div className="p-6 text-gray-400">{currentLanguage === 'en' ? 'You have no coin purchase history.' : 'Coin satın alma geçmişiniz yok.'}</div>;
  }
  return (
    <div className="p-6">
      {purchases.map((purchase, idx) => {
        const expanded = expandedIdx === idx;
        return (
          <div
            key={idx}
            className={`mb-4 p-0 bg-white/5 rounded-xl border border-white/10 transition-all duration-200 ${expanded ? 'shadow-lg' : ''}`}
          >
            {/* Card header: only this toggles expansion */}
            <div
              className="p-4 cursor-pointer hover:bg-white/10 rounded-t-xl select-none"
              onClick={() => setExpandedIdx(expanded ? null : idx)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-white">{purchase.packageSnapshot?.name || purchase.packageName || (currentLanguage === 'en' ? 'Coin Purchase' : 'Coin Satın Alımı')}</div>
                <div className="flex items-center space-x-2">
                  {purchase.price && purchase.currency && (
                    <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-lg">
                      <span className="text-green-400 font-medium text-sm">${purchase.price} {purchase.currency}</span>
                    </div>
                  )}
                  {purchase.amount && (
                    <div className="flex items-center space-x-2 bg-yellow-500/20 px-3 py-1 rounded-lg">
                      <RiCoinLine className="text-yellow-400" size={16} />
                      <span className="text-yellow-400 font-medium text-sm">{purchase.amount} SLC</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-gray-400">{currentLanguage === 'en' ? 'Purchase date: ' : 'Satın alma tarihi: '}{new Date(purchase.purchaseDate).toLocaleString()}</div>
              {purchase.status && (
                <div className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${
                  purchase.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  purchase.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {purchase.status === 'completed' ? (currentLanguage === 'en' ? 'Approved' : 'Onaylandı') :
                   purchase.status === 'pending' ? (currentLanguage === 'en' ? 'Pending' : 'Beklemede') :
                   (currentLanguage === 'en' ? 'Failed' : 'Başarısız')}
                </div>
              )}
            </div>
            {/* Expanded stock area: minimal, seamless, compact */}
            <div
              className={`overflow-hidden transition-all duration-300 ${expanded ? 'mt-0' : 'max-h-0'} rounded-b-xl`}
              style={expanded ? { maxHeight: 500, background: 'rgba(255,255,255,0.03)' } : {}}
              onClick={e => e.stopPropagation()}
            >
              {expanded && purchase.amount && (
                <div className="px-4 py-2 w-full flex flex-col items-start">
                  {(purchase.stock || (currentLanguage === 'en' ? 'No stock information.' : 'Stok bilgisi yok.'))
                    .toString()
                    .split('\n')
                    .map((line: string, i: number) => (
                      <div key={i} className="break-words text-white/80 text-sm text-left w-full font-mono py-1 m-0">{renderLineWithLinks(line)}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const MarketContent = ({ currentLanguage }: { currentLanguage: 'tr' | 'en' }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [slcBalance, setSlcBalance] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  // SLC slider ve input state
  const [slcAmount, setSlcAmount] = useState(10);
  const [slcInput, setSlcInput] = useState('10');
  const [slcError, setSlcError] = useState('');
  const minSLC = 10;
  const maxSLC = 2000;
  const slcPrice = (slcAmount / 10).toFixed(2);

  // Dil seçimi değiştiğinde localStorage'a kaydet
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', currentLanguage);
    }
  }, [currentLanguage]);

  // Function to fetch user balance
  const fetchUserBalance = async () => {
    if (!session?.user?.id) {
      setError(currentLanguage === 'tr' ? 'Oturum açmanız gerekiyor' : 'You need to sign in');
      return;
    }

    setRefreshing(true);
    setError(null);
    try {
      const response = await fetch(`/api/users/${session.user.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (currentLanguage === 'tr' ? 'Bakiye bilgisi alınamadı' : 'Could not get balance information'));
      }

      setSlcBalance(data.coin);
    } catch (err) {
      console.error('Bakiye güncellenirken hata:', err);
      setError(err instanceof Error ? err.message : (currentLanguage === 'tr' ? 'Bakiye bilgisi alınamadı' : 'Could not get balance information'));
    } finally {
      setRefreshing(false);
    }
  };

  // Refresh balance on initial load and when session changes
  useEffect(() => {
    if (!session?.user?.id) return;
    fetchUserBalance();
  }, [session]);

  const handleRefreshBalance = () => {
    fetchUserBalance();
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setSlcAmount(value);
    setSlcInput(String(value));
    setSlcError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setSlcInput(value);
    const num = Number(value);
    if (value === '') {
      setSlcError('');
      return;
    }
    if (num < minSLC) {
      setSlcError(currentLanguage === 'tr' ? 'Minimum 10 coin olmalıdır' : 'Minimum 10 coins required');
      setSlcAmount(minSLC);
    } else if (num > maxSLC) {
      setSlcError(currentLanguage === 'tr' ? 'Coin miktarı maksimum 2000 olabilir' : 'Coin amount can be maximum 2000');
      setSlcAmount(maxSLC);
    } else {
      setSlcError('');
      setSlcAmount(num);
    }
  };

  const handlePurchase = async () => {
    if (slcAmount < minSLC) {
      setSlcError(currentLanguage === 'tr' ? 'Minimum 10 coin olmalıdır' : 'Minimum 10 coins required');
      return;
    }
    if (slcAmount > maxSLC) {
      setSlcError(currentLanguage === 'tr' ? 'Coin miktarı maksimum 2000 olabilir' : 'Coin amount can be maximum 2000');
      return;
    }
    // Ödeme sayfasına yönlendir
    const price = (slcAmount / 10).toFixed(2);
    const paymentUrl = `/payment?amount=${price}&currency=USD&productId=1&productName=${encodeURIComponent(slcAmount + ' SLC')}`;
    router.push(paymentUrl);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900/70 to-black/70 p-8 rounded-2xl border border-gray-800/40 backdrop-blur-sm mb-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <RiStore2Line className="text-blue-400" size={28} />
              <h2 className="text-2xl font-bold text-white">SLC Market</h2>
            </div>
            <div className="flex items-center">
              <div className="flex items-center space-x-2 bg-gray-800/60 px-4 py-2 rounded-xl mr-2 border border-gray-700/40">
                <RiCoinLine className="text-yellow-400" size={20} />
                <span className="text-white font-medium">{slcBalance !== null ? `${slcBalance} SLC` : (currentLanguage === 'tr' ? 'Yükleniyor...' : 'Loading...')}</span>
              </div>
              <button 
                onClick={fetchUserBalance}
                disabled={refreshing}
                className="p-2 hover:bg-gray-800/60 rounded-lg transition-colors border border-gray-700/40"
                title={currentLanguage === 'tr' ? 'Bakiyeyi Yenile' : 'Refresh Balance'}
              >
                {refreshing ? (
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <p className="text-gray-300 mb-8">
            {currentLanguage === 'tr' 
              ? 'SLC kredisi satın alarak hesabınıza ekleyebilir ve premium özellikleri kullanabilirsiniz.'
              : 'You can add SLC credits to your account by purchasing them and use premium features.'
            }
          </p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
              <p className="text-red-400">{error}</p>
            </div>
          )}
          
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 p-6 rounded-xl border border-gray-800/50 shadow-xl backdrop-blur-sm mb-10 max-w-2xl mx-auto flex flex-col items-center">
            <div className="flex items-center space-x-3 mb-4">
              <RiCoinLine className="text-yellow-400" size={28} />
              <h2 className="text-xl font-bold text-white">
                {currentLanguage === 'tr' ? 'SLC Satın Al' : 'Buy SLC'}
              </h2>
            </div>
            <div className="w-full max-w-lg">
              <label className="block text-gray-300 mb-2 font-medium">
                {currentLanguage === 'tr' ? 'Coin Miktarı' : 'Coin Amount'}
              </label>
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="number"
                  min={minSLC}
                  max={maxSLC}
                  value={slcInput}
                  onChange={handleInputChange}
                  className="flex-1 p-3 rounded-lg bg-gray-800/80 text-white border border-gray-700/50 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none text-lg font-bold shadow-sm transition-all duration-200 appearance-none custom-number-input text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  placeholder={currentLanguage === 'tr' ? 'Coin miktarı' : 'Coin amount'}
                  style={{ WebkitAppearance: 'none', MozAppearance: 'textfield', appearance: 'textfield' }}
                />
              </div>
              <div className="relative w-full mt-4 mb-3">
                <input
                  type="range"
                  min={minSLC}
                  max={maxSLC}
                  value={slcAmount}
                  onChange={handleSliderChange}
                  className="modern-slider w-full h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-500 rounded-full outline-none transition-all duration-200 appearance-none"
                  style={{ accentColor: '#6366f1' }}
                />
                <style jsx>{`
                  .custom-number-input::-webkit-outer-spin-button,
                  .custom-number-input::-webkit-inner-spin-button {
                    -webkit-appearance: none !important;
                    appearance: none !important;
                    margin: 0;
                  }
                  .custom-number-input[type=number] {
                    -moz-appearance: textfield !important;
                    appearance: textfield !important;
                  }
                  .modern-slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    margin-top: -6px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #6366f1 0%, #a78bfa 100%);
                    box-shadow: 0 3px 8px 0 #6366f155, 0 0 0 2px rgba(255,255,255,0.1);
                    cursor: pointer;
                    transition: all 0.2s ease;
                  }
                  .modern-slider:focus::-webkit-slider-thumb,
                  .modern-slider:hover::-webkit-slider-thumb {
                    box-shadow: 0 4px 12px 0 #6366f199, 0 0 0 2px rgba(255,255,255,0.2);
                    transform: scale(1.05);
                  }
                  .modern-slider::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #6366f1 0%, #a78bfa 100%);
                    box-shadow: 0 3px 8px 0 #6366f155, 0 0 0 2px rgba(255,255,255,0.1);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: none;
                  }
                  .modern-slider:focus::-moz-range-thumb,
                  .modern-slider:hover::-moz-range-thumb {
                    box-shadow: 0 4px 12px 0 #6366f199, 0 0 0 2px rgba(255,255,255,0.2);
                    transform: scale(1.05);
                  }
                  .modern-slider::-ms-thumb {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #6366f1 0%, #a78bfa 100%);
                    box-shadow: 0 3px 8px 0 #6366f155, 0 0 0 2px rgba(255,255,255,0.1);
                    cursor: pointer;
                    transition: all 0.2s ease;
                  }
                  .modern-slider:focus::-ms-thumb,
                  .modern-slider:hover::-ms-thumb {
                    box-shadow: 0 4px 12px 0 #6366f199, 0 0 0 2px rgba(255,255,255,0.2);
                    transform: scale(1.05);
                  }
                  .modern-slider::-webkit-slider-runnable-track {
                    height: 8px;
                    border-radius: 8px;
                    background: linear-gradient(90deg, #6366f1 0%, #a78bfa 100%);
                    box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
                  }
                  .modern-slider::-ms-fill-lower {
                    background: #6366f1;
                    border-radius: 8px;
                  }
                  .modern-slider::-ms-fill-upper {
                    background: #a78bfa;
                    border-radius: 8px;
                  }
                  .modern-slider::-moz-range-track {
                    height: 8px;
                    border-radius: 8px;
                    background: linear-gradient(90deg, #6366f1 0%, #a78bfa 100%);
                    box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
                    border: none;
                  }
                  .modern-slider:focus {
                    outline: none;
                  }
                `}</style>
              </div>
              {slcError && <p className="text-red-400 mt-3 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-center">{slcError}</p>}
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-lg mt-4 gap-4">
              <div className="flex-1 bg-gray-800/60 backdrop-blur-sm rounded-lg p-3 flex flex-col items-center border border-gray-700/40 shadow-md">
                <span className="text-gray-400 mb-1 text-sm">
                  {currentLanguage === 'tr' ? 'Seçilen Coin' : 'Selected Coins'}
                </span>
                <span className="text-white font-bold text-lg">{slcAmount} SLC</span>
              </div>
              <div className="flex-1 bg-gray-800/60 backdrop-blur-sm rounded-lg p-3 flex flex-col items-center border border-gray-700/40 shadow-md">
                <span className="text-gray-400 mb-1 text-sm">
                  {currentLanguage === 'tr' ? 'Fiyat' : 'Price'}
                </span>
                <span className="text-blue-400 font-bold text-lg">${slcPrice} USD</span>
              </div>
            </div>
            <button 
              onClick={handlePurchase}
              className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-base transition-all duration-200 tracking-wide shadow-lg"
            >
              <span className="flex items-center justify-center gap-2">
                <RiShoppingBag3Line size={20} />
                {currentLanguage === 'tr' ? 'Satın Al' : 'Buy Now'}
              </span>
            </button>
          </div>
        </div>
        
        {/* SSS Section */}
        <div className="bg-gradient-to-br from-gray-900/70 to-black/70 p-8 rounded-2xl border border-gray-800/40 backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <RiFileList3Line className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Paketler</h2>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-6 border border-gray-700/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gray-800/70 hover:border-gray-600/50">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg mb-2">
                    {currentLanguage === 'tr' 
                      ? 'SLC kredimi nasıl kullanabilirim?'
                      : 'How can I use my SLC credits?'
                    }
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {currentLanguage === 'tr'
                      ? 'SLC kredilerinizi premium içeriklere erişim, özel özellikler ve platform içi satın alımlar için kullanabilirsiniz. Kredileriniz hesabınıza anında tanımlanır ve hemen kullanmaya başlayabilirsiniz.'
                      : 'You can use your SLC credits for access to premium content, special features, and in-platform purchases. Your credits are instantly credited to your account and you can start using them immediately.'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-6 border border-gray-700/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gray-800/70 hover:border-gray-600/50">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg mb-2">
                    {currentLanguage === 'tr' 
                      ? 'Ödeme yöntemleri nelerdir?'
                      : 'What are the payment methods?'
                    }
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {currentLanguage === 'tr'
                      ? 'Kredi kartı, banka kartı, PayPal ve kripto para birimleri ile güvenli ödeme yapabilirsiniz. Tüm işlemler SSL şifreleme ile korunmaktadır ve kişisel bilgileriniz güvende kalır.'
                      : 'You can make secure payments with credit cards, debit cards, PayPal, and cryptocurrencies. All transactions are protected with SSL encryption and your personal information remains secure.'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-6 border border-gray-700/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gray-800/70 hover:border-gray-600/50">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg mb-2">
                    {currentLanguage === 'tr' 
                      ? 'SLC kredilerim ne zaman hesabıma eklenir?'
                      : 'When will my SLC credits be added to my account?'
                    }
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {currentLanguage === 'tr'
                      ? 'Ödeme işleminiz tamamlandıktan hemen sonra SLC kredileriniz hesabınıza anında tanımlanır. Herhangi bir gecikme durumunda destek ekibimizle iletişime geçebilirsiniz.'
                      : 'Your SLC credits are instantly credited to your account immediately after your payment is completed. If there is any delay, you can contact our support team.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PackagesContent = ({ currentLanguage }: { currentLanguage: 'tr' | 'en' }) => {
  const { data: session } = useSession();
  const [slcBalance, setSlcBalance] = useState<number | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<any[]>([]);
  const [packagesLoading, setPackagesLoading] = useState<boolean>(false);
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [selectedDurationIdx, setSelectedDurationIdx] = useState<number>(0);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState('');
  const [buySuccess, setBuySuccess] = useState(false);

  // Kullanıcı verisini çek
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) return;
      try {
        const response = await fetch(`/api/users/${session.user.id}`);
        const data = await response.json();
        if (response.ok) {
          setUserData(data);
          setSlcBalance(data.coin);
        }
      } catch (error) {
        setUserData(null);
        setSlcBalance(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [session]);

  useEffect(() => {
    setPackagesLoading(true);
    fetch('/api/packages')
      .then(res => res.json())
      .then(data => setPackages(data))
      .finally(() => setPackagesLoading(false));
  }, []);

  if (loading || packagesLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Sadece member rolü için coin kontrolü yap
  if (userData?.role === 'member' && (!slcBalance || slcBalance === 0)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6"
      >
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-8 rounded-2xl border border-white/10 backdrop-sm">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <RiCoinLine className="text-yellow-400" size={32} />
              <h2 className="text-2xl font-bold text-white">Paketler</h2>
            </div>
            <div className="p-6 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-center">
              <p className="text-yellow-400 text-lg">Bu sayfayı görmeniz için coin almanız gerekmektedir.</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Diğer roller coin bakiyesine bakmadan paketleri görebilir
  // ... (devamı aynı kalacak)

  async function handleBuy() {
    if (!session || !session.user || !selectedPackage || !selectedPackage.durations || selectedDurationIdx == null) {
      setBuyError('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
      return;
    }
    setBuyError('');
    setBuySuccess(false);
    const duration = selectedPackage.durations[selectedDurationIdx];
    if (!duration || !duration.stockList || duration.stockList.length === 0) {
      setBuyError('Bu süre için stok yok!');
      setBuying(false);
      return;
    }
    try {
      const res = await fetch(`/api/users/${session.user.id}/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          durationLabel: duration.label
        })
      });
      if (!res.ok) {
        const err = await res.json();
        setBuyError(err.error || 'Satın alma başarısız!');
        setBuying(false);
        return;
      }
      setBuySuccess(true);
      setBuyError('Ürününüz alınan paketler bölümüne teslim edilmiştir.');
      setTimeout(() => {
        setShowPackageModal(false);
        setBuySuccess(false);
        setBuyError('');
      }, 2000);
    } catch (err: any) {
      setBuyError(err.message || 'Satın alma başarısız!');
    } finally {
      setBuying(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900/70 to-black/70 p-8 rounded-2xl border border-gray-800/40 backdrop-sm shadow-xl">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <RiFileList3Line className="text-white" size={28} />
            </div>
            <div>
            <h2 className="text-2xl font-bold text-white">Paketler</h2>
            </div>
          </div>
          {packages.length === 0 ? (
            <div className="text-gray-400 text-center py-8">Hiç paket yok.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg: any) => (
                <div key={pkg.id} className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/40 p-6 min-h-[260px] flex flex-col shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gray-800/70 hover:border-gray-600/50 group">
                  <div className="relative mb-4 overflow-hidden rounded-lg">
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      </div>
                  <div className="font-bold text-lg text-white mb-4 text-center">{pkg.name}</div>
                  <button
                    className="mt-auto py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                    onClick={() => {
                      setSelectedPackage(pkg);
                      setShowPackageModal(true);
                    }}
                  >
                    {currentLanguage === 'en' ? 'View' : 'İncele'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Paket Detay Modalı */}
      <AnimatePresence>
        {showPackageModal && selectedPackage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <div className="relative w-full max-w-3xl min-h-[540px] bg-gradient-to-br from-gray-900/70 to-black/70 border border-gray-800/40 backdrop-blur-sm rounded-3xl shadow-2xl flex flex-col md:flex-row mx-4 overflow-hidden">
              <button className="absolute top-6 right-8 text-gray-400 hover:text-white text-3xl z-10" onClick={() => setShowPackageModal(false)}>&times;</button>
              {/* Sol: Büyük Resim */}
              <div className="flex-1 min-h-[540px] bg-cover bg-center relative" style={{ backgroundImage: `url('${selectedPackage.image}')` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              </div>
              {/* Sağ: İçerik */}
              <div className="flex-1 flex flex-col gap-6 p-10 justify-center bg-gradient-to-br from-gray-900/80 to-black/80">
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-extrabold text-white tracking-tight">{selectedPackage.name}</h2>
                </div>
                <div className="text-gray-300 text-base mb-2">{selectedPackage.description}</div>
                {/* Özellikler */}
                {selectedPackage.features && selectedPackage.features.length > 0 && (
                  <div>
                    <div className="font-bold text-lg text-white mb-2">
                      {currentLanguage === 'en' ? 'Features' : 'Özellikler'}
                    </div>
                    <ul className="space-y-2">
                      {selectedPackage.features.map((f: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2 text-base text-white/90">
                          <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Süre Seçimi ve Buton */}
                <div>
                  <div className="font-bold text-lg text-white mb-2 mt-4">
                    {currentLanguage === 'en' ? 'Duration Selection' : 'Süre Seçimi'}
                  </div>
                  {selectedPackage.durations && selectedPackage.durations.length <= 2 ? (
                    <div className="flex justify-center gap-3">
                      {selectedPackage.durations.map((d: any, idx: number) => (
                        <button
                          key={idx}
                          className={`flex flex-col items-center justify-center px-6 py-4 rounded-lg border text-center transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50
                            ${selectedDurationIdx === idx
                              ? 'border-blue-500 text-white shadow-md bg-gray-800/80'
                              : 'border-gray-700 text-blue-300 bg-gray-800/80 hover:border-blue-400'}
                          `}
                          onClick={() => setSelectedDurationIdx(idx)}
                        >
                          <span className="mb-1 text-base font-semibold text-white">{d.label}</span>
                          <span className="text-blue-400 text-base font-bold flex items-center gap-1">
                            {d.coinPrice} <span className="font-bold">SLC</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {selectedPackage.durations && selectedPackage.durations.length > 0 && selectedPackage.durations.map((d: any, idx: number) => (
                    <button
                      key={idx}
                          className={`flex flex-col items-center justify-center px-2 py-3 rounded-lg border text-center transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50
                            ${selectedDurationIdx === idx
                              ? 'border-blue-500 text-white shadow-md bg-gray-800/80'
                              : 'border-gray-700 text-blue-300 bg-gray-800/80 hover:border-blue-400'}
                          `}
                      onClick={() => setSelectedDurationIdx(idx)}
                    >
                          <span className="mb-1 text-base font-semibold text-white">{d.label}</span>
                          <span className="text-blue-400 text-base font-bold flex items-center gap-1">
                            {d.coinPrice} <span className="font-bold">SLC</span>
                          </span>
                    </button>
                  ))}
                    </div>
                  )}
                </div>
                <button
                  className="w-full max-w-md mx-auto mt-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-base transition-colors duration-200 shadow focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  disabled={buying || !session || !session.user}
                  onClick={handleBuy}
                >
                  {currentLanguage === 'en' ? (buying ? 'Purchasing...' : 'Buy Now') : (buying ? 'Satın Alınıyor...' : 'Satın Al')}
                </button>
                {buyError && <div className="text-red-400 mt-3 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">{buyError}</div>}
                {buySuccess && <div className="text-green-400 mt-3 text-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">Satın alma başarılı!</div>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const UserPurchasesContent = ({ currentLanguage }: { currentLanguage: 'tr' | 'en' }) => {
  const { data: session } = useSession();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [guides, setGuides] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [userPurchasesActiveTab, setUserPurchasesActiveTab] = useState<'purchases' | 'guides'>('purchases');

  // URL'leri tespit eden fonksiyon
  const renderLineWithLinks = (line: string) => {
    // Regex: http://, https://, http:\\, https:\\ ile başlayan ve boşluğa kadar olan kısmı bul
    const urlRegex = /(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+|https?:\\\\[\w\-._~:/?#[\]@!$&'()*+,;=%]+)/g;
    const parts = line.split(urlRegex);
    return parts.map((part, idx) => {
      if (urlRegex.test(part)) {
        // Eğer başında \\ varsa, / ile değiştir
        let url = part.replace(/\\\\/g, '/');
        return (
          <a
            key={idx}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 break-all"
            onClick={e => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!session?.user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/users/${session.user.id}/purchases`);
        if (!res.ok) throw new Error('Satın alım geçmişiniz yüklenirken bir hata oluştu.');
        const data = await res.json();
        setPurchases(data);
      } catch (err) {
        setError('Satın alım geçmişiniz yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    const fetchUserData = async () => {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(`/api/users/${session.user.id}`);
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    const fetchGuides = async () => {
      try {
        const res = await fetch('/api/guides');
        const data = await res.json();
        setGuides(data);
      } catch (err) {
        console.error('Error fetching guides:', err);
      }
    };

    fetchPurchases();
    fetchUserData();
    fetchGuides();
  }, [session]);

  if (loading) {
    return <div className="p-6">{currentLanguage === 'en' ? 'Loading...' : 'Yükleniyor...'}</div>;
  }
  if (error) {
    return <div className="p-6 text-red-400">{error}</div>;
  }

  // Kullanıcının satın aldığı paketlere ait kılavuzları filtrele
  const userPackageIds = purchases.map(p => p.packageId || p.packageSnapshot?.id).filter(Boolean);
  const userGuides = guides.filter(guide => userPackageIds.includes(guide.packageId));

  // Kullanıcının rolünü kontrol et - sadece belirli roller kılavuzları görebilsin
  const allowedRoles = ['customer', 'owner', 'developer', 'staff'];
  const canViewGuides = userData?.role && allowedRoles.includes(userData.role);

  return (
    <div className="p-6">
      {/* Tab Navigation - Sadece member olmayan roller için kılavuzlar tabı göster */}
      {canViewGuides ? (
        <div className="flex space-x-1 mb-6 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setUserPurchasesActiveTab('purchases')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              userPurchasesActiveTab === 'purchases'
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {currentLanguage === 'en' ? 'My Purchases' : 'Satın Alımlarım'}
          </button>
          <button
            onClick={() => setUserPurchasesActiveTab('guides')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              userPurchasesActiveTab === 'guides'
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {currentLanguage === 'en' ? 'Guides' : 'Kılavuzlar'}
          </button>
        </div>
      ) : null}

      {/* Purchases Tab */}
      {userPurchasesActiveTab === 'purchases' && (
        <>
          {purchases.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              {currentLanguage === 'en' ? 'You have no package purchase history.' : 'Satın alma geçmişiniz yok.'}
            </div>
          ) : (
            purchases.map((purchase, idx) => {
              const expanded = expandedIdx === idx;
              return (
                <div
                  key={idx}
                  className={`mb-4 p-0 bg-white/5 rounded-xl border border-white/10 transition-all duration-200 ${expanded ? 'shadow-lg' : ''}`}
                >
                  {/* Card header: only this toggles expansion */}
                  <div
                    className="p-4 cursor-pointer hover:bg-white/10 rounded-t-xl select-none"
                    onClick={() => setExpandedIdx(expanded ? null : idx)}
                  >
                    <div className="font-bold text-white">{purchase.packageSnapshot?.name || purchase.packageName || (currentLanguage === 'en' ? 'Package' : 'Paket')}</div>
                    <div className="text-gray-400">{currentLanguage === 'en' ? 'Duration: ' : 'Süre: '}{purchase.durationLabel}</div>
                    <div className="text-gray-400">{currentLanguage === 'en' ? 'Purchase date: ' : 'Satın alma tarihi: '}{new Date(purchase.purchaseDate).toLocaleString()}</div>
                  </div>
                  {/* Expanded stock area: minimal, seamless, compact */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ${expanded ? 'mt-0' : 'max-h-0'} rounded-b-xl`}
                    style={expanded ? { maxHeight: 500, background: 'rgba(255,255,255,0.03)' } : {}}
                    onClick={e => e.stopPropagation()}
                  >
                    {expanded && (
                      <div className="px-4 py-2 w-full flex flex-col items-start">
                        {(purchase.stock || (currentLanguage === 'en' ? 'No stock information.' : 'Stok bilgisi yok.'))
                          .toString()
                          .split('\n')
                          .map((line: string, i: number) => (
                            <div key={i} className="break-words text-white/80 text-sm text-left w-full font-mono py-1 m-0">{renderLineWithLinks(line)}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </>
      )}

      {/* Guides Tab - Sadece member olmayan roller için */}
      {canViewGuides && userPurchasesActiveTab === 'guides' && (
        <>
          {userGuides.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              {currentLanguage === 'en' ? 'No guides available for your purchased packages.' : 'Satın aldığınız paketler için kılavuz bulunmuyor.'}
            </div>
          ) : (
            <div className="grid gap-4">
              {userGuides.map((guide) => (
                <div
                  key={guide.id}
                  className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 text-white">{guide.title}</h3>
                      <p className="text-gray-400 mb-3">{guide.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-blue-400">Paket: {guide.packageName}</span>
                        <span className="text-gray-500">
                          {new Date(guide.createdAt).toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'tr-TR')}
                        </span>
                      </div>
                    </div>
                    <a
                      href={guide.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <span>{currentLanguage === 'en' ? 'View Guide' : 'Kılavuzu Görüntüle'}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// TransferContent bileşeni
const TransferContent = ({ currentLanguage }: { currentLanguage: 'tr' | 'en' }) => {
  const { data: session } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        const usersArr = Array.isArray(data) ? data : data.users;
        setUsers(usersArr.filter((u: any) => u.id !== session?.user?.id));
      })
      .catch(() => setUsers([]));
  }, [session]);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/users/${session.user.id}`)
      .then(res => res.json())
      .then(data => setBalance(data.coin))
      .catch(() => setBalance(null));
  }, [session]);

  const userOptions = users.map((user: any) => ({
    value: user.id,
    label: (
      <div className="flex items-center gap-2">
        <img
          src={user.image || '/images/users/default.png'}
          alt={user.name}
          className="w-6 h-6 rounded-full object-cover border border-white/10"
        />
        <span className="font-normal text-white text-sm">{user.name}</span>
        <span className="text-xs text-gray-400">@{user.name?.toLowerCase().replace(/\s+/g, '')}</span>
        <span className="ml-2 text-xs font-bold text-yellow-400">{user.coin ?? 0} SLC</span>
      </div>
    ),
    user
  }));

  const handleTransfer = async () => {
    setError(''); setSuccess('');
    if (!selectedUser) { setError(currentLanguage === 'en' ? 'Please select a user.' : 'Lütfen bir kullanıcı seçin.'); return; }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { setError(currentLanguage === 'en' ? 'Enter a valid coin amount.' : 'Geçerli bir coin miktarı girin.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/coin-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId: selectedUser.user.id, amount: Number(amount) })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(currentLanguage === 'en' ? 'Transfer successful!' : 'Transfer başarılı!');
        setAmount('');
        setSelectedUser(null);
        // Bakiyeyi güncelle
        setBalance((prev) => (prev !== null ? prev - Number(amount) : prev));
      } else {
        setError(data.error || (currentLanguage === 'en' ? 'Transfer failed.' : 'Transfer başarısız.'));
      }
    } catch {
      setError(currentLanguage === 'en' ? 'An error occurred during transfer.' : 'Transfer sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl w-full">
      <div className="rounded-xl border border-white/10 bg-[#181A20] p-6 flex flex-col gap-5">
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          <div className="flex-1 min-w-0">
            <label className="block text-gray-400 mb-2 font-medium">{currentLanguage === 'en' ? 'User' : 'Kullanıcı'}</label>
            <Select
              options={userOptions}
              value={selectedUser}
              onChange={setSelectedUser}
              placeholder={currentLanguage === 'en' ? 'Select user...' : 'Kullanıcı seç...'}
              isSearchable
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  background: '#181A20',
                  borderColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '2rem', // daha oval
                  minHeight: '34px', // daha ince
                  color: 'white',
                  boxShadow: 'none',
                  fontSize: '0.97rem',
                  width: '100%',
                  minWidth: '100%',
                  padding: '0 2px',
                }),
                menu: (base) => ({
                  ...base,
                  background: '#232733',
                  borderRadius: '1rem',
                  color: 'white',
                  zIndex: 50,
                }),
                option: (base, state) => ({
                  ...base,
                  background: state.isSelected ? '#6366f1' : state.isFocused ? '#232733' : 'transparent',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '7px 12px', // daha ince
                  fontSize: '0.95rem', // daha küçük
                  fontWeight: 400, // daha ince
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '0.75rem',
                }),
                singleValue: (base) => ({ ...base, color: 'white' }),
                input: (base) => ({ ...base, color: 'white' }),
                placeholder: (base) => ({ ...base, color: '#a1a1aa' }),
              }}
              theme={theme => ({
                ...theme,
                borderRadius: 20,
                colors: {
                  ...theme.colors,
                  primary25: '#232733',
                  primary: '#6366f1',
                  neutral0: '#181A20',
                  neutral80: 'white',
                },
              })}
            />
          </div>
          <div className="w-full md:w-40 flex-shrink-0">
            <div className="flex flex-col items-end mb-2">
              <span className="text-lg font-bold text-blue-400 leading-none">{balance !== null ? balance : '...'} <span className="text-sm font-medium text-blue-300">SLC</span></span>
            </div>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-4 py-2 rounded-full bg-[#232733] text-white border border-white/10 focus:border-blue-500 outline-none text-base font-bold appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              style={{ minHeight: '36px' }}
              placeholder={currentLanguage === 'en' ? 'Coin amount' : 'Coin miktarı'}
            />
          </div>
        </div>
        {error && <div className="p-2 bg-red-500/10 text-red-400 rounded text-sm text-center">{error}</div>}
        {success && <div className="p-2 bg-green-500/10 text-green-400 rounded text-sm text-center">{success}</div>}
        <button
          onClick={handleTransfer}
          disabled={loading}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-base transition-all duration-200 disabled:opacity-60 mt-2"
        >
          {loading ? (currentLanguage === 'en' ? 'Transferring...' : 'Transfer Ediliyor...') : (currentLanguage === 'en' ? 'Transfer' : 'Transfer Et')}
        </button>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState<'tr' | 'en'>(() => {
    // localStorage'dan dili oku, yoksa varsayılan olarak 'tr' kullan
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('language') as 'tr' | 'en') || 'tr';
    }
    return 'tr';
  });

  // Paketler için state'ler (sadece burada ve bir kez tanımlı olacak)
  const [packages, setPackages] = useState<any[]>([]);
  const [packagesLoading, setPackagesLoading] = useState<boolean>(false);
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [showPackageModal, setShowPackageModal] = useState(false);

  // Paketler sekmesi açıldığında paketleri çek
  useEffect(() => {
    if (activeTab === 'packages') {
      setPackagesLoading(true);
      fetch('/api/packages')
        .then(res => res.json())
        .then(data => setPackages(data))
        .finally(() => setPackagesLoading(false));
    }
  }, [activeTab]);

  // Dil seçimi değiştiğinde localStorage'a kaydet
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', currentLanguage);
    }
  }, [currentLanguage]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', icon: RiDashboardLine, label: currentLanguage === 'tr' ? 'Gösterge Paneli' : 'Dashboard' },
    { id: 'market', icon: RiStore2Line, label: currentLanguage === 'tr' ? 'Market' : 'Market' },
    { id: 'packages', icon: RiFileList3Line, label: currentLanguage === 'tr' ? 'Paketler' : 'Packages' },
    { id: 'purchases', icon: RiShoppingBag3Line, label: currentLanguage === 'tr' ? 'Satın Alımlarım' : 'My Purchases' },
    { id: 'userpurchases', icon: RiShoppingBag3Line, label: currentLanguage === 'tr' ? 'Alınan Paketler' : 'Received Packages' },
    { id: 'transfer', icon: RiCoinLine, label: currentLanguage === 'tr' ? 'Transfer' : 'Transfer' },
    { id: 'settings', icon: RiSettings4Line, label: currentLanguage === 'tr' ? 'Ayarlar' : 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute inset-0">
          <img 
            src="/images/background.png" 
            alt="background" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/90 via-[#0A0A0A]/70 to-[#0A0A0A]"></div>
      </div>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: isSidebarOpen ? '280px' : '80px' }}
        className="bg-[#111111]/40 backdrop-blur-md border-r border-white/5 h-screen sticky top-0 z-30"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center space-x-3"
              >
                <img src="/images/logo.png" alt="Logo" className="w-8 h-8" />
                <span className="text-lg font-bold">Seinlol</span>
              </motion.div>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <RiCloseLine size={24} /> : <RiMenuLine size={24} />}
            </button>
          </div>

          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'hover:bg-white/5'
                }`}
              >
                <tab.icon size={24} />
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {tab.label}
                  </motion.span>
                )}
              </button>
            ))}
          </div>
        </div>

        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 p-4"
          >
            <button
              onClick={() => signOut()}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-red-400"
            >
              <RiLogoutBoxRLine size={24} />
              <span>{currentLanguage === 'tr' ? 'Çıkış Yap' : 'Sign Out'}</span>
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 min-h-screen">
        {/* Header */}
        <header className="bg-[#111111]/40 backdrop-blur-md border-b border-white/5 sticky top-0 z-20">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">{tabs.find(t => t.id === activeTab)?.label}</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="relative">
                <select
                  value={currentLanguage}
                  onChange={(e) => setCurrentLanguage(e.target.value as 'tr' | 'en')}
                  className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-blue-500/50 cursor-pointer appearance-none text-white dark:bg-zinc-900 dark:text-white"
                >
                  <option value="tr" className="bg-zinc-900 text-white">Türkçe</option>
                  <option value="en" className="bg-zinc-900 text-white">English</option>
                </select>
                {/* Custom dropdown arrow for better appearance */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9l4.95 4.95z"/></svg>
                </div>
              </div>

              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <RiSearchLine size={20} />
              </button>
              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <RiNotification3Line size={20} />
              </button>
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/10">
                {session?.user?.image && (
                  <img
                    src={session.user.image}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && <DashboardContent currentLanguage={currentLanguage} />}
            {activeTab === 'market' && <MarketContent currentLanguage={currentLanguage} />}
            {activeTab === 'packages' && <PackagesContent currentLanguage={currentLanguage} />}
            {activeTab === 'purchases' && <PurchaseHistoryContent currentLanguage={currentLanguage} />}
            {activeTab === 'userpurchases' && <UserPurchasesContent currentLanguage={currentLanguage} />}
            {activeTab === 'transfer' && <TransferContent currentLanguage={currentLanguage} />}
            {activeTab === 'settings' && <SettingsContent currentLanguage={currentLanguage} />}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
} 