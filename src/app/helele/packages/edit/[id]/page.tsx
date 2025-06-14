'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { RiGiftLine, RiImage2Line, RiListCheck2, RiCheckLine, RiTimer2Line, RiAddLine } from 'react-icons/ri';

export default function EditPackagePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState<string[]>(['']);
  const [durations, setDurations] = useState<any[]>([{ label: '', days: '', coinPrice: '' }]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch('/api/packages')
      .then(res => res.json())
      .then(data => {
        const pkg = data.find((p: any) => p.id === id);
        if (!pkg) {
          setError('Paket bulunamadı.');
        } else {
          setName(pkg.name || '');
          setImage(pkg.image || '');
          setDescription(pkg.description || '');
          setFeatures(pkg.features && pkg.features.length > 0 ? pkg.features : ['']);
          setDurations(pkg.durations && pkg.durations.length > 0 ? pkg.durations.map((d: any) => ({
            label: d.label,
            days: d.days,
            coinPrice: d.coinPrice
          })) : [{ label: '', days: '', coinPrice: '' }]);
        }
      })
      .catch(() => setError('Paket yüklenemedi.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleFeatureChange = (idx: number, value: string) => {
    setFeatures(f => {
      const arr = [...f];
      arr[idx] = value;
      return arr;
    });
  };
  const addFeature = () => {
    if (features.length < 15) setFeatures(f => [...f, '']);
  };
  const removeFeature = (idx: number) => {
    setFeatures(f => f.filter((_, i) => i !== idx));
  };

  const handleDurationChange = (idx: number, key: string, value: string) => {
    setDurations(d => {
      const arr = [...d];
      arr[idx] = { ...arr[idx], [key]: value };
      return arr;
    });
  };
  const addDuration = () => {
    setDurations(d => [...d, { label: '', days: '', coinPrice: '' }]);
  };
  const removeDuration = (idx: number) => {
    setDurations(d => d.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const payload = {
        id,
        name,
        image,
        description,
        features: features.filter(f => f.trim() !== ''),
        durations: durations.map(d => ({
          label: d.label,
          days: Number(d.days),
          coinPrice: Number(d.coinPrice)
        })).filter(d => d.label && d.days && d.coinPrice)
      };
      const res = await fetch('/api/packages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/helele?tab=packages'), 1200);
      } else {
        setError('Paket güncellenemedi.');
      }
    } catch (err) {
      setError('Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#101014] via-[#181A20] to-[#181A20] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#101014] via-[#181A20] to-[#181A20] flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400 text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#101014] via-[#181A20] to-[#181A20] flex flex-col py-10">
      <div className="w-full flex flex-row items-start justify-start px-10">
        <form onSubmit={handleSubmit} className="flex flex-row gap-10 w-full max-w-5xl bg-transparent p-0">
          {/* Sol blok: görsel ve temel bilgiler */}
          <div className="flex flex-col gap-5 flex-1 min-w-[280px]">
            <h1 className="text-2xl font-bold text-white mb-2">Paketi Düzenle</h1>
            <label className="block text-gray-300 mb-1 font-semibold flex items-center gap-2"><RiGiftLine /> Paket Adı *</label>
            <input type="text" className="w-full px-3 py-2 rounded bg-[#181A20] text-white border border-[#232733] focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" value={name} onChange={e => setName(e.target.value)} required />
            <label className="block text-gray-300 mb-1 font-semibold flex items-center gap-2 mt-3"><RiImage2Line /> Resim URL *</label>
            <input type="text" className="w-full px-3 py-2 rounded bg-[#181A20] text-white border border-[#232733] focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" value={image} onChange={e => setImage(e.target.value)} required />
            {image && <img src={image} alt="Paket Görseli" className="w-full h-36 object-cover rounded mt-2 border border-blue-500/20 shadow transition-all duration-300" />}
          </div>
          {/* Sağ blok: açıklama, özellikler, süre/fiyat */}
          <div className="flex flex-col gap-5 flex-[2] min-w-[300px]">
            <label className="block text-gray-300 mb-1 font-semibold flex items-center gap-2"><RiListCheck2 /> Açıklama</label>
            <textarea className="w-full px-3 py-2 rounded bg-[#181A20] text-white border border-[#232733] min-h-[60px] focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" value={description} onChange={e => setDescription(e.target.value)} />
            <label className="block text-gray-300 mb-1 font-semibold flex items-center gap-2"><RiCheckLine /> Özellikler <span className="text-xs text-gray-400">(En fazla 15, opsiyonel)</span></label>
            <div className="grid gap-2">
              {features.map((f, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input type="text" className="flex-1 px-2 py-1 rounded bg-[#181A20] text-white border border-[#232733] focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" value={f} onChange={e => handleFeatureChange(idx, e.target.value)} maxLength={100} />
                  <button type="button" className="text-red-400 px-2 text-base hover:text-red-600 transition-colors" onClick={() => removeFeature(idx)} disabled={features.length === 1}>×</button>
                </div>
              ))}
            </div>
            <button type="button" className="flex items-center gap-1 text-blue-400 text-xs mt-1 hover:text-blue-300 transition-colors font-semibold" onClick={addFeature} disabled={features.length >= 15}><RiAddLine /> Özellik Ekle</button>
            <label className="block text-gray-300 mb-1 font-semibold flex items-center gap-2 mt-3"><RiTimer2Line /> Süreler ve Fiyatlar *</label>
            <div className="grid gap-2">
              {durations.map((d, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <input type="text" placeholder="Süre Etiketi (örn. 1 Gün)" className="md:col-span-2 px-2 py-1 rounded bg-[#181A20] text-white border border-[#232733] focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" value={d.label} onChange={e => handleDurationChange(idx, 'label', e.target.value)} required />
                  <input type="number" placeholder="Gün" className="px-2 py-1 rounded bg-[#181A20] text-yellow-400 border border-[#232733] focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" value={d.days} onChange={e => handleDurationChange(idx, 'days', e.target.value)} required />
                  <div className="flex gap-2">
                    <input type="number" placeholder="Coin Fiyatı" className="flex-1 px-2 py-1 rounded bg-[#181A20] text-blue-400 border border-[#232733] focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" value={d.coinPrice} onChange={e => handleDurationChange(idx, 'coinPrice', e.target.value)} required />
                    <button type="button" className="text-red-400 px-2 text-base hover:text-red-600 transition-colors" onClick={() => removeDuration(idx)} disabled={durations.length === 1}>×</button>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" className="flex items-center gap-1 text-blue-400 text-xs mt-1 hover:text-blue-300 transition-colors font-semibold" onClick={addDuration}><RiAddLine /> Süre/Fiyat Ekle</button>
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-center font-semibold shadow text-xs">{error}</div>}
            {success && <div className="p-3 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-center font-semibold shadow text-xs">Paket başarıyla güncellendi!</div>}
            <button type="submit" className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded shadow text-base transition-all duration-200 tracking-wide hover:scale-[1.01] active:scale-100 mt-2" disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Paketi Kaydet'}
            </button>
          </div>
        </form>
      </div>
      <style jsx global>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
} 