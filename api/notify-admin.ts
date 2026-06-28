import type { VercelRequest, VercelResponse } from '@vercel/node';
import webPush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const VAPID_PUBLIC = 'BHDfKkQjTCeUfu9F513fYt6_Q6s_OA8Fpbh6KMAxnbuqjcyGwrePo17CA2JNj0p4_MSz77-BIoUzhOhRZOVTDY0';
const VAPID_PRIVATE = 'D3K-ZyIs20NtPfAxoj9r5Z-e6phFLi1Dp1daTDX7-QU';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webPush.setVapidDetails(
    'mailto:contact@mom-50.vercel.app',
    VAPID_PUBLIC,
    VAPID_PRIVATE
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sender } = req.body;

  try {
    // Only fetch subscriptions for Ayala
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_name', 'אילה');

    if (error) throw error;
    if (!subscriptions || subscriptions.length === 0) {
      return res.status(200).json({ success: true, message: 'No subscriptions found for admin' });
    }

    const notificationPayload = JSON.stringify({
      title: 'ברכה ממתינה לאישור! 📝',
      body: `ברכה חדשה מאת ${sender} ממתינה לאישור שלך במערכת`,
      icon: '/icon-192.png',
      data: {
        url: '/'
      }
    });

    const sendPromises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };

      try {
        await webPush.sendNotification(pushSubscription, notificationPayload);
      } catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410 || err.statusCode === 403) {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id);
        } else {
          console.error('Error sending push to', sub.endpoint, err);
        }
      }
    });

    await Promise.all(sendPromises);

    res.status(200).json({ success: true, message: 'Notifications sent to admin' });
  } catch (err: any) {
    console.error('Global API Error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}
