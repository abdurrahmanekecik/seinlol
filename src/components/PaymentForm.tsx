import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface PaymentFormProps {
    amount: number;
    currency: string;
    productId: number;
    productName: string;
}

export default function PaymentForm({ amount, currency, productId, productName }: PaymentFormProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [iframeUrl, setIframeUrl] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        phone: '',
        address: '',
        city: '',
    });

    const [errors, setErrors] = useState({
        email: '',
        name: '',
        phone: '',
        address: '',
        city: '',
    });

    useEffect(() => {
        if (session?.user?.email) {
            setFormData(prev => ({
                ...prev,
                email: session.user.email || '',
                name: session.user.name || ''
            }));
        }
    }, [session]);

    const validateForm = () => {
        const newErrors = {
            email: '',
            name: '',
            phone: '',
            address: '',
            city: '',
        };

        // Email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Geçerli bir e-posta adresi giriniz';
        }

        // Name validation
        if (formData.name.length < 3) {
            newErrors.name = 'Ad Soyad en az 3 karakter olmalıdır';
        }

        // Phone validation
        if (!/^\d{10,11}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Geçerli bir telefon numarası giriniz';
        }

        // Address validation
        if (formData.address.length < 10) {
            newErrors.address = 'Adres en az 10 karakter olmalıdır';
        } else if (formData.address.length > 200) {
            newErrors.address = 'Adres en fazla 200 karakter olabilir';
        }

        // City validation
        if (formData.city.length < 2) {
            newErrors.city = 'Geçerli bir şehir giriniz';
        }

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== '');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        // Adres alanı için karakter limiti kontrolü
        if (name === 'address' && value.length > 200) {
            return;
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        setFormData(prev => ({
            ...prev,
            phone: value
        }));
        setErrors(prev => ({
            ...prev,
            phone: ''
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/paytr/create-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount,
                    currency,
                    productName,
                    user: {
                        id: session?.user?.id || 'guest',
                        email: formData.email,
                        name: formData.name,
                        phone: formData.phone.replace(/\D/g, ''),
                        address: `${formData.address}, ${formData.city}`
                    }
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Ödeme işlemi başlatılamadı');
            }

            if (data.success && data.iframeUrl) {
                setIframeUrl(data.iframeUrl);
            } else {
                throw new Error(data.message || 'Ödeme işlemi başlatılamadı');
            }
        } catch (error) {
            setLoading(false);
            const errorMessage = error instanceof Error ? error.message : 'Ödeme işlemi sırasında bir hata oluştu';
            console.error('Ödeme hatası:', errorMessage);
            router.push(`/payment/error?message=${encodeURIComponent(errorMessage)}`);
        }
    };

    if (iframeUrl) {
        return (
            <div className="w-full max-w-[700px] mx-auto bg-[#111111]/40 backdrop-blur-md rounded-2xl shadow-2xl border border-white/5 hover:border-white/10 p-10 flex flex-col items-center justify-between min-h-[700px]" style={{ width: 700, height: 700 }}>
                <h2 className="text-3xl font-bold text-white mb-6 w-full text-center">Ödeme</h2>
                <iframe
                    src={iframeUrl}
                    className="w-full rounded-xl border border-white/10 shadow-lg bg-[#232733]"
                    style={{ minHeight: 500, maxHeight: 600, height: 600, background: '#232733' }}
                    frameBorder="0"
                    allow="payment"
                ></iframe>
                <p className="text-gray-400 text-base mt-6 text-center w-full">Ödeme işleminiz PayTR güvencesiyle gerçekleşecektir.</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-[#0A0A0A]">
            {/* Background Elements */}
            <div className="fixed inset-0">
                {/* Background Image with Opacity and Blur */}
                <div className="absolute inset-0">
                    <img 
                        src="/images/background.png" 
                        alt="YBN:Turkey Forum Background" 
                        className="w-full h-full object-cover opacity-30 blur-sm"
                    />
                </div>
                {/* Çok daha koyu ve opak overlay */}
                <div className="absolute inset-0 bg-[#090909]/95"></div>
            </div>

            {/* Main Content */}
            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-lg mx-auto bg-[#18191C]/95 backdrop-blur-xl rounded-xl shadow-lg border border-white/10 p-8 flex flex-col items-center justify-center" style={{boxShadow: '0 6px 32px 0 rgba(0,0,0,0.18)'}}>
                    <h2 className="text-3xl font-extrabold text-white mb-1 w-full text-center tracking-tight" style={{letterSpacing: '-0.02em'}}>SLC Satın Al</h2>
                    <p className="text-gray-300 mb-7 w-full text-center text-base font-normal">Aşağıdaki bilgileri doldurarak güvenli ödeme adımına geçebilirsiniz.</p>
                    <form onSubmit={handleSubmit} className="space-y-4 w-full">
                        <div className="space-y-2">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full p-3 rounded-lg bg-[#232428]/90 hover:bg-[#232428] text-white border border-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none text-base font-medium shadow-none transition-all duration-200 placeholder-gray-400"
                                placeholder="Ad Soyad"
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full p-3 rounded-lg bg-[#232428]/90 hover:bg-[#232428] text-white border border-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none text-base font-medium shadow-none transition-all duration-200 placeholder-gray-400"
                                placeholder="E-posta"
                                required
                            />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handlePhoneChange}
                                className="w-full p-3 rounded-lg bg-[#232428]/90 hover:bg-[#232428] text-white border border-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none text-base font-medium shadow-none transition-all duration-200 placeholder-gray-400"
                                placeholder="Telefon"
                                required
                            />
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="w-full p-3 rounded-lg bg-[#232428]/90 hover:bg-[#232428] text-white border border-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none text-base font-medium shadow-none transition-all duration-200 placeholder-gray-400"
                                placeholder="Adres "
                                required
                                maxLength={200}
                            />
                            {errors.address && (
                                <p className="text-red-400 text-sm mt-1">{errors.address}</p>
                            )}
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="w-full p-3 rounded-lg bg-[#232428]/90 hover:bg-[#232428] text-white border border-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none text-base font-medium shadow-none transition-all duration-200 placeholder-gray-400"
                                placeholder="Şehir"
                                required
                            />
                        </div>
                        <div className="flex flex-row items-center justify-between gap-2 bg-white/5 rounded-lg p-3 border border-white/10 shadow-sm mt-3 mb-1">
                            <span className="bg-blue-500/10 text-blue-400 rounded-md px-2 py-0.5 font-semibold text-sm flex items-center">{productName}</span>
                            <span className="bg-green-500/10 text-green-400 rounded-md px-2 py-0.5 font-semibold text-sm flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><text x="3" y="17" fontSize="14" fill="currentColor">$</text></svg>
                                {amount} USD
                            </span>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg shadow-sm text-base transition-all duration-200 tracking-wide mt-2 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                                    İşleniyor...
                                </>
                            ) : (
                                <>Ödemeye Geç</>
                            )}
                        </button>
                    </form>
                    <style jsx global>{`
                        input:-webkit-autofill,
                        input:-webkit-autofill:hover,
                        input:-webkit-autofill:focus,
                        textarea:-webkit-autofill,
                        textarea:-webkit-autofill:hover,
                        textarea:-webkit-autofill:focus,
                        select:-webkit-autofill,
                        select:-webkit-autofill:hover,
                        select:-webkit-autofill:focus {
                            -webkit-box-shadow: 0 0 0px 1000px #232323 inset !important;
                            box-shadow: 0 0 0px 1000px #232323 inset !important;
                            -webkit-text-fill-color: #ffffff !important;
                            caret-color: #ffffff !important;
                        }
                    `}</style>
                </div>
            </div>
        </div>
    );
} 