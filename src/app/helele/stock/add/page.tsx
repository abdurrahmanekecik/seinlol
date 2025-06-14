'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AddStockPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Yükleniyor...</div>}>
      <AddStockPage />
    </Suspense>
  );
}

function AddStockPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  if (!searchParams) {
    return <div className="min-h-screen flex items-center justify-center text-red-400">Arama parametreleri bulunamadı.</div>;
  }
  const packageId = searchParams.get('packageId');
  const durationLabel = searchParams.get('duration');

  const [pkg, setPkg] = useState<any>(null);
  const [duration, setDuration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [stockText, setStockText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stockList, setStockList] = useState<string[]>([]);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [editLoading, setEditLoading] = useState<number | null>(null);

  // Fetch package and duration info
  useEffect(() => {
    if (!packageId) return;
    setLoading(true);
    fetch('/api/packages')
      .then(res => res.json())
      .then(data => {
        const found = data.find((p: any) => p.id === packageId);
        setPkg(found || null);
        if (found && found.durations) {
          const dur = found.durations.find((d: any) => d.label === durationLabel);
          setDuration(dur || null);
          setStockList(dur && dur.stockList ? dur.stockList : []);
        }
      })
      .catch(() => setError('Paket yüklenemedi.'))
      .finally(() => setLoading(false));
  }, [packageId, durationLabel, success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const trimmed = stockText.trim();
      if (trimmed.length === 0) {
        setError('Stok metni boş olamaz.');
        setSubmitting(false);
        return;
      }
      const newStockList = [...stockList, stockText];
      const res = await fetch(`/api/packages/${packageId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationLabel, stockList: newStockList })
      });
      if (res.ok) {
        setSuccess(true);
        setStockText('');
        setStockList(newStockList);
        setTimeout(() => router.refresh(), 500);
      } else {
        setError('Stok eklenemedi.');
      }
    } catch {
      setError('Stok eklenemedi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (idx: number) => {
    setDeleteLoading(idx);
    setError(null);
    try {
      const newStockList = stockList.filter((_, i) => i !== idx);
      const res = await fetch(`/api/packages/${packageId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationLabel, stockList: newStockList })
      });
      if (res.ok) {
        setStockList(newStockList);
        setDeleteLoading(null);
      } else {
        setError('Stok silinemedi.');
      }
    } catch {
      setError('Stok silinemedi.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (idx: number) => {
    setEditIdx(idx);
    setEditValue(stockList[idx]);
  };

  const handleEditSave = async (idx: number) => {
    setEditLoading(idx);
    setError(null);
    try {
      const newStockList = stockList.map((item, i) => i === idx ? editValue : item);
      const res = await fetch(`/api/packages/${packageId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationLabel, stockList: newStockList })
      });
      if (res.ok) {
        setStockList(newStockList);
        setEditIdx(null);
        setEditValue('');
      } else {
        setError('Stok güncellenemedi.');
      }
    } catch {
      setError('Stok güncellenemedi.');
    } finally {
      setEditLoading(null);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Yükleniyor...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-400">{error}</div>;
  if (!pkg || !duration) return <div className="min-h-screen flex items-center justify-center text-gray-400">Paket veya süre bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#181A20] flex flex-col items-center justify-center py-6">
      <div className="w-full max-w-6xl bg-[#181A20] rounded-2xl shadow-xl border border-white/10 p-0 md:p-12 flex flex-col md:flex-row gap-0 md:gap-12 overflow-hidden">
        {/* Sol: Stok formu */}
        <div className="flex-1 p-6 bg-[#181A20] flex flex-col justify-center min-h-[500px]">
          <h1 className="text-4xl font-extrabold text-white mb-4 text-left tracking-tight leading-tight">Stok Ekle</h1>
          <div className="mb-4">
            <div className="flex items-center gap-4 mb-2">
              <img src={pkg.image} alt={pkg.name} className="w-16 h-16 object-cover rounded-2xl border border-white/10 shadow-lg" />
              <div>
                <div className="text-2xl font-bold text-white leading-tight">{pkg.name}</div>
                <div className="text-blue-400 font-semibold text-lg">{durationLabel}</div>
              </div>
            </div>
            <div className="text-gray-400 mb-1 text-lg max-w-xl">{pkg.description}</div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-gray-400 mb-2 font-semibold text-lg">Stok (çok satırlı metin girebilirsiniz)</label>
              <textarea
                className="w-full p-6 rounded-2xl bg-[#232733] text-white border border-white/10 min-h-[180px] text-xl focus:ring-2 focus:ring-blue-500/30 transition-all placeholder:text-gray-500"
                value={stockText}
                onChange={e => setStockText(e.target.value)}
                placeholder={"Stok metninizi girin..."}
                disabled={submitting}
              />
            </div>
            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center text-lg animate-pulse">{error}</div>}
            {success && <div className="text-green-400 text-sm animate-fade-in mb-1 mt-2 text-left">Stok başarıyla eklendi!</div>}
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white font-bold rounded-2xl shadow-xl text-base transition-all duration-200 tracking-wide hover:bg-blue-700 active:scale-100 mt-4 border border-blue-700/20 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              disabled={submitting}
            >
              {submitting ? 'Kaydediliyor...' : 'Stok Kaydet'}
            </button>
          </form>
        </div>
        {/* Sağ: Stok listesi */}
        <div className="flex-1 p-4 bg-[#20232B] border-l border-white/5 flex flex-col min-h-[400px]">
          <h2 className="text-xl font-bold text-white mb-4 text-left tracking-tight leading-tight">Mevcut Stoklar</h2>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {(!stockList || stockList.length === 0) ? (
              <div className="text-gray-400 text-center mt-24 text-2xl opacity-70 select-none">Hiç stok yok.</div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {stockList.slice().reverse().map((stock, idx) => {
                  const realIdx = stockList.length - 1 - idx;
                  return (
                    <div key={realIdx} className="bg-gradient-to-br from-[#232733] to-[#232733]/80 rounded-xl p-3 text-white border border-white/10 shadow transition-transform hover:scale-[1.01] flex flex-col gap-2 animate-fade-in">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-400 font-semibold">Stok #{realIdx + 1}</span>
                        <div className="ml-auto flex gap-1">
                          {editIdx === realIdx ? (
                            <>
                              <button
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-xs shadow"
                                onClick={() => handleEditSave(realIdx)}
                                disabled={editLoading === realIdx}
                              >Kaydet</button>
                              <button
                                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded font-bold text-xs shadow"
                                onClick={() => { setEditIdx(null); setEditValue(''); }}
                              >İptal</button>
                            </>
                          ) : (
                            <>
                              <button
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs shadow"
                                onClick={() => handleEdit(realIdx)}
                              >Düzenle</button>
                              <button
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-xs shadow"
                                onClick={() => handleDelete(realIdx)}
                                disabled={deleteLoading === realIdx}
                              >Sil</button>
                            </>
                          )}
                        </div>
                      </div>
                      {editIdx === realIdx ? (
                        <textarea
                          className="w-full p-2 rounded bg-[#181A20] text-white border border-white/10 min-h-[40px] text-sm focus:ring-2 focus:ring-blue-500/30 transition-all"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          disabled={editLoading === realIdx}
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #232733;
          border-radius: 8px;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s;
        }
      `}</style>
    </div>
  );
} 