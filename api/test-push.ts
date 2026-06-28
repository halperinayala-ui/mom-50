import type { VercelRequest, VercelResponse } from '@vercel/node';
import webPush from 'web-push';

const VAPID_PUBLIC = process.env.VITE_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webPush.setVapidDetails(
    'mailto:ayala@example.com',
    VAPID_PUBLIC,
    VAPID_PRIVATE
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');
  
  const { subscription } = req.body;
  if (!subscription) return res.status(400).json({ error: 'No subscription provided' });

  try {
    const payload = JSON.stringify({ title: 'בדיקת מערכת!', body: 'אם את רואה את זה הפוש עובד!', icon: '/icon-192.png' });
    const result = await webPush.sendNotification(subscription, payload);
    res.status(200).json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message, statusCode: err.statusCode, body: err.body });
  }
}
