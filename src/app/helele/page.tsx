'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import admins from '@/data/helele.json';
import {
  RiDashboardLine,
  RiUser3Line,
  RiFileList3Line,
  RiNotification3Line,
  RiLogoutBoxRLine,
  RiMenuLine,
  RiCloseLine,
  RiSearchLine,
  RiCheckLine,
  RiCloseFill,
  RiAddLine,
  RiDeleteBin6Line,
  RiEdit2Line,
  RiShieldUserLine,
  RiShieldUserFill,
  RiStore2Line,
  RiShoppingBag3Line,
  RiKeyLine,
  RiCoinLine
} from 'react-icons/ri';
import { motion, AnimatePresence } from 'framer-motion';
import Select from 'react-select';
import fs from 'fs/promises';
import path from 'path';

// Kullanıcı tipi
interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  joinedAt: string;
  lastLogin: string;
  isAdmin: boolean;
  role?: string;
  isBanned: boolean;
  createdAt: string;
  coin?: number;
}

// Product interface
interface Product {
  id: number;
  name: string;
  slcAmount: number;
  price: number;
  currency: string;
}

// License Code interface
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

// Purchase interface
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

interface Announcement {
  id: string;
  title: string;
  description: string;
  isImportant: boolean;
  createdAt: string;
  updatedAt: string;
}

// Karakter adını formatlayan yardımcı fonksiyon
const formatCharacterName = (name: string) => {
  return name.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Kullanıcılar Bileşeni
const UsersContent = ({ users, isLoading, onSearch, makeAdmin, handleBanUser, handleDeleteUser }: {
  users: User[];
  isLoading: boolean;
  onSearch: (term: string) => void;
  makeAdmin: (userId: string, isAdmin: boolean, role?: string) => Promise<void>;
  handleBanUser: (userId: string, isBanned: boolean) => void;
  handleDeleteUser: (userId: string) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Arama terimini değiştirdiğimizde parent komponente bildir
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
  };

  const userOptions = users.map(u => ({
    value: u.id,
    label: `${u.name} (${u.coin ?? 0} SLC)`
  }));

  return (
    <div className="space-y-6">
      {/* Arama ve Filtreler */}
      <div className="bg-[#111111]/40 backdrop-blur-md rounded-2xl p-6 border border-white/5">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <RiSearchLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Kullanıcı ara..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
            />
          </div>
        </div>
      </div>

      {/* Kullanıcı Listesi */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-[#18181b]/80 to-[#232334]/80 backdrop-blur-md border-b border-white/10 rounded-t-xl shadow-sm">
              <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-blue-200 uppercase">Kullanıcı</th>
              <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-blue-200 uppercase">ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-blue-200 uppercase">E-posta</th>
              <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-blue-200 uppercase">Katılım Tarihi</th>
              <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-blue-200 uppercase">Son Giriş Tarihi</th>
              <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-blue-200 uppercase">Rol</th>
              <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-blue-200 uppercase">Coin Miktarı</th>
              <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-blue-200 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-400">
                  Yükleniyor...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-400">
                  Kullanıcı bulunamadı
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/10">
                        <img
                          src={user.image || '/images/users/default.png'}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{user.id}</td>
                  <td className="px-6 py-4 text-gray-400">{user.email || '-'}</td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(user.joinedAt || user.createdAt || Date.now()).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(user.lastLogin).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 text-white">
                    <select
                      value={user.role || 'member'}
                      onChange={(e) => makeAdmin(user.id, user.isAdmin, e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-zinc-800 appearance-none"
                    >
                      <option value="member">Member</option>
                      <option value="customer">Customer</option>
                      <option value="owner">Owner</option>
                      <option value="developer">Developer</option>
                      <option value="staff">Staff</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-yellow-400 font-bold">{user.coin ?? 0} SLC</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => makeAdmin(user.id, !user.isAdmin, user.role)}
                      className={`p-2 rounded-lg transition-colors ${
                        user.isAdmin
                          ? 'bg-red-500/40 text-red-400 hover:bg-red-500/60'
                          : 'bg-green-500/40 text-green-400 hover:bg-green-500/60'
                      }`}
                      title={user.isAdmin ? 'Admin Yetkisini Al' : 'Admin Yap'}
                    >
                      {user.isAdmin ? <RiShieldUserFill size={20} /> : <RiShieldUserLine size={20} />}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="ml-2 p-2 rounded-lg bg-red-500/40 text-red-400 hover:bg-red-500/60 transition-colors"
                      title="Kullanıcıyı Sil"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Duyurular Bileşeni
const AnnouncementsContent = () => {
  const { data: session } = useSession();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isImportant: false
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements');
      const data = await response.json();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          adminId: session?.user?.id,
          adminName: session?.user?.name,
          adminImage: session?.user?.image
        }),
      });

      if (response.ok) {
        setShowAddModal(false);
        setFormData({ title: '', description: '', isImportant: false });
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error adding announcement:', error);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnnouncement) return;

    try {
      const response = await fetch('/api/announcements', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedAnnouncement.id,
          ...formData,
          adminId: session?.user?.id,
          adminName: session?.user?.name,
          adminImage: session?.user?.image
        }),
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedAnnouncement(null);
        setFormData({ title: '', description: '', isImportant: false });
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error updating announcement:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu duyuruyu silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch('/api/announcements', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const openEditModal = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      description: announcement.description,
      isImportant: announcement.isImportant,
    });
    setShowEditModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Duyuru Yönetimi</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500/80 hover:bg-blue-600/90 px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <RiAddLine />
          <span>Yeni Duyuru</span>
        </button>
      </div>

      <div className="grid gap-4">
        {announcements.map((announcement) => (
          <motion.div
            key={announcement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-xl ${
              announcement.isImportant ? 'bg-red-500/10' : 'bg-white/5'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold mb-2">{announcement.title}</h3>
                <p className="text-gray-400">{announcement.description}</p>
                <div className="mt-2 text-sm text-gray-500">
                  {new Date(announcement.createdAt).toLocaleString('tr-TR')}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(announcement)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <RiEdit2Line size={20} />
                </button>
                <button
                  onClick={() => handleDelete(announcement.id)}
                  className="p-2 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors"
                >
                  <RiDeleteBin6Line size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#1A1A1A] rounded-xl p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold mb-4">Yeni Duyuru</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Başlık</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Açıklama</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 h-32"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isImportant"
                    checked={formData.isImportant}
                    onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="isImportant">Önemli Duyuru</label>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-500/80 hover:bg-blue-600/90"
                  >
                    Ekle
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#1A1A1A] rounded-xl p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold mb-4">Duyuru Düzenle</h2>
              <form onSubmit={handleEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Başlık</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Açıklama</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 h-32"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isImportantEdit"
                    checked={formData.isImportant}
                    onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="isImportantEdit">Önemli Duyuru</label>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-500/80 hover:bg-blue-600/90"
                  >
                    Güncelle
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// YouTube Media Component
const YoutubeMediaContent = () => {
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>(['', '']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchYoutubeUrls();
  }, []);

  const fetchYoutubeUrls = async () => {
    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      const response = await fetch('/api/youtube-media');
      if (!response.ok) {
        throw new Error(`Failed to fetch YouTube URLs: ${response.statusText}`);
      }
      const data = await response.json();
      setYoutubeUrls(data.youtubeUrls || ['', '']);
    } catch (error) {
      console.error('Error fetching YouTube URLs:', error);
      setError('Video URL\'leri yüklenirken bir hata oluştu.');
      setYoutubeUrls(['', '']);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUrls = async () => {
    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      const response = await fetch('/api/youtube-media', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ youtubeUrls }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update YouTube URLs');
      }
      const data = await response.json();
      setYoutubeUrls(data.youtubeUrls || ['', '']);
      setMessage('Video URL\'leri başarıyla güncellendi!');
    } catch (error) {
      console.error('Error updating YouTube URLs:', error);
      setError('Video URL\'leri güncellenirken bir hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
      // Clear message after a few seconds
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleClearUrl = (index: number) => {
    if (confirm(`Video URL'ni silmek istediğinizden emin misiniz?`)) {
      const newUrls = [...youtubeUrls];
      newUrls[index] = '';
      setYoutubeUrls(newUrls);
      handleUpdateUrls();
    }
  };

  return (
    <div className="p-6">
      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">YouTube Video Yönetimi</h2>
        </div>

        {loading ? (
          <div className="text-center text-gray-400">Yükleniyor...</div>
        ) : (
          <div className="space-y-6">
            {youtubeUrls.map((url, index) => (
              <div key={index} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Video {index + 1} URL</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setYoutubeUrls(prev => {
                      const newUrls = [...prev];
                      newUrls[index] = e.target.value;
                      return newUrls;
                    })}
                    placeholder="YouTube video URL'si girin"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleClearUrl(index)}
                    disabled={!url || loading}
                    className={`px-4 py-2 rounded-lg ${!url || loading ? 'bg-gray-600' : 'bg-red-500 hover:bg-red-600'} text-white`}
                  >
                    URL'i Sil
                  </button>
                </div>
              </div>
            ))}

            {message && (
              <div className="p-3 bg-green-500/20 text-green-400 rounded-lg">
                {message}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/20 text-red-400 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleUpdateUrls}
                disabled={loading}
                className={`px-4 py-2 rounded-lg ${loading ? 'bg-gray-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
              >
                Tüm URL'leri Güncelle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// New Component for Nasıl Kullanılır Video Management
const NasilKullanilirVideoContent = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchVideoUrl();
  }, []);

  const fetchVideoUrl = async () => {
    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      const response = await fetch('/api/youtube-teams-media');
      if (!response.ok) {
        throw new Error(`Failed to fetch video URL: ${response.statusText}`);
      }
      const data = await response.json();
      setVideoUrl(data.youtubeUrl || '');
    } catch (error) {
      console.error('Error fetching video URL:', error);
      setError('Video URL\'si yüklenirken bir hata oluştu.');
      setVideoUrl('');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUrl = async () => {
    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      const response = await fetch('/api/youtube-teams-media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ youtubeUrl: videoUrl }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update video URL');
      }
      const data = await response.json();
      setMessage(data.message || 'Video URL\'si başarıyla güncellendi!');
    } catch (error) {
      console.error('Error updating video URL:', error);
      setError('Video URL\'si güncellenirken bir hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
      // Clear message after a few seconds
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Nasıl Kullanılır Video URL Yönetimi</h2>
        </div>

        {loading ? (
          <div className="text-center text-gray-400">Yükleniyor...</div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Video URL</label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="YouTube video URL'si girin"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
              />
            </div>

            {message && (
              <div className="p-3 bg-green-500/20 text-green-400 rounded-lg">
                {message}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/20 text-red-400 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleUpdateUrl}
                disabled={loading}
                className={`px-4 py-2 rounded-lg ${loading ? 'bg-gray-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
              >
                URL'yi Güncelle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Purchase History Component
const PurchaseHistoryContent = () => {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await fetch('/api/purchases');
        if (!response.ok) throw new Error('Satın alım geçmişi yüklenemedi');
        const data = await response.json();
        // Sadece coin alımlarını filtrele
        const coinPurchases = Array.isArray(data)
          ? data.filter((p: any) => p.amount && p.price && p.currency && p.status === 'completed')
          : [];
        setPurchases(coinPurchases);
      } catch (e) {
        setError('Satın alım geçmişi yüklenemedi');
        setPurchases([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPurchases();
  }, []);
  
  // Toplam USD hesapla
  const totalUSD = purchases.reduce((sum, p) => sum + (typeof p.price === 'number' ? p.price : parseFloat(p.price)), 0);

  return (
    <div className="space-y-6">
      <div className="bg-[#111111]/40 backdrop-blur-md rounded-2xl p-6 border border-white/5 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white mb-0">Satın Alım Geçmişi</h2>
          <div className="flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20">
            <span className="text-gray-400 font-medium">Toplam Satış:</span>
            <span className="text-2xl font-extrabold text-green-400">${totalUSD.toFixed(2)} USD</span>
          </div>
        </div>
        <div className="overflow-x-auto max-h-[480px] custom-scrollbar">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-[#18181b]/80 to-[#232334]/80 backdrop-blur-md border-b border-white/10 rounded-t-xl shadow-sm">
                <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-blue-200 uppercase">Kullanıcı</th>
                <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-blue-200 uppercase">SLC Miktarı</th>
                <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-blue-200 uppercase">Ödeme</th>
                <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-blue-200 uppercase">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-400">Yükleniyor...</td></tr>
              ) : purchases.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-400">Satın alım kaydı yok</td></tr>
              ) : (
                purchases.map((purchase: any) => (
                  <tr key={purchase.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap align-middle">
                      <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                        <img src={purchase.userImage || '/images/users/default.png'} alt={purchase.userName} className="w-8 h-8 rounded-full object-cover border border-white/10 shadow-sm inline-block align-middle mr-2" />
                        <span className="align-middle">{purchase.userName}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-yellow-400 font-bold whitespace-nowrap align-middle">{purchase.amount} SLC</td>
                    <td className="px-6 py-4 text-green-400 font-bold whitespace-nowrap align-middle">${purchase.price}</td>
                    <td className="px-6 py-4 text-gray-400 whitespace-nowrap align-middle">{new Date(purchase.purchaseDate).toLocaleString('tr-TR')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
                        </div>
                      </div>
      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #6366f1 #18181b;
        }
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
          width: 8px;
          background: #18181b;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #6366f1 40%, #a78bfa 100%);
          border-radius: 8px;
          transition: background 0.2s;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #818cf8 0%, #c4b5fd 100%);
        }
      `}</style>
    </div>
  );
};

// Coin Purchases Component
const CoinPurchasesContent = () => {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPurchases() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/purchases');
        const data = await res.json();
        // Sadece coin alımlarını ve onaylanmışları filtrele
        const coinPurchases = Array.isArray(data)
          ? data.filter((p: any) => p.amount && p.price && p.currency && p.status === 'completed')
          : [];
        setPurchases(coinPurchases);
      } catch {
        setError('Satın alım geçmişi yüklenirken hata oluştu.');
        setPurchases([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPurchases();
  }, []);

  // Toplam USD hesapla
  const totalUSD = purchases.reduce((sum, p) => sum + (typeof p.price === 'number' ? p.price : parseFloat(p.price)), 0);

  return (
    <div className="space-y-6">
      <div className="bg-[#111111]/40 backdrop-blur-md rounded-2xl p-6 border border-white/5 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Coin Satın Alımları</h2>
          <div className="flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20">
            <span className="text-gray-400 font-medium">Toplam Satış:</span>
          <span className="text-2xl font-extrabold text-green-400">${totalUSD.toFixed(2)} USD</span>
          </div>
        </div>
        {error ? (
          <div className="mb-6 p-4 bg-red-500/10 rounded-lg text-red-400 text-center font-semibold">{error}</div>
        ) : (
        <div className="overflow-x-auto max-h-[480px] custom-scrollbar">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-[#18181b]/80 to-[#232334]/80 backdrop-blur-md border-b border-white/10 rounded-t-xl shadow-sm">
                <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-blue-200 uppercase">Kullanıcı</th>
                <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-blue-200 uppercase">Coin</th>
                <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-blue-200 uppercase">Ödeme</th>
                <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-blue-200 uppercase">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-400">Yükleniyor...</td></tr>
              ) : purchases.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-400">Coin satın alım kaydı yok</td></tr>
              ) : (
                purchases.map((p: any, idx: number) => (
                  <tr key={p.id || p.purchaseDate + p.userId}
                      className={
                        `hover:bg-blue-500/10 transition-colors ${idx % 2 === 0 ? 'bg-white/2' : 'bg-white/0'}`
                      }
                  >
                    <td className="px-6 py-4 text-white whitespace-nowrap font-medium flex items-center gap-2">
                      <img src={p.userImage || '/images/users/default.png'} alt={p.userName} className="w-8 h-8 rounded-full object-cover border border-white/10 shadow-sm" />
                      <span>{p.userName}</span>
                    </td>
                    <td className="px-6 py-4 text-yellow-400 font-bold whitespace-nowrap">{p.amount} SLC</td>
                    <td className="px-6 py-4 text-green-400 font-bold whitespace-nowrap">${p.price}</td>
                    <td className="px-6 py-4 text-gray-400 whitespace-nowrap">{new Date(p.purchaseDate).toLocaleString('tr-TR')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>
      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #6366f1 #18181b;
        }
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
          width: 8px;
          background: #18181b;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #6366f1 40%, #a78bfa 100%);
          border-radius: 8px;
          transition: background 0.2s;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #818cf8 0%, #c4b5fd 100%);
        }
      `}</style>
    </div>
  );
};

// Varsayılan Profil Fotoğrafı Ayarları Bileşeni
const DefaultProfileImageSettings = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mevcut default profil fotoğrafını getir
    fetch('/api/admin/default-profile-image')
      .then(res => res.json())
      .then(data => setCurrentUrl(data.url))
      .catch(() => setCurrentUrl(null));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    try {
      const res = await fetch('/api/admin/default-profile-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Varsayılan profil fotoğrafı başarıyla güncellendi!');
        setCurrentUrl(data.url);
        setPreviewUrl(null);
        setSelectedFile(null);
      } else {
        setMessage(data.message || 'Bir hata oluştu.');
      }
    } catch (err) {
      setMessage('Bir hata oluştu.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Varsayılan Profil Fotoğrafı</h2>
      <div className="mb-6">
        <div className="mb-2 text-gray-400">Şu anki varsayılan fotoğraf:</div>
        {currentUrl ? (
          <img src={currentUrl} alt="Varsayılan Profil" className="w-24 h-24 rounded-full object-cover border border-white/10" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">Yok</div>
        )}
      </div>
      <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />
      {previewUrl && (
        <div className="mb-4">
          <div className="mb-2 text-gray-400">Önizleme:</div>
          <img src={previewUrl} alt="Önizleme" className="w-24 h-24 rounded-full object-cover border border-blue-400" />
        </div>
      )}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || loading}
        className="px-6 py-2 rounded-lg bg-blue-500/80 hover:bg-blue-600/90 text-white font-semibold disabled:opacity-60"
      >
        {loading ? 'Yükleniyor...' : 'Kaydet'}
      </button>
      {message && <div className="mt-4 text-green-400">{message}</div>}
    </div>
  );
};

// Coin Add Component
const CoinAdd = ({ userId }: { userId: string }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddCoin = async () => {
    setLoading(true);
    setSuccess(null);
    setError(null);
    const parsed = parseInt(amount, 10);
    if (isNaN(parsed) || parsed <= 0) {
      setError('Geçerli bir miktar girin');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/users/${userId}/slc-balance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parsed }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Coin başarıyla eklendi!');
        setAmount('');
      } else {
        setError(data.error || 'Bir hata oluştu');
      }
    } catch (e) {
      setError('Bir hata oluştu');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
    }
  };

  return (
    <div className="inline-flex items-center ml-2 space-x-1">
      <input
        type="number"
        min={1}
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="Coin"
        className="w-16 px-2 py-1 rounded bg-white/10 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50"
        disabled={loading}
      />
      <button
        onClick={handleAddCoin}
        disabled={loading || !amount}
        className="px-2 py-1 rounded bg-blue-500/80 hover:bg-blue-600/90 text-white text-xs font-semibold disabled:opacity-60"
        title="Coin Ekle"
      >
        +
      </button>
      {success && <span className="text-green-400 text-xs ml-1">{success}</span>}
      {error && <span className="text-red-400 text-xs ml-1">{error}</span>}
    </div>
  );
};

// CoinAddDashboard component'ı ekle
const CoinAddDashboard = ({ users, onSuccess }: { users: any[], onSuccess: () => void }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddCoin = async () => {
    setLoading(true);
    setSuccess(null);
    setError(null);
    const parsed = parseInt(amount, 10);
    if (!selectedUser) {
      setError('Kullanıcı seçin');
      setLoading(false);
      return;
    }
    if (isNaN(parsed) || parsed <= 0) {
      setError('Geçerli bir miktar girin');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/users/${selectedUser}/slc-balance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parsed }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Coin başarıyla eklendi!');
        setAmount('');
        setSelectedUser('');
        onSuccess && onSuccess();
      } else {
        setError(data.error || 'Bir hata oluştu');
      }
    } catch (e) {
      setError('Bir hata oluştu');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
    }
  };

  const handleSubtractCoin = async () => {
    setLoading(true);
    setSuccess(null);
    setError(null);
    const parsed = parseInt(amount, 10);
    if (!selectedUser) {
      setError('Kullanıcı seçin');
      setLoading(false);
      return;
    }
    if (isNaN(parsed) || parsed <= 0) {
      setError('Geçerli bir miktar girin');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/users/${selectedUser}/slc-balance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: -parsed }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Coin başarıyla çıkarıldı!');
        setAmount('');
        setSelectedUser('');
        onSuccess && onSuccess();
      } else {
        setError(data.error || 'Bir hata oluştu');
      }
    } catch (e) {
      setError('Bir hata oluştu');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
    }
  };

  const userOptions = users.map(u => ({
    value: u.id,
    label: `${u.name} (${u.coin ?? 0} SLC)`
  }));

  return (
    <div className="flex flex-col gap-2 mt-4">
      <div className="flex gap-2 items-center">
        <Select
          options={userOptions}
          value={userOptions.find(opt => opt.value === selectedUser) || null}
          onChange={opt => setSelectedUser(opt?.value || '')}
          placeholder="Kullanıcı Seç"
          isDisabled={loading || users.length === 0}
          styles={{
            control: (base) => ({
              ...base,
              backgroundColor: '#18181b',
              color: '#fff',
              borderColor: '#222',
            }),
            menu: (base) => ({
              ...base,
              backgroundColor: '#18181b',
              color: '#fff',
            }),
            singleValue: (base) => ({
              ...base,
              color: '#fff',
            }),
            option: (base, state) => ({
              ...base,
              background: state.isSelected 
                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.6), rgba(139, 92, 246, 0.6))' 
                : state.isFocused 
                ? 'rgba(255, 255, 255, 0.03)' 
                : 'transparent',
              color: 'white',
              cursor: 'pointer',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: state.isSelected ? '400' : '300',
              transition: 'all 0.15s ease',
              '&:hover': {
                background: state.isSelected 
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.7), rgba(139, 92, 246, 0.7))' 
                  : 'rgba(255, 255, 255, 0.06)',
              }
            }),
          }}
        />
        <input
          type="number"
          min={1}
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Coin"
          className="w-20 px-2 py-2 rounded bg-white/10 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50"
          disabled={loading}
        />
        <button
          onClick={handleAddCoin}
          disabled={loading || !selectedUser || !amount}
          className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold disabled:opacity-60 shadow-lg shadow-blue-500/30"
        >
          Coin Ekle
        </button>
        <button
          onClick={handleSubtractCoin}
          disabled={loading || !selectedUser || !amount}
          className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-60 shadow-lg shadow-red-500/30"
        >
          Coin Çıkar
        </button>
      </div>
      {success && <span className="text-green-400 text-xs ml-1">{success}</span>}
      {error && <span className="text-red-400 text-xs ml-1">{error}</span>}
    </div>
  );
};

// Ana Admin Panel Bileşeni
export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isImportant: false
  });
  const [newPackage, setNewPackage] = useState({
    name: '',
    image: '',
    description: '',
    priceOptions: [{ duration: '', price: '', stock: '' }],
    stock: '',
    features: [''],
  });
  const [editPackage, setEditPackage] = useState<any|null>(null);
  const [showEditPackageModal, setShowEditPackageModal] = useState(false);
  const [deletePackageId, setDeletePackageId] = useState<string|null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // Paketler için state'ler
  const [packages, setPackages] = useState<any[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/');
      return;
    }

    // Admin kontrolü
    const isAdmin = admins.adminIds.includes(session.user?.id || '');
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }

    // Kullanıcıları yükle
    if (activeTab === 'users' || activeTab === 'dashboard') {
      fetchUsers();
    }
  }, [session, status, router, activeTab]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error(`API yanıtı başarısız: ${response.status}`);
      }
      
      let data = await response.json();
      
      // API yanıtının bir dizi olduğundan emin olalım
      // Eğer 'users' anahtarı altında bir dizi ise o diziyi alalım
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        if (Array.isArray(data.users)) {
          data = data.users;
        } else if (Array.isArray(data.data)) {
          data = data.data;
        }
      }
      
      // Son kontrol - veriyi diziye çevirelim
      const usersArray = Array.isArray(data) ? data : [];
      console.log('Alınan kullanıcı verileri:', usersArray);
      
      setUsers(usersArray);
      setFilteredUsers(usersArray);
    } catch (error) {
      console.error('Kullanıcıları getirirken hata:', error);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Kullanıcıları filtrele
  const handleUserSearch = (term: string) => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(term.toLowerCase()) ||
      user.email?.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const makeAdmin = async (userId: string, isAdmin: boolean, role?: string) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, isAdmin, role }),
      });

      if (response.ok) {
        fetchUsers(); // Kullanıcı listesini yenile
      }
    } catch (error) {
      console.error('Error updating user admin status:', error);
    }
  };

  const handleBanUser = async (userId: string, isBanned: boolean) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, isBanned: !isBanned }),
      });
      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user ban status:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;
    try {
      const response = await fetch('/api/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...newPackage,
      priceOptions: newPackage.priceOptions.map(opt => ({ ...opt, price: Number(opt.price) })),
      stock: Number(newPackage.stock),
      features: newPackage.features.filter(f => f.trim() !== ''),
    };
    const res = await fetch('/api/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setShowAddPackageModal(false);
      setNewPackage({ name: '', image: '', description: '', priceOptions: [{ duration: '', price: '', stock: '' }], stock: '', features: [''] });
      setPackagesLoading(true);
      fetch('/api/packages').then(r => r.json()).then(data => setPackages(data)).finally(() => setPackagesLoading(false));
    }
  };

  // Paket sil fonksiyonu
  const handleDeletePackage = async () => {
    if (!deletePackageId) return;
    const res = await fetch('/api/packages', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deletePackageId }),
    });
    if (res.ok) {
      setShowDeleteConfirm(false);
      setDeletePackageId(null);
      setPackagesLoading(true);
      fetch('/api/packages').then(r => r.json()).then(data => setPackages(data)).finally(() => setPackagesLoading(false));
    }
  };



  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', icon: RiDashboardLine, label: 'Dashboard' },
    { id: 'users', icon: RiUser3Line, label: 'Kullanıcılar' },
    { id: 'purchases', icon: RiShoppingBag3Line, label: 'Satın Alımlar' },
    { id: 'packages', icon: RiFileList3Line, label: 'Paketler' },
    { id: 'guides', icon: RiFileList3Line, label: 'Kılavuzlar' },
    { id: 'stock', icon: RiCoinLine, label: 'Stok' },
    { id: 'announcements', icon: RiNotification3Line, label: 'Duyurular' },
    { id: 'youtube', icon: RiKeyLine, label: 'YouTube Video' },
    { id: 'profile-settings', icon: RiUser3Line, label: 'Profil Ayarları' },
    { id: 'transfer-log', icon: RiCoinLine, label: 'Transfer Log' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      {/* Background */}
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
      <div className={`bg-[#111111]/40 backdrop-blur-md border-r border-white/5 h-screen sticky top-0 z-30 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            {isSidebarOpen && (
              <div className="flex items-center space-x-3">
                <img src="/images/logo.png" alt="Logo" className="w-8 h-8" />
                <span className="text-lg font-bold">Admin Panel</span>
              </div>
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
                {isSidebarOpen && <span>{tab.label}</span>}
              </button>
            ))}
          </div>
        </div>

        {isSidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <button
              onClick={() => signOut()}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-500/40 transition-colors text-red-400"
            >
              <RiLogoutBoxRLine size={24} />
              <span>Çıkış Yap</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-[#111111]/40 backdrop-blur-md border-b border-white/5 sticky top-0 z-20">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold">
              {tabs.find(t => t.id === activeTab)?.label}
            </h1>
            <div className="flex items-center space-x-4">
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
        <main className="p-6">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-[#111111]/40 backdrop-blur-md rounded-2xl p-6 border border-white/5">
                <h3 className="text-xl font-semibold mb-4">Hoş Geldiniz</h3>
                <p className="text-gray-400 mb-6">Admin panelinize hoş geldiniz. Sol menüden işlem yapmak istediğiniz bölümü seçebilirsiniz.</p>
                <CoinAddDashboard users={users} onSuccess={fetchUsers} />
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <UsersContent
              users={filteredUsers}
              isLoading={isLoading}
              onSearch={handleUserSearch}
              makeAdmin={makeAdmin}
              handleBanUser={handleBanUser}
              handleDeleteUser={handleDeleteUser}
            />
          )}
          
          {activeTab === 'purchases' && <PurchaseHistoryContent />}
          
          {activeTab === 'packages' && (
            <div className="bg-[#111111]/40 backdrop-blur-md rounded-2xl p-6 border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Paketler Yönetimi</h2>
                <button
                  onClick={() => router.push('/helele/packages/new')}
                  className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white font-semibold"
                >
                  Paket Ekle
                </button>
              </div>
              <AdminPackagesContent />
            </div>
          )}
          
          {activeTab === 'guides' && <GuidesContent />}
          
          {activeTab === 'stock' && (
            <div className="space-y-6">
              <CurrentStockContent />
            </div>
          )}
          
          {activeTab === 'current-stock' && <CurrentStockContent />}
          
          {activeTab === 'announcements' && <AnnouncementsContent />}

          {activeTab === 'youtube' && <YoutubeMediaContent />}

          {/* Add the new component for Nasıl Kullanılır video management */}
          {activeTab === 'youtube' && <NasilKullanilirVideoContent />}

          {activeTab === 'profile-settings' && <DefaultProfileImageSettings />}

          {activeTab === 'transfer-log' && <TransferLogContent />}
        </main>
      </div>
    </div>
  );
} 

// --- StockCard Bileşeni ---
function StockCard({ pkg }: { pkg: any }) {
  const [open, setOpen] = useState(false);
  const [inputs, setInputs] = useState<{ [duration: string]: string }>({});
  const [localStock, setLocalStock] = useState<{ [duration: string]: string[] }>(() => {
    const obj: { [duration: string]: string[] } = {};
    pkg.priceOptions.forEach((opt: any) => {
      obj[opt.duration] = opt.stockList || [];
    });
    return obj;
  });
  // Yeni state'ler:
  const [showStockPanel, setShowStockPanel] = useState(false);
  const [panelDuration, setPanelDuration] = useState<string>('');
  const [editIdx, setEditIdx] = useState<number|null>(null);
  const [editValue, setEditValue] = useState('');
  const [panelOpt, setPanelOpt] = useState<any>(null);

  const handleAddStock = (duration: string) => {
    if (!inputs[duration] || !inputs[duration].trim()) return;
    // Yeni stok (input) eklenirken, mevcut (localStock) stockList'e ekleme yapıyoruz.
    setLocalStock(prev => ({ ...prev, [duration]: [...(prev[duration] || []), inputs[duration].trim()] }));
    setInputs(prev => ({ ...prev, [duration]: '' }));
  };
  const handleRemoveStock = (duration: string, idx: number) => {
    setLocalStock(prev => ({
      ...prev,
      [duration]: prev[duration].filter((_, i) => i !== idx)
    }));
  };

  return (
    <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-2xl border border-white/10 p-4 flex flex-col items-start shadow-xl cursor-pointer transition-all hover:scale-[1.02]" onClick={() => setOpen(o => !o)}>
      <img src={pkg.image} alt={pkg.name} className="w-full h-32 object-cover rounded-xl mb-4" />
      <div className="font-bold text-lg text-white mb-1">{pkg.name}</div>
      <div className="text-blue-400 font-semibold mb-1">{pkg.priceOptions[0]?.price} SLC</div>
      <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${pkg.priceOptions[0]?.stockList?.length > 0 ? 'bg-green-900/60 text-green-300' : 'bg-red-900/60 text-red-300'}`}>{pkg.priceOptions[0]?.stockList?.length || 0} Stok</div>
      {open && (
        <div className="w-full mt-4 space-y-4">
          {pkg.priceOptions.map((opt: any) => (
            <div key={opt.duration} className="bg-[#232733] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-400 font-semibold">{opt.duration}</span>
                <span className="text-yellow-400 font-bold">{opt.price} SLC</span>
                <button
                  className="ml-auto px-2 py-1 bg-green-500/80 hover:bg-green-600 text-white rounded text-xs font-bold"
                  onClick={e => { e.stopPropagation(); setShowStockPanel(true); setPanelDuration(opt.duration); setPanelOpt(opt); }}
                >Stokları Göster</button>
              </div>
              <div className="flex gap-2 mb-2">
                <textarea
                  className="flex-1 p-2 rounded bg-[#181A20] text-white border border-white/10 min-h-[40px] max-h-32 resize-y"
                  placeholder="Stok metni (satır atlamalı)"
                  value={inputs[opt.duration] || ''}
                  onChange={e => setInputs(prev => ({ ...prev, [opt.duration]: e.target.value }))}
                  onClick={e => e.stopPropagation()}
                />
                <button
                  className="px-3 py-1 bg-blue-500/80 hover:bg-blue-600 text-white rounded-lg text-sm font-bold"
                  onClick={e => { e.stopPropagation(); handleAddStock(opt.duration); }}
                >+ Ekle</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Stokları gösteren büyük panel */}
      {showStockPanel && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="relative w-full max-w-4xl min-h-[70vh] bg-[#181A20] rounded-3xl shadow-2xl border border-white/10 flex flex-col mx-4">
            <button className="absolute top-6 right-8 text-gray-400 hover:text-white text-3xl" onClick={() => { setShowStockPanel(false); setEditIdx(null); setEditValue(''); }}>&times;</button>
            <div className="flex flex-col md:flex-row items-center gap-8 p-10 border-b border-white/10">
              <img src={pkg.image} alt={pkg.name} className="w-32 h-32 object-cover rounded-2xl border border-white/10 shadow-lg" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="text-3xl font-bold text-white">{pkg.name}</div>
                <div className="text-blue-400 text-lg font-semibold">{panelOpt?.duration} - {panelOpt?.price} SLC</div>
              </div>
              <button className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white font-semibold text-lg" onClick={() => { setShowStockPanel(false); setEditIdx(null); setEditValue(''); }}>Geri Dön</button>
            </div>
            <div className="p-10 flex-1 flex flex-col gap-8 overflow-y-auto">
              {/* Ekleme alanı */}
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                <textarea
                  className="flex-1 p-4 rounded-xl bg-[#232733] text-white border border-white/10 min-h-[60px] max-h-40 resize-y text-lg"
                  placeholder="Yeni stok metni (satır atlamalı)"
                  value={inputs[panelDuration] || ''}
                  onChange={e => setInputs(prev => ({ ...prev, [panelDuration]: e.target.value }))}
                />
                <button
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-lg font-bold shadow-lg"
                  onClick={() => handleAddStock(panelDuration)}
                >+ Ekle</button>
              </div>
              {/* Stok listesi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(localStock[panelDuration] || []).length === 0 && <div className="text-gray-400 col-span-2">Stok yok.</div>}
                {(localStock[panelDuration] || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-[#232733] rounded-2xl px-6 py-4 text-green-300 whitespace-pre-line shadow-md">
                    {editIdx === idx ? (
                      <>
                        <input
                          className="flex-1 p-3 rounded-xl bg-[#181A20] text-white border border-white/10 text-lg"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                        />
                        <button className="text-blue-400 font-bold text-lg" onClick={() => {
                          setLocalStock(prev => ({
                            ...prev,
                            [panelDuration]: prev[panelDuration].map((v, i) => i === idx ? editValue : v)
                          }));
                          setEditIdx(null);
                          setEditValue('');
                        }}>Kaydet</button>
                        <button className="text-gray-400 font-bold text-lg" onClick={() => { setEditIdx(null); setEditValue(''); }}>İptal</button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 break-all text-lg">{item}</span>
                        <button className="text-yellow-400 font-bold text-lg" onClick={() => { setEditIdx(idx); setEditValue(item); }}>Düzenle</button>
                        <button className="text-red-400 hover:text-red-600 font-bold text-2xl" onClick={() => handleRemoveStock(panelDuration, idx)}>×</button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Yeni AdminPackagesContent bileşeni:
function AdminPackagesContent() {
  const router = useRouter();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/packages')
      .then(res => res.json())
      .then(data => setPackages(data))
      .catch(() => setError('Paketler yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Bu paketi silmek istediğinize emin misiniz?')) return;
    setDeleting(id);
    try {
      const res = await fetch('/api/packages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setPackages(pkgs => pkgs.filter(p => p.id !== id));
      } else {
        alert('Paket silinemedi.');
      }
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="text-gray-400">Yükleniyor...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (packages.length === 0) return <div className="text-gray-400">Paket yok.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {packages.map(pkg => (
        <div key={pkg.id} className="bg-[#181A20] rounded-2xl border border-white/10 p-6 flex flex-col shadow-xl">
          <img src={pkg.image} alt={pkg.name} className="w-full h-32 object-cover rounded-xl mb-4" />
          <div className="font-bold text-lg text-white mb-2">{pkg.name}</div>
          <div className="text-gray-400 mb-2">{pkg.description}</div>
          <div className="mb-2">
            {pkg.durations && pkg.durations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {pkg.durations.map((d: any, idx: number) => (
                  <span key={idx} className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-sm font-semibold">
                    {d.label} - {d.coinPrice} SLC
                  </span>
                ))}
              </div>
            )}
          </div>
          {pkg.features && pkg.features.length > 0 && (
            <ul className="mt-2 mb-2 list-disc list-inside text-green-400 text-sm">
              {pkg.features.map((f: string, idx: number) => (
                <li key={idx}>{f}</li>
              ))}
            </ul>
          )}
          <div className="flex gap-2 mt-4">
            <button
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
              onClick={() => window.location.href = `/helele/packages/edit/${pkg.id}`}
            >
              Düzenle
            </button>
            <button
              className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold"
              onClick={() => handleDelete(pkg.id)}
              disabled={deleting === pkg.id}
            >
              {deleting === pkg.id ? 'Siliniyor...' : 'Sil'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Yeni AdminStockContent bileşeni:


// StockDurationManager bileşeni örnek (stok ekleme/çıkarma için):
function StockDurationManager({ pkgId, duration }: { pkgId: string, duration: any }) {
  const [stock, setStock] = useState<number>(duration.stockList ? duration.stockList.length : 0);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleUpdateStock = async () => {
    setLoading(true);
    setError(null);
    try {
      // Stok güncelleme işlemi için stockList güncellenmeli
      const res = await fetch(`/api/packages/${pkgId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationLabel: duration.label, stockList: duration.stockList })
      });
      if (res.ok) {
        setStock(duration.stockList ? duration.stockList.length : 0);
        setInput('');
      } else {
        setError('Stok güncellenemedi.');
      }
    } catch {
      setError('Stok güncellenemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#232733] rounded-xl p-4 mb-2">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-blue-400 font-semibold">{duration.label}</span>
        <span className="text-yellow-400 font-bold">{duration.coinPrice} SLC</span>
        <span className="ml-auto text-green-400 font-bold">Stok: {stock}</span>
      </div>
      <div className="flex gap-2">
        <button
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
          onClick={() => router.push(`/helele/stock/add?packageId=${pkgId}&duration=${encodeURIComponent(duration.label)}`)}
        >
          Stok Ekle
        </button>
      </div>
      {error && <div className="text-red-400 mt-2">{error}</div>}
    </div>
  );
}

const TransferLogContent = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const [logsRes, usersRes] = await Promise.all([
        fetch('/api/admin/transfer-logs'),
        fetch('/api/users')
      ]);
      const logsData = await logsRes.json();
      let usersData = await usersRes.json();
      if (usersData && usersData.users) usersData = usersData.users;
      setLogs(Array.isArray(logsData) ? logsData.reverse() : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error fetching logs or users:', error);
      setLogs([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // Set up periodic refresh every 5 seconds
    const intervalId = setInterval(fetchLogs, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const getUser = (id: string) => users.find((u: any) => u.id === id);

  return (
    <div className="space-y-6">
      <div className="bg-[#111111]/40 backdrop-blur-md rounded-2xl p-6 border border-white/5 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">Transfer Logları</h2>
        <div className="overflow-x-auto max-h-[480px] custom-scrollbar">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-[#18181b]/80 to-[#232334]/80 backdrop-blur-md border-b border-white/10 rounded-t-xl shadow-sm">
                <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-blue-200 uppercase">Kimden</th>
                <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-blue-200 uppercase">Kime</th>
                <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-blue-200 uppercase">Miktar</th>
                <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-blue-200 uppercase">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-400">Yükleniyor...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-400">Transfer kaydı yok</td></tr>
              ) : (
                logs.map((log: any) => {
                  const fromUser = getUser(log.fromUserId);
                  const toUser = getUser(log.toUserId);
                  return (
                  <tr key={log.logId} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                          <img src={fromUser?.image || '/images/users/default.png'} alt={fromUser?.name || log.fromUserId} className="w-8 h-8 rounded-full object-cover border border-white/10 shadow-sm inline-block align-middle mr-2" />
                          <span className="align-middle">{fromUser?.name || log.fromUserId}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                          <img src={toUser?.image || '/images/users/default.png'} alt={toUser?.name || log.toUserId} className="w-8 h-8 rounded-full object-cover border border-white/10 shadow-sm inline-block align-middle mr-2" />
                          <span className="align-middle">{toUser?.name || log.toUserId}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-blue-400 font-bold whitespace-nowrap align-middle">{log.amount} SLC</td>
                      <td className="px-6 py-4 text-gray-400 whitespace-nowrap align-middle">{new Date(log.date).toLocaleString('tr-TR')}</td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #6366f1 #18181b;
        }
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
          width: 8px;
          background: #18181b;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #6366f1 40%, #a78bfa 100%);
          border-radius: 8px;
          transition: background 0.2s;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #818cf8 0%, #c4b5fd 100%);
        }
      `}</style>
    </div>
  );
};

// Yeni CurrentStockContent bileşeni - Mevcut Stoklar için
function CurrentStockContent() {
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [selectedDuration, setSelectedDuration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockList, setStockList] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [addingStock, setAddingStock] = useState(false);
  const [newStockValue, setNewStockValue] = useState('');
  const [stockType, setStockType] = useState<'single' | 'multiple'>('single');

  useEffect(() => {
    setLoading(true);
    fetch('/api/packages')
      .then(res => res.json())
      .then(data => setPackages(data))
      .catch(() => setError('Paketler yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedPackage && selectedDuration) {
      setStockList(selectedDuration.stockList || []);
    } else {
      setStockList([]);
    }
    setEditingIndex(null);
    setEditValue('');
    setAddingStock(false);
    setNewStockValue('');
  }, [selectedPackage, selectedDuration]);

  const packageOptions = packages.map(pkg => ({
    value: pkg.id,
    label: pkg.name
  }));

  const durationOptions = selectedPackage?.durations?.map((d: any) => ({
    value: d.label,
    label: `${d.label} - ${d.coinPrice} SLC`
  })) || [];

  const handleSaveStock = async (newStockList: string[]) => {
    if (!selectedPackage || !selectedDuration) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/packages/${selectedPackage.id}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          durationLabel: selectedDuration.label, 
          stockList: newStockList 
        })
      });
      
      if (res.ok) {
        // Paketleri yeniden yükle
        const updatedPackages = await fetch('/api/packages').then(r => r.json());
        setPackages(updatedPackages);
        
        // Seçili paketi güncelle
        const updatedPackage = updatedPackages.find((p: any) => p.id === selectedPackage.id);
        if (updatedPackage) {
          setSelectedPackage(updatedPackage);
          const updatedDuration = updatedPackage.durations.find((d: any) => d.label === selectedDuration.label);
          if (updatedDuration) {
            setSelectedDuration(updatedDuration);
            setStockList(updatedDuration.stockList || []);
          }
        }
        setError(null);
      } else {
        setError('Stok güncellenemedi.');
      }
    } catch {
      setError('Stok güncellenemedi.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditStock = (index: number) => {
    setEditingIndex(index);
    setEditValue(stockList[index]);
  };

  const handleSaveEdit = async () => {
    if (editingIndex !== null && editValue.trim()) {
      const newStockList = [...stockList];
      newStockList[editingIndex] = editValue.trim();
      setStockList(newStockList);
      setEditingIndex(null);
      setEditValue('');
      // Otomatik kaydet
      await handleSaveStock(newStockList);
    }
  };

  const handleDeleteStock = async (index: number) => {
    const newStockList = stockList.filter((_, i) => i !== index);
    setStockList(newStockList);
    // Otomatik kaydet
    await handleSaveStock(newStockList);
  };

  const handleAddStock = () => {
    setAddingStock(true);
    setNewStockValue('');
  };

  const handleSaveNewStock = async () => {
    if (!newStockValue.trim()) return;

    let newStocks: string[] = [];
    
    if (stockType === 'single') {
      // Tek stok - birden fazla satır olsa bile tek stok olarak kaydet
      newStocks = [...stockList, newStockValue.trim()];
    } else {
      // Çoklu satır - her satırı ayrı stok olarak ekle
      const lines = newStockValue.split('\n').filter(line => line.trim());
      newStocks = [...stockList, ...lines];
    }

    setStockList(newStocks);
    setAddingStock(false);
    setNewStockValue('');
    // Otomatik kaydet
    await handleSaveStock(newStocks);
  };

  const handleCancelAdd = () => {
    setAddingStock(false);
    setNewStockValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingIndex !== null) {
        handleSaveEdit();
      } else if (addingStock) {
        handleSaveNewStock();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900/70 to-black/70 p-8 rounded-2xl border border-gray-800/40 backdrop-blur-sm shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <RiStore2Line className="text-white" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Mevcut Stoklar</h2>
            <p className="text-gray-400 text-sm">Ürün ve süre seçerek stokları görüntüleyin ve düzenleyin</p>
          </div>
        </div>

        {/* Dropdown Seçimleri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-300 mb-3 font-medium text-sm">Ürün Seçin</label>
            <Select
              options={packageOptions}
              value={selectedPackage ? { value: selectedPackage.id, label: selectedPackage.name } : null}
              onChange={(option) => {
                const selectedPkg = packages.find((p: any) => p.id === option?.value);
                setSelectedPackage(selectedPkg || null);
                setSelectedDuration(null);
              }}
              placeholder="Ürün seçin..."
              isSearchable
              classNamePrefix="react-select"
              styles={{
                control: (base, state) => ({
                  ...base,
                  background: 'rgba(35, 39, 51, 0.6)',
                  borderColor: state.isFocused ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  minHeight: '46px',
                  color: 'white',
                  boxShadow: state.isFocused ? '0 0 0 1px rgba(99, 102, 241, 0.2)' : 'none',
                  borderWidth: '1px',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    background: 'rgba(35, 39, 51, 0.7)',
                  }
                }),
                menu: (base) => ({
                  ...base,
                  background: 'rgba(35, 39, 51, 0.98)',
                  borderRadius: '10px',
                  color: 'white',
                  zIndex: 50,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
                  backdropFilter: 'blur(12px)',
                  marginTop: '3px',
                }),
                option: (base, state) => ({
                  ...base,
                  background: state.isSelected 
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.6), rgba(139, 92, 246, 0.6))' 
                    : state.isFocused 
                    ? 'rgba(255, 255, 255, 0.03)' 
                    : 'transparent',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: state.isSelected ? '400' : '300',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    background: state.isSelected 
                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.7), rgba(139, 92, 246, 0.7))' 
                      : 'rgba(255, 255, 255, 0.06)',
                  }
                }),
                singleValue: (base) => ({ 
                  ...base, 
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '400'
                }),
                input: (base) => ({ 
                  ...base, 
                  color: 'white',
                  fontSize: '12px'
                }),
                placeholder: (base) => ({ 
                  ...base, 
                  color: 'rgba(156, 163, 175, 0.7)',
                  fontSize: '12px'
                }),
                indicatorSeparator: (base) => ({
                  ...base,
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                }),
                dropdownIndicator: (base, state) => ({
                  ...base,
                  color: state.isFocused ? 'rgba(99, 102, 241, 0.7)' : 'rgba(156, 163, 175, 0.5)',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    color: 'rgba(99, 102, 241, 0.7)',
                  }
                }),
                clearIndicator: (base) => ({
                  ...base,
                  color: 'rgba(156, 163, 175, 0.5)',
                  '&:hover': {
                    color: 'rgba(239, 68, 68, 0.7)',
                  }
                }),
                multiValue: (base) => ({
                  ...base,
                  background: 'rgba(99, 102, 241, 0.15)',
                  borderRadius: '6px',
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: 'white',
                  fontSize: '11px',
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': {
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: 'rgba(239, 68, 68, 0.7)',
                  }
                }),
              }}
              theme={(theme) => ({
                ...theme,
                borderRadius: 10,
                colors: {
                  ...theme.colors,
                  primary25: 'rgba(99, 102, 241, 0.08)',
                  primary50: 'rgba(99, 102, 241, 0.15)',
                  primary: '#6366f1',
                  neutral0: 'rgba(35, 39, 51, 0.6)',
                  neutral5: 'rgba(255, 255, 255, 0.03)',
                  neutral10: 'rgba(255, 255, 255, 0.06)',
                  neutral20: 'rgba(255, 255, 255, 0.08)',
                  neutral30: 'rgba(255, 255, 255, 0.12)',
                  neutral40: 'rgba(255, 255, 255, 0.16)',
                  neutral50: 'rgba(255, 255, 255, 0.24)',
                  neutral60: 'rgba(255, 255, 255, 0.32)',
                  neutral70: 'rgba(255, 255, 255, 0.4)',
                  neutral80: 'rgba(255, 255, 255, 0.48)',
                  neutral90: 'rgba(255, 255, 255, 0.56)',
                },
              })}
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-3 font-medium text-sm">Süre Seçin</label>
            <Select
              options={durationOptions}
              value={selectedDuration ? { value: selectedDuration.label, label: `${selectedDuration.label} - ${selectedDuration.coinPrice} SLC` } : null}
              onChange={(option) => {
                const selectedDur = selectedPackage?.durations.find((d: any) => d.label === option?.value);
                setSelectedDuration(selectedDur || null);
              }}
              placeholder="Süre seçin..."
              isDisabled={!selectedPackage}
              isSearchable
              classNamePrefix="react-select"
              styles={{
                control: (base, state) => ({
                  ...base,
                  background: !selectedPackage ? 'rgba(35, 39, 51, 0.3)' : 'rgba(35, 39, 51, 0.6)',
                  borderColor: state.isFocused ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  minHeight: '46px',
                  color: 'white',
                  boxShadow: state.isFocused ? '0 0 0 1px rgba(99, 102, 241, 0.2)' : 'none',
                  borderWidth: '1px',
                  transition: 'all 0.15s ease',
                  opacity: !selectedPackage ? 0.5 : 1,
                  '&:hover': {
                    borderColor: selectedPackage ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                    background: selectedPackage ? 'rgba(35, 39, 51, 0.7)' : 'rgba(35, 39, 51, 0.3)',
                  }
                }),
                menu: (base) => ({
                  ...base,
                  background: 'rgba(35, 39, 51, 0.98)',
                  borderRadius: '10px',
                  color: 'white',
                  zIndex: 50,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
                  backdropFilter: 'blur(12px)',
                  marginTop: '3px',
                }),
                option: (base, state) => ({
                  ...base,
                  background: state.isSelected 
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.6), rgba(139, 92, 246, 0.6))' 
                    : state.isFocused 
                    ? 'rgba(255, 255, 255, 0.03)' 
                    : 'transparent',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: state.isSelected ? '400' : '300',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    background: state.isSelected 
                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.7), rgba(139, 92, 246, 0.7))' 
                      : 'rgba(255, 255, 255, 0.06)',
                  }
                }),
                singleValue: (base) => ({ 
                  ...base, 
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '400'
                }),
                input: (base) => ({ 
                  ...base, 
                  color: 'white',
                  fontSize: '12px'
                }),
                placeholder: (base) => ({ 
                  ...base, 
                  color: 'rgba(156, 163, 175, 0.7)',
                  fontSize: '12px'
                }),
                indicatorSeparator: (base) => ({
                  ...base,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }),
                dropdownIndicator: (base, state) => ({
                  ...base,
                  color: state.isFocused ? 'rgba(99, 102, 241, 0.8)' : 'rgba(156, 163, 175, 0.6)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'rgba(99, 102, 241, 0.8)',
                  }
                }),
                clearIndicator: (base) => ({
                  ...base,
                  color: 'rgba(156, 163, 175, 0.6)',
                  '&:hover': {
                    color: 'rgba(239, 68, 68, 0.8)',
                  }
                }),
                multiValue: (base) => ({
                  ...base,
                  background: 'rgba(99, 102, 241, 0.2)',
                  borderRadius: '8px',
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: 'white',
                  fontSize: '12px',
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: 'rgba(255, 255, 255, 0.6)',
                  '&:hover': {
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: 'rgba(239, 68, 68, 0.8)',
                  }
                }),
              }}
              theme={(theme) => ({
                ...theme,
                borderRadius: 12,
                colors: {
                  ...theme.colors,
                  primary25: 'rgba(99, 102, 241, 0.1)',
                  primary50: 'rgba(99, 102, 241, 0.2)',
                  primary: '#6366f1',
                  neutral0: 'rgba(35, 39, 51, 0.8)',
                  neutral5: 'rgba(255, 255, 255, 0.05)',
                  neutral10: 'rgba(255, 255, 255, 0.1)',
                  neutral20: 'rgba(255, 255, 255, 0.2)',
                  neutral30: 'rgba(255, 255, 255, 0.3)',
                  neutral40: 'rgba(255, 255, 255, 0.4)',
                  neutral50: 'rgba(255, 255, 255, 0.5)',
                  neutral60: 'rgba(255, 255, 255, 0.6)',
                  neutral70: 'rgba(255, 255, 255, 0.7)',
                  neutral80: 'rgba(255, 255, 255, 0.8)',
                  neutral90: 'rgba(255, 255, 255, 0.9)',
                },
              })}
            />
          </div>
        </div>

        {/* Stok Listesi */}
        {selectedPackage && selectedDuration && (
          <div className="bg-gradient-to-br from-gray-900/70 to-black/70 p-8 rounded-2xl border border-gray-800/40 backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {selectedPackage.name} - {selectedDuration.label}
                </h3>
                <p className="text-gray-400">
                  Toplam {stockList.length} stok • {selectedDuration.coinPrice} SLC
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddStock}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <RiAddLine size={16} />
                  Stok Ekle
                </button>
              </div>
            </div>

            {/* Stok Ekleme Alanı */}
            {addingStock && (
              <div className="mb-6 p-4 bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/40">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium">Yeni Stok Ekle</h4>
                  <select
                    value={stockType}
                    onChange={(e) => setStockType(e.target.value as 'single' | 'multiple')}
                    className="px-4 py-2 bg-[#181A20] text-white border border-[#232733] rounded-xl text-sm focus:border-blue-500/70 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all duration-200 hover:border-blue-600/60 cursor-pointer appearance-none shadow-sm"
                    style={{
                      backgroundImage: `url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236366f1' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")`,
                      backgroundPosition: 'right 12px center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '18px',
                      paddingRight: '44px',
                      fontWeight: 500,
                      minWidth: 220,
                    }}
                  >
                    <option value="single" style={{ background: '#232733', color: '#fff' }}>Tek Stok (Çoklu Satır)</option>
                    <option value="multiple" style={{ background: '#232733', color: '#fff' }}>Çoklu Stok (Her Satır Ayrı)</option>
                  </select>
                </div>
                <div className="space-y-3">
                  {stockType === 'single' ? (
                    <div>
                      <textarea
                        value={newStockValue}
                        onChange={(e) => setNewStockValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Stok kodunu girin (birden fazla satır olabilir)..."
                        rows={4}
                        className="w-full px-4 py-2 bg-gray-700/60 text-white border border-gray-600/40 rounded-lg focus:border-blue-500/50 focus:outline-none resize-none"
                        autoFocus
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Birden fazla satır girebilirsiniz, hepsi tek stok olarak kaydedilecek
                      </p>
                    </div>
                  ) : (
                    <div>
                      <textarea
                        value={newStockValue}
                        onChange={(e) => setNewStockValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Her satıra bir stok kodu yazın..."
                        rows={4}
                        className="w-full px-4 py-2 bg-gray-700/60 text-white border border-gray-600/40 rounded-lg focus:border-blue-500/50 focus:outline-none resize-none"
                        autoFocus
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Her satır ayrı stok olarak kaydedilecek
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveNewStock}
                      disabled={!newStockValue.trim() || saving}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <RiCheckLine size={16} />
                          Kaydet
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancelAdd}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              </div>
            )}

            {stockList.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800/60 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RiStore2Line className="text-gray-400" size={32} />
                </div>
                <p className="text-gray-400 text-lg">Bu süre için henüz stok eklenmemiş</p>
                <p className="text-gray-500 text-sm mt-2">"Stok Ekle" butonuna tıklayarak stok ekleyebilirsiniz</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stockList.map((stock, index) => (
                  <div key={index} className="mb-3 bg-gray-800/60 rounded-lg px-4 py-3 flex items-center justify-between">
                    <span className="text-blue-400 font-medium text-sm">Stok #{index + 1}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditStock(index)}
                        className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Düzenle"
                      >
                        <RiEdit2Line size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteStock(index)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        title="Sil"
                      >
                        <RiDeleteBin6Line size={16} />
                      </button>
                    </div>
                    {editingIndex === index && (
                      <div className="space-y-3 mt-2 w-full">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="w-full p-3 bg-gray-700/60 border border-gray-600/40 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none resize"
                          rows={4}
                          placeholder="Stok içeriğini girin..."
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            disabled={!editValue.trim() || saving}
                            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {saving ? 'Kaydediliyor...' : 'Kaydet'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingIndex(null);
                              setEditValue('');
                            }}
                            className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            İptal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!selectedPackage && !loading && (
          <div className="bg-gradient-to-br from-gray-900/70 to-black/70 p-12 rounded-2xl border border-gray-800/40 backdrop-blur-sm shadow-xl text-center">
            <div className="w-20 h-20 bg-gray-800/60 rounded-full flex items-center justify-center mx-auto mb-6">
              <RiStore2Line className="text-gray-400" size={40} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Stok Yönetimi</h3>
            <p className="text-gray-400">Ürün ve süre seçerek stokları görüntüleyin ve düzenleyin</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Modernize edilmiş AdminStockContent
function AdminStockContent() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/packages')
      .then(res => res.json())
      .then(data => setPackages(data))
      .catch(() => setError('Paketler yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-900/70 to-black/70 p-12 rounded-2xl border border-gray-800/40 backdrop-blur-sm shadow-xl text-center">
        <div className="w-20 h-20 bg-gray-800/60 rounded-full flex items-center justify-center mx-auto mb-6">
          <RiFileList3Line className="text-gray-400" size={40} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Paket Bulunamadı</h3>
        <p className="text-gray-400">Henüz hiç paket eklenmemiş</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900/70 to-black/70 p-8 rounded-2xl border border-gray-800/40 backdrop-blur-sm shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <RiCoinLine className="text-white" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Stok Yönetimi</h2>
            <p className="text-gray-400 text-sm">Tüm paketlerin stok durumunu görüntüleyin</p>
          </div>
        </div>
      </div>

      {/* Paket Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map(pkg => (
          <div key={pkg.id} className="bg-gradient-to-br from-gray-900/70 to-black/70 rounded-2xl border border-gray-800/40 p-6 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            <div className="relative mb-4 overflow-hidden rounded-xl">
              <img src={pkg.image} alt={pkg.name} className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                <p className="text-gray-400 text-sm line-clamp-2">{pkg.description}</p>
              </div>

              {pkg.durations && pkg.durations.length > 0 && (
                <div className="space-y-3">
                  {pkg.durations.map((d: any, idx: number) => (
                    <div key={idx} className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/40">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-400 font-semibold">{d.label}</span>
                        <span className="text-yellow-400 font-bold">{d.coinPrice} SLC</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">
                          Stok: <span className="text-green-400 font-bold">{d.stockList?.length || 0}</span>
                        </span>
                        <button
                          onClick={() => window.open(`/helele/stock/add?packageId=${pkg.id}&duration=${encodeURIComponent(d.label)}`, '_blank')}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Stok Ekle
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {pkg.features && pkg.features.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-white font-semibold mb-2">Özellikler:</h4>
                  <ul className="space-y-1">
                    {pkg.features.slice(0, 3).map((f: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2 text-green-400 text-sm">
                        <RiCheckLine size={14} />
                        <span className="text-gray-300">{f}</span>
                      </li>
                    ))}
                    {pkg.features.length > 3 && (
                      <li className="text-gray-500 text-sm">+{pkg.features.length - 3} özellik daha</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Kılavuzlar Bileşeni
const GuidesContent = () => {
  const [guides, setGuides] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    packageId: '',
    title: '',
    description: '',
    link: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuides();
    fetchPackages();
  }, []);

  const fetchGuides = async () => {
    try {
      const response = await fetch('/api/guides');
      const data = await response.json();
      setGuides(data);
    } catch (error) {
      console.error('Error fetching guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/packages');
      const data = await response.json();
      setPackages(data);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedPackage = packages.find(p => p.id === formData.packageId);
      const response = await fetch('/api/guides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          packageName: selectedPackage?.name || ''
        }),
      });

      if (response.ok) {
        setShowAddModal(false);
        setFormData({ packageId: '', title: '', description: '', link: '' });
        fetchGuides();
      }
    } catch (error) {
      console.error('Error adding guide:', error);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuide) return;

    try {
      const response = await fetch('/api/guides', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedGuide.id,
          ...formData
        }),
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedGuide(null);
        setFormData({ packageId: '', title: '', description: '', link: '' });
        fetchGuides();
      }
    } catch (error) {
      console.error('Error updating guide:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kılavuzu silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch('/api/guides', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        fetchGuides();
      }
    } catch (error) {
      console.error('Error deleting guide:', error);
    }
  };

  const openEditModal = (guide: any) => {
    setSelectedGuide(guide);
    setFormData({
      packageId: guide.packageId,
      title: guide.title,
      description: guide.description,
      link: guide.link
    });
    setShowEditModal(true);
  };

  const packageOptions = packages.map(pkg => ({
    value: pkg.id,
    label: pkg.name
  }));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Kılavuz Yönetimi</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500/80 hover:bg-blue-600/90 px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <RiAddLine />
          <span>Yeni Kılavuz</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-400">Yükleniyor...</div>
      ) : (
        <div className="grid gap-4">
          {guides.map((guide) => (
            <motion.div
              key={guide.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 p-6 rounded-xl border border-white/10"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-white">{guide.title}</h3>
                  <p className="text-gray-400 mb-2">{guide.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-blue-400">Paket: {guide.packageName}</span>
                    <a 
                      href={guide.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300"
                    >
                      Linki Görüntüle
                    </a>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {new Date(guide.createdAt).toLocaleString('tr-TR')}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(guide)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <RiEdit2Line size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(guide.id)}
                    className="p-2 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors"
                  >
                    <RiDeleteBin6Line size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#1A1A1A] rounded-xl p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold mb-4">Yeni Kılavuz</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Paket</label>
                  <Select
                    options={packageOptions}
                    value={packageOptions.find(opt => opt.value === formData.packageId) || null}
                    onChange={opt => setFormData({ ...formData, packageId: opt?.value || '' })}
                    placeholder="Paket seçin"
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: '#18181b',
                        color: '#fff',
                        borderColor: '#222',
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: '#18181b',
                        color: '#fff',
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: '#fff',
                      }),
                      option: (base, state) => ({
                        ...base,
                        background: state.isSelected 
                          ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.6), rgba(139, 92, 246, 0.6))' 
                          : state.isFocused 
                          ? 'rgba(255, 255, 255, 0.03)' 
                          : 'transparent',
                        color: 'white',
                        cursor: 'pointer',
                        padding: '8px 12px',
                        fontSize: '12px',
                        fontWeight: state.isSelected ? '400' : '300',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          background: state.isSelected 
                            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.7), rgba(139, 92, 246, 0.7))' 
                            : 'rgba(255, 255, 255, 0.06)',
                        }
                      }),
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Başlık</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Açıklama</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 h-32"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Link</label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                    placeholder="https://..."
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-500/80 hover:bg-blue-600/90"
                  >
                    Ekle
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#1A1A1A] rounded-xl p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold mb-4">Kılavuz Düzenle</h2>
              <form onSubmit={handleEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Paket</label>
                  <Select
                    options={packageOptions}
                    value={packageOptions.find(opt => opt.value === formData.packageId) || null}
                    onChange={opt => setFormData({ ...formData, packageId: opt?.value || '' })}
                    placeholder="Paket seçin"
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: '#18181b',
                        color: '#fff',
                        borderColor: '#222',
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: '#18181b',
                        color: '#fff',
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: '#fff',
                      }),
                      option: (base, state) => ({
                        ...base,
                        background: state.isSelected 
                          ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.6), rgba(139, 92, 246, 0.6))' 
                          : state.isFocused 
                          ? 'rgba(255, 255, 255, 0.03)' 
                          : 'transparent',
                        color: 'white',
                        cursor: 'pointer',
                        padding: '8px 12px',
                        fontSize: '12px',
                        fontWeight: state.isSelected ? '400' : '300',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          background: state.isSelected 
                            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.7), rgba(139, 92, 246, 0.7))' 
                            : 'rgba(255, 255, 255, 0.06)',
                        }
                      }),
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Başlık</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Açıklama</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 h-32"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Link</label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                    placeholder="https://..."
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-500/80 hover:bg-blue-600/90"
                  >
                    Güncelle
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};