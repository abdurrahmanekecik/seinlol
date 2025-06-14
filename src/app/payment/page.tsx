'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import PaymentForm from '@/components/PaymentForm';

export default function PaymentPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">Yükleniyor...</div>}>
      <PaymentPage />
    </Suspense>
  );
}

function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  if (!searchParams) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="bg-red-500/10 p-4 rounded-xl text-red-400">
          Geçersiz ödeme bilgileri
        </div>
      </div>
    );
  }

  const amount = Number(searchParams.get('amount'));
  const currency = searchParams.get('currency') || 'TL';
  const productId = Number(searchParams.get('productId'));
  const productName = searchParams.get('productName') || '';

  if (!amount || !productId || !productName) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="bg-red-500/10 p-4 rounded-xl text-red-400">
          Geçersiz ödeme bilgileri
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <PaymentForm
        amount={amount}
        currency={currency}
        productId={productId}
        productName={decodeURIComponent(productName)}
      />
    </div>
  );
} 