import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

const PAYTR_MERCHANT_KEY = '8GeGiSeqScRe65jG';
const PAYTR_MERCHANT_SALT = 'tNX59neA7ZiAZaG3';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        console.log('PayTR callback alındı:', req.body);

        const {
            merchant_oid,
            status,
            total_amount,
            hash,
            failed_reason_code,
            failed_reason_msg
        } = req.body;

        // Hash doğrulama
        const hashStr = `${merchant_oid}${PAYTR_MERCHANT_SALT}${status}${total_amount}`;
        const calculatedHash = crypto
            .createHmac('sha256', PAYTR_MERCHANT_KEY)
            .update(hashStr)
            .digest('base64');

        if (hash !== calculatedHash) {
            console.error('Hash doğrulama hatası:', {
                received: hash,
                calculated: calculatedHash
            });
            return res.status(400).json({ status: 'fail', message: 'Geçersiz hash' });
        }

        console.log('Ödeme durumu:', {
            merchant_oid,
            status,
            total_amount
        });

        if (status === 'success') {
            try {
                // Kullanıcıya otomatik Customer rolü ata
                const assignRole = async () => {
                    try {
                        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/users`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ userId: req.body.user_id, role: 'customer' }), // Assuming user_id is available in the callback body
                        });
                        if (!userResponse.ok) {
                            console.error('Failed to assign customer role:', userResponse.statusText);
                        }
                    } catch (roleError) {
                        console.error('Error assigning customer role:', roleError);
                    }
                };

                // Rol atama işlemini beklemeksizin devam et
                assignRole();

                // Discord bot API'sine bildirim gönder
                const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/discord/notify/purchase`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        orderId: merchant_oid,
                        amount: total_amount / 100, // Kuruştan TL'ye çevir
                        status: 'success'
                    })
                });

                if (!response.ok) {
                    console.error('Discord bildirimi hatası:', await response.text());
                    throw new Error('Discord bildirimi gönderilemedi');
                }

                return res.status(200).json({ status: 'OK' });
            } catch (error) {
                console.error('Discord bildirim hatası:', error);
                // Discord bildirimi başarısız olsa bile ödemeyi başarılı sayıyoruz
                return res.status(200).json({ status: 'OK' });
            }
        } else {
            console.error('Ödeme başarısız:', {
                code: failed_reason_code,
                message: failed_reason_msg
            });
            return res.status(200).json({ status: 'OK' });
        }
    } catch (error) {
        console.error('PayTR callback hatası:', error);
        return res.status(500).json({ status: 'fail', message: 'İşlem hatası' });
    }
} 