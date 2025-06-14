import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

// PayTR API bilgileri
const PAYTR_MERCHANT_ID = '575322';  // PayTR'dan alınan mağaza ID'si
const PAYTR_MERCHANT_KEY = '8GeGiSeqScRe65jG'; // PayTR'dan alınan mağaza anahtarı
const PAYTR_MERCHANT_SALT = 'tNX59neA7ZiAZaG3'; // PayTR'dan alınan mağaza salt

interface PayTRRequestData {
    amount: number;
    currency: string;
    productName: string;
    user: {
        id: string;
        email: string;
        name: string;
        address: string;
        phone: string;
    };
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false,
            message: 'Method not allowed' 
        });
    }

    try {
        const { amount, productName, user }: PayTRRequestData = req.body;

        // Validate required fields
        if (!amount || !productName || !user) {
            return res.status(400).json({
                success: false,
                message: 'Eksik ödeme bilgileri'
            });
        }

        // Validate user data
        if (!user.email || !user.name || !user.address || !user.phone) {
            return res.status(400).json({
                success: false,
                message: 'Eksik kullanıcı bilgileri'
            });
        }

        // Benzersiz sipariş ID'si oluştur - sadece alfanumerik karakterler
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 10).replace(/[^a-zA-Z0-9]/g, '');
        const merchantOid = `ORDER${timestamp}${randomStr}`;
        
        // PayTR için gerekli parametreleri hazırla
        const params = {
            merchant_id: PAYTR_MERCHANT_ID,
            user_ip: req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || '127.0.0.1',
            merchant_oid: merchantOid,
            email: user.email,
            payment_amount: Math.round(amount * 100), // PayTR kuruş cinsinden bekliyor
            currency: "TL",
            user_basket: JSON.stringify([[productName, amount, 1]]),
            debug_on: 1,
            test_mode: 1,
            no_installment: 0,
            max_installment: 12,
            user_name: user.name,
            user_address: user.address,
            user_phone: user.phone,
            merchant_ok_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`,
            merchant_fail_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/error`,
            timeout_limit: 30,
            lang: "tr",
            paytr_token: ''
        };

        // Token için string oluştur
        const hashStr = `${PAYTR_MERCHANT_ID}${params.user_ip}${params.merchant_oid}${params.email}${params.payment_amount}${params.user_basket}${params.no_installment}${params.max_installment}${params.currency}${params.test_mode}`;
        
        // Token oluştur
        const paytrToken = crypto
            .createHmac('sha256', PAYTR_MERCHANT_KEY)
            .update(hashStr + PAYTR_MERCHANT_SALT)
            .digest('base64');

        params.paytr_token = paytrToken;

        console.log('PayTR isteği hazırlandı:', {
            merchantOid,
            amount: params.payment_amount,
            email: params.email,
            testMode: params.test_mode,
            hashStr, // Hash string'i debug için logluyoruz
            paytrToken // Oluşturulan token'ı debug için logluyoruz
        });

        // PayTR API'ye istek gönder
        const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(params as any).toString()
        });

        const responseData = await response.json();
        console.log('PayTR API yanıt:', responseData);

        if (responseData.status === 'success') {
            return res.status(200).json({
                success: true,
                token: responseData.token,
                iframeUrl: `https://www.paytr.com/odeme/guvenli/${responseData.token}`
            });
        } else {
            return res.status(400).json({
                success: false,
                message: responseData.reason || 'Ödeme başlatılamadı'
            });
        }
    } catch (error) {
        console.error('PayTR ödeme hatası:', error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Ödeme işlemi sırasında bir hata oluştu'
        });
    }
} 