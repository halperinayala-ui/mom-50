import type { VercelRequest, VercelResponse } from '@vercel/node';
import webPush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const VAPID_PUBLIC = process.env.VITE_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webPush.setVapidDetails(
    'mailto:ayala@example.com',
    VAPID_PUBLIC,
    VAPID_PRIVATE
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, body, sender } = req.body;

  try {
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (error) throw error;
    if (!subscriptions || subscriptions.length === 0) {
      return res.status(200).json({ success: true, message: 'No subscriptions found' });
    }

    const notificationPayload = JSON.stringify({
      title: title || 'הפתעה חדשה!',
      body: body || `ברכה חדשה מ-${sender}`,
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
        if (err.statusCode === 404 || err.statusCode === 410) {
          // Subscription expired, remove it
          await supabase.from('push_subscriptions').delete().eq('id', sub.id);
        } else {
          console.error('Error sending push to', sub.endpoint, err);
        }
      }
    });

    await Promise.all(sendPromises);

    res.status(200).json({ success: true, message: 'Notifications sent' });
  } catch (err: any) {
    console.error('Global API Error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}
