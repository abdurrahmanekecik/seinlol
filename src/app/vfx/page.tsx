'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import admins from '@/data/helele.json';

export default function AdminAccessControl() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showMessage, setShowMessage] = useState<'unauthorized' | 'authorized' | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/');
      return;
    }

    // Admin kontrolü ve mesaj gösterimi
    if (session.user?.id && admins.adminIds.includes(session.user.id)) {
      setShowMessage('authorized');
      setTimeout(() => {
        router.push('/helele');
      }, 3000);
    } else {
      setShowMessage('unauthorized');
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    }
  }, [session, status, router]);

  // Yükleniyor durumu
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Yetkisiz erişim mesajı
  if (showMessage === 'unauthorized') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gradient-to-br from-red-500/10 to-red-500/5 p-8 rounded-2xl border border-red-500/10 backdrop-blur-sm max-w-md w-full mx-4 text-center"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Yetkisiz Erişim</h3>
          <p className="text-gray-300 mb-4">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
          <div className="text-sm text-gray-400">
            3 saniye içinde ana sayfaya yönlendiriliyorsunuz...
          </div>
        </motion.div>
      </div>
    );
  }

  // Yetkili erişim mesajı
  if (showMessage === 'authorized') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gradient-to-br from-green-500/10 to-green-500/5 p-8 rounded-2xl border border-green-500/10 backdrop-blur-sm max-w-md w-full mx-4 text-center"
        >
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Erişim Başarılı</h3>
          <p className="text-gray-300 mb-4">Yönetici paneline erişim sağlandı.</p>
          <div className="text-sm text-gray-400">
            3 saniye içinde yönetici paneline yönlendiriliyorsunuz...
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
} 