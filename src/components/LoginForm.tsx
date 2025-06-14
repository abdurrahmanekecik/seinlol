import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

const LoginForm = ({ onSwitchToRegister }: { onSwitchToRegister?: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Lütfen kullanıcı adı ve şifrenizi girin.');
      return;
    }
    try {
      setLoading(true);
      const result = await signIn('credentials', {
        redirect: false,
        username,
        password,
      });
      if (result?.error) {
        throw new Error('Kullanıcı adı veya şifre hatalı.');
      }
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4 text-sm text-center">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-gray-300 mb-1 text-sm">
            Kullanıcı Adı
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 rounded bg-[#181A20] text-white border border-gray-700 focus:border-blue-500 focus:outline-none text-sm"
            placeholder="Kullanıcı adınız"
            autoComplete="username"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-gray-300 mb-1 text-sm">
            Şifre
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded bg-[#181A20] text-white border border-gray-700 focus:border-blue-500 focus:outline-none text-sm"
            placeholder="Şifreniz"
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition duration-200 disabled:opacity-50 text-sm"
        >
          {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>
      <div className="mt-3 text-center text-gray-400 text-sm">
        Hesabınız yok mu?{' '}
        <button 
          onClick={onSwitchToRegister}
          className="text-blue-400 hover:underline"
        >
          Kayıt Ol
        </button>
      </div>
    </>
  );
};

export default LoginForm;
