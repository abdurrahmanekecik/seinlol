import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PaymentError() {
    const router = useRouter();
    const { message } = router.query;

    useEffect(() => {
        // 10 saniye sonra ana sayfaya yönlendir
        const timeout = setTimeout(() => {
            router.push('/');
        }, 10000);

        return () => clearTimeout(timeout);
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                        <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="mt-4 text-2xl font-semibold text-gray-900">Ödeme Başarısız</h2>
                    <p className="mt-2 text-gray-600">
                        {message || 'Ödeme işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.'}
                    </p>
                    <p className="mt-4 text-sm text-gray-500">
                        10 saniye içinde ana sayfaya yönlendirileceksiniz...
                    </p>
                    <div className="mt-6 space-y-2">
                        <button
                            onClick={() => router.push('/')}
                            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Ana Sayfaya Dön
                        </button>
                        <button
                            onClick={() => router.back()}
                            className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Tekrar Dene
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 