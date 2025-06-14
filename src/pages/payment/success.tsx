import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PaymentSuccess() {
    const router = useRouter();

    useEffect(() => {
        // 5 saniye sonra ana sayfaya yönlendir
        const timeout = setTimeout(() => {
            router.push('/');
        }, 5000);

        return () => clearTimeout(timeout);
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="mt-4 text-2xl font-semibold text-gray-900">Ödeme Başarılı!</h2>
                    <p className="mt-2 text-gray-600">
                        Ödemeniz başarıyla tamamlandı. SLC coinleriniz hesabınıza eklendi.
                    </p>
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-green-800 text-sm font-medium">
                            🎉 Tebrikler! Artık "Customer" rolüne sahipsiniz.
                        </p>
                        <p className="text-green-700 text-xs mt-1">
                            Bu rol ile özel ayrıcalıklardan yararlanabilirsiniz.
                        </p>
                    </div>
                    <p className="mt-4 text-sm text-gray-500">
                        5 saniye içinde ana sayfaya yönlendirileceksiniz...
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="mt-6 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Ana Sayfaya Dön
                    </button>
                </div>
            </div>
        </div>
    );
} 