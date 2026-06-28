import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Gift, Video, Image as ImageIcon, Send, Lock, Mic, FileText, X, Trash2, Edit2, Bell, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import type { Greeting, GreetingType } from './lib/supabase';
import { supabase } from './lib/supabase';
import AudioRecorder from './components/AudioRecorder';

// --- Types ---
type AppGreeting = Greeting & { isOpened?: boolean };

// --- Components ---

function LockedGreetingCard({ greeting, currentUser, isAdmin, onDelete }: { greeting: AppGreeting, currentUser: string, isAdmin: boolean, onDelete: (id: string) => void }) {
  const timeString = new Date(greeting.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  const canEdit = isAdmin && (greeting.uploaded_by === currentUser || (!greeting.uploaded_by && greeting.sender === currentUser));

  return (
    <motion.article 
      layoutId={`card-${greeting.id}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 flex flex-col items-center justify-center min-h-[200px]"
    >
      {canEdit && (
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(greeting.id); }}
          className="absolute top-4 left-4 p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors z-20"
          title="מחק ברכה"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-50"></div>
      
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
         <Lock className="w-8 h-8 text-gray-400" />
      </div>
      
      <h3 className="font-heading font-bold text-xl text-gray-600 tracking-wide text-center">
        ברכה אישית מ{greeting.sender}
      </h3>
      <p className="text-gray-400 text-sm mt-2">רק אמא יכולה לראות ברכה זו</p>
      
      <div className="absolute top-4 right-6 text-xs text-gray-400 tracking-widest">{timeString}</div>
    </motion.article>
  );
}

function GreetingCard({ 
  greeting, 
  onOpen, 
  currentUser,
  isAdmin, 
  onDelete, 
  onEdit,
  onHeart
}: { 
  greeting: AppGreeting, 
  onOpen: () => void, 
  currentUser: string,
  isAdmin: boolean,
  onDelete: (id: string) => void,
  onEdit: (greeting: AppGreeting) => void,
  onHeart: (id: string) => void
}) {
  // Privacy check
  const isMom = currentUser === 'אמא';
  const isSender = greeting.sender === currentUser;
  const isUploader = greeting.uploaded_by === currentUser;
  const canView = !greeting.is_private || isMom || isSender || isUploader;
  const canEdit = isAdmin && (isUploader || (!greeting.uploaded_by && isSender));

  if (!canView) {
    return <LockedGreetingCard greeting={greeting} currentUser={currentUser} isAdmin={isAdmin} onDelete={onDelete} />;
  }

  if (!greeting.isOpened) {
    return (
      <motion.div 
        layoutId={`card-${greeting.id}`}
        onClick={onOpen}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="cursor-pointer relative bg-gradient-to-br from-[#7d0a21] to-[#5a0000] rounded-3xl p-8 shadow-xl border border-[#D4AF37]/30 flex flex-col items-center justify-center min-h-[200px] group overflow-hidden"
      >
        {canEdit && (
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(greeting.id); }}
            className="absolute top-4 left-4 p-2 bg-white/20 text-white rounded-full hover:bg-red-500 transition-colors z-20"
            title="מחק ברכה"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#D4AF37]/10 rounded-full blur-xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <motion.div 
          animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
          className="relative z-10"
        >
          <Gift className="w-16 h-16 text-[#D4AF37] mb-4 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" strokeWidth={1} />
        </motion.div>
        <h3 className="text-[#FDFBF7] font-heading font-medium text-2xl z-10 tracking-wide text-center">
          מזל טוב חדש מ{greeting.sender}!
        </h3>
        <p className="text-[#D4AF37] text-sm mt-2 opacity-80 z-10">לחצי לפתיחה</p>
      </motion.div>
    );
  }

  const timeString = new Date(greeting.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.article 
      layoutId={`card-${greeting.id}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      className="group relative bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#D4AF37]/20"
    >
      {canEdit && (
        <div className="absolute top-4 left-4 flex gap-2 z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(greeting); }}
            className="p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-200 transition-colors"
            title="ערוך טקסט"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(greeting.id); }}
            className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors"
            title="מחק ברכה"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50"></div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
           <h3 className="font-heading font-bold text-2xl text-primary tracking-wide">
             {greeting.sender}
           </h3>
           {greeting.is_private && <Lock className="w-4 h-4 text-gray-400" aria-label="ברכה אישית" />}
        </div>
        <span className="text-xs text-[#a09e99] tracking-widest mr-auto pl-16">{timeString}</span>
      </div>
      
      {greeting.media_url && (
        <div className="relative rounded-2xl overflow-hidden mb-5 shadow-sm">
          {greeting.type === 'video' ? (
             <video src={greeting.media_url} controls className="w-full max-h-[70vh] object-contain bg-black/5" />
          ) : greeting.type === 'audio' ? (
             <audio src={greeting.media_url} controls className="w-full mt-2" />
          ) : (
            <img 
              src={greeting.media_url} 
              alt="Greeting media" 
              className="w-full h-auto max-h-[70vh] object-contain rounded-xl bg-gray-50"
            />
          )}
        </div>
      )}
      
      <p className="text-[#4a4843] leading-relaxed text-[17px] font-light whitespace-pre-wrap">
        {greeting.content}
      </p>

      {/* Heart interaction for Mom */}
      <div className="mt-4 flex justify-end">
        {isMom ? (
          <button 
            onClick={(e) => { e.stopPropagation(); onHeart(greeting.id); }}
            className="flex items-center gap-1 text-[#D4AF37] hover:scale-110 transition-transform"
          >
            {greeting.liked_by_mom ? <Heart className="w-6 h-6 fill-[#D4AF37]" /> : <Heart className="w-6 h-6" />}
          </button>
        ) : greeting.liked_by_mom ? (
          <div className="flex items-center gap-1 text-[#D4AF37]">
            <Heart className="w-5 h-5 fill-[#D4AF37]" />
            <span className="text-xs">אמא אהבה</span>
          </div>
        ) : null}
      </div>
    </motion.article>
  );
}

// --- Main App ---

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showMomWelcome, setShowMomWelcome] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [nameInput, setNameInput] = useState('');
  
  const [greetings, setGreetings] = useState<AppGreeting[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingGreetingId, setEditingGreetingId] = useState<string | null>(null);
  const [existingMediaUrl, setExistingMediaUrl] = useState<string | null>(null);
  
  const [senderInput, setSenderInput] = useState('');
  const [type, setType] = useState<GreetingType>('text');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | Blob | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Splash screen timer
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Check for saved name on load
  useEffect(() => {
    const savedName = localStorage.getItem('birthday_user_name');
    const savedIsAdmin = localStorage.getItem('birthday_is_admin') === 'true';
    if (savedName) {
      setUserName(savedName);
      setIsAdmin(savedIsAdmin);
      setSenderInput(savedName);
      
      if (savedName === 'אמא' && !sessionStorage.getItem('mom_welcomed')) {
        setShowMomWelcome(true);
        sessionStorage.setItem('mom_welcomed', 'true');
      }
    }
  }, []);

  const fetchGreetings = useCallback(async () => {
    const { data, error } = await supabase
      .from('greetings')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching greetings:', error);
    } else if (data) {
      setGreetings(prev => data.map(g => {
        const existing = prev.find(p => p.id === g.id);
        return { ...g, isOpened: existing?.isOpened || false };
      }));
    }
    setLoading(false);
  }, []);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      let finalName = nameInput.trim();
      let hasAdminRights = false;
      
      // Secret admin login logic
      if (finalName.toLowerCase().endsWith('mom50')) {
         hasAdminRights = true;
         finalName = finalName.slice(0, -5).trim() || 'מנהל'; // Remove 'mom50' from the end
      }

      setUserName(finalName);
      setIsAdmin(hasAdminRights);
      setSenderInput(finalName);
      localStorage.setItem('birthday_user_name', finalName);
      localStorage.setItem('birthday_is_admin', hasAdminRights.toString());
      
      if (finalName === 'אמא') {
        setShowMomWelcome(true);
        sessionStorage.setItem('mom_welcomed', 'true');
      }
    }
  };

  // PWA Install Logic & Scheduled Refresh
  useEffect(() => {
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    
    // Auto refresh every minute to show newly active scheduled greetings
    const interval = setInterval(() => {
      if (userName) fetchGreetings();
    }, 60000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearInterval(interval);
    };
  }, [userName, fetchGreetings]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallBanner(false);
      }
    }
  };

  const handleLogout = () => {
    setUserName(null);
    setIsAdmin(false);
    localStorage.removeItem('birthday_user_name');
    localStorage.removeItem('birthday_is_admin');
  };

  // Fetch greetings
  useEffect(() => {
    if (!userName) return;

    fetchGreetings();

    const channel = supabase
      .channel('public:greetings')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'greetings' }, payload => {
         const newGreeting = payload.new as Greeting;
         setGreetings(prev => [{ ...newGreeting, isOpened: false }, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'greetings' }, payload => {
         const updated = payload.new as Greeting;
         setGreetings(prev => prev.map(g => g.id === updated.id ? { ...updated, isOpened: g.isOpened } : g));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'greetings' }, payload => {
         setGreetings(prev => prev.filter(g => g.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userName, fetchGreetings]);

  const handleOpen = (id: string) => {
    setGreetings(prev => prev.map(g => g.id === id ? { ...g, isOpened: true } : g));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !isAdmin) return;
    
    if (!senderInput.trim()) {
      toast.error('חובה להזין את שם השולח');
      return;
    }

    if (type !== 'text' && !file && !existingMediaUrl) {
      toast.error('חובה להוסיף קובץ מדיה');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(editingGreetingId ? 'מעדכן ברכה...' : 'מעלה ברכה...');

    try {
      let media_url = existingMediaUrl; // Keep old media URL by default

      // Extract old filename if we need to delete it
      const oldFilename = existingMediaUrl ? existingMediaUrl.split('/').pop() : null;

      if (file && type !== 'text') {
        // Upload new file
        const fileExt = file instanceof File ? file.name.split('.').pop() : 'webm';
        const fileName = `${uuidv4()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('greetings_media')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('greetings_media')
          .getPublicUrl(fileName);
          
        media_url = publicUrl;

        // Delete old file if existed
        if (oldFilename) {
          await supabase.storage.from('greetings_media').remove([oldFilename]);
        }
      } else if (type === 'text') {
        // If type changed to text, remove any old file
        media_url = null;
        if (oldFilename) {
          await supabase.storage.from('greetings_media').remove([oldFilename]);
        }
      }

      if (editingGreetingId) {
        // Update existing greeting
        const { error: updateError } = await supabase
          .from('greetings')
          .update({
            sender: senderInput.trim(),
            type,
            content,
            media_url,
            is_private: isPrivate
          })
          .eq('id', editingGreetingId);

        if (updateError) throw updateError;
        toast.success('הברכה עודכנה בהצלחה!', { id: toastId });
      } else {
        // Insert new greeting
        const { error: insertError } = await supabase
          .from('greetings')
          .insert([
            {
              sender: senderInput.trim(),
              type,
              content,
              media_url,
              is_private: isPrivate,
              uploaded_by: userName
            }
          ]);

        if (insertError) throw insertError;
        toast.success('הברכה עלתה בהצלחה!', { id: toastId });
        
        // Notify others
        try {
          await fetch('/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sender: senderInput.trim(), title: 'ברכה חדשה!' })
          });
        } catch (e) {
          console.error('Failed to trigger push notification', e);
        }
      }
      
      // Reset form and close modal
      setContent('');
      setFile(null);
      setIsPrivate(false);
      setEditingGreetingId(null);
      setExistingMediaUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowUploadModal(false);

    } catch (error: any) {
      console.error(error);
      toast.error(`שגיאה: ${error.message || 'לא הצלחנו להעלות'}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHeart = async (id: string) => {
    if (userName !== 'אמא') return;
    
    // Confetti
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#FFD700', '#FDFBF7', '#800000']
    });

    try {
      const { error } = await supabase
        .from('greetings')
        .update({ liked_by_mom: true })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state immediately
      setGreetings(prev => prev.map(g => g.id === id ? { ...g, liked_by_mom: true } : g));
    } catch (error) {
      console.error('Failed to like greeting:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (!window.confirm('האם את בטוחה שאת רוצה למחוק את הברכה הזו?')) return;
    
    try {
      const { error } = await supabase.from('greetings').delete().eq('id', id);
      if (error) throw error;
      toast.success('הברכה נמחקה');
    } catch (error) {
      toast.error('שגיאה במחיקת הברכה');
    }
  };

  const handleEdit = (greeting: AppGreeting) => {
    if (!isAdmin) return;
    setEditingGreetingId(greeting.id);
    setSenderInput(greeting.sender);
    setType(greeting.type);
    setContent(greeting.content);
    setIsPrivate(greeting.is_private);
    setExistingMediaUrl(greeting.media_url || null);
    
    setShowUploadModal(true);
  };

  const resetForm = () => {
    setSenderInput(userName || '');
    setType('text');
    setContent('');
    setFile(null);
    setIsPrivate(false);
    setEditingGreetingId(null);
    setExistingMediaUrl(null);
  }

  // Subscribe to push notifications
  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast.error('הדפדפן שלך לא תומך בהתראות');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('לא אישרת קבלת התראות');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        toast.error('חסר מפתח התראות במערכת');
        return;
      }

      // Convert VAPID key to Uint8Array
      const padding = '='.repeat((4 - vapidPublicKey.length % 4) % 4);
      const base64 = (vapidPublicKey + padding).replace(/\-/g, '+').replace(/_/g, '/');
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: outputArray
      });

      const subData = JSON.parse(JSON.stringify(subscription));

      const { error } = await supabase.from('push_subscriptions').insert([{
        endpoint: subData.endpoint,
        p256dh: subData.keys.p256dh,
        auth: subData.keys.auth
      }]);

      if (error && error.code !== '23505') { // Ignore unique violation if already subscribed
        throw error;
      }

      toast.success('הירשמות להתראות בוצעה בהצלחה!');
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error(`שגיאה בהרשמה: ${error.message || 'לא ידוע'}`);
    }
  };

  useEffect(() => {
    if (showMomWelcome) {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.3 },
        colors: ['#D4AF37', '#FFD700', '#FFFFFF', '#800000']
      });
    }
  }, [showMomWelcome]);

  if (showSplash) {
    return (
      <AnimatePresence>
        <motion.div 
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] bg-[#FDFBF7] flex items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/20 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#800000]/10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
          </div>
          <img 
            src="/logo.png" 
            alt="Splash Screen Logo" 
            className="w-64 h-auto relative z-10 drop-shadow-xl"
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  // 1. Name Prompt Screen
  if (!userName) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 font-sans relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
           <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#f2e8d5] to-transparent"></div>
           <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-[#D4AF37]/20 max-w-sm w-full text-center relative z-10"
        >
          <img src="/logo.png" alt="Logo" className="w-40 mx-auto mb-6" />
          <h2 className="text-2xl font-heading font-bold text-primary mb-6">ברוכים הבאים! איך קוראים לך?</h2>
          <form onSubmit={handleNameSubmit}>
            <input 
              type="text" 
              placeholder="למשל: אמא, סבתאלה, חני, דובי"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-4 text-center focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg"
              autoFocus
              required
            />
            <button type="submit" className="w-full bg-gradient-to-r from-[#800000] to-[#5a0000] text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all">
              כניסה
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // 2. Mom Welcome Screen
  if (showMomWelcome) {
    return (
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/20 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#800000]/10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
          </div>
          
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            className="relative z-10 bg-white/60 backdrop-blur-md p-10 rounded-3xl border border-[#D4AF37]/30 shadow-2xl max-w-lg"
          >
            <Gift className="w-24 h-24 text-[#D4AF37] mx-auto mb-6 drop-shadow-md" strokeWidth={1.5} />
            <h1 className="text-4xl md:text-5xl font-heading font-black text-[#800000] mb-4">
              מזל טוב אמא! ❤️
            </h1>
            <p className="text-xl text-[#4a4843] leading-relaxed mb-8">
              ברוכה הבאה לאפליקציית יום ההולדת שלך.<br/>
              כולנו אספנו כאן ברכות, תמונות וסרטונים לכבודך.<br/>
              אוהבים אותך המון!
            </p>
            <button 
              onClick={() => setShowMomWelcome(false)}
              className="bg-gradient-to-r from-[#800000] to-[#5a0000] text-white px-10 py-4 rounded-full font-bold text-xl shadow-[0_10px_20px_rgba(128,0,0,0.2)] hover:scale-105 transition-transform"
            >
              כניסה
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // 3. Main Greetings View
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans relative overflow-x-hidden">
      <Toaster position="top-center" />
      
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#f2e8d5] to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      </div>
      
      <header className="relative z-10 pt-10 pb-6 px-6 flex flex-col items-center sticky top-0 bg-[#FDFBF7]/90 backdrop-blur-xl border-b border-[#D4AF37]/20">
        <div className="absolute top-4 right-4 flex gap-3 items-center">
           <button onClick={subscribeToPush} className="p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-primary/10 hover:text-primary transition-colors shadow-sm" title="קבל התראות">
              <Bell className="w-4 h-4" />
           </button>
           <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-primary transition-colors">
              החלף משתמש ({userName})
           </button>
        </div>
        <img 
          src="/logo.png" 
          alt="50th Birthday Logo" 
          className="w-56 h-auto drop-shadow-sm transition-transform duration-700 hover:scale-105"
        />
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto p-5 space-y-8 pb-32">
        {loading ? (
          <div className="text-center text-[#D4AF37] py-10">טוען הפתעות...</div>
        ) : greetings.length === 0 ? (
          <div className="text-center text-gray-400 py-10 font-light">עדיין אין ברכות. בקרוב...</div>
        ) : (
          <AnimatePresence>
            {greetings.map((greeting) => (
              <GreetingCard 
                key={greeting.id} 
                greeting={greeting} 
                onOpen={() => handleOpen(greeting.id)} 
                currentUser={userName} 
                isAdmin={isAdmin}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onHeart={handleHeart}
              />
            ))}
          </AnimatePresence>
        )}

        <div className="text-center pt-8 pb-12 flex flex-col items-center">
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent mb-6"></div>
          <p className="text-sm text-[#a09e99] tracking-widest uppercase font-light">עוד הפתעות בדרך...</p>
        </div>
      </main>
      
      {/* PWA Install Banner */}
      {showInstallBanner && (deferredPrompt || isIOS) && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-[#FDFBF7] border-t border-[#D4AF37]/30 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-40 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <img src="/icon-192.png" className="w-12 h-12 rounded-xl shadow-md" alt="App Icon" />
            <div>
              <h4 className="font-bold text-[#800000]">אמא 50</h4>
              <p className="text-xs text-gray-600">התקינו את האפליקציה למסך הבית!</p>
            </div>
          </div>
          {isIOS && !deferredPrompt ? (
            <div className="text-[10px] leading-tight text-[#800000] font-medium bg-[#D4AF37]/10 px-2 py-1.5 rounded-lg max-w-[120px] text-center">
              לחצו על השיתוף (מרובע עם חץ) ואז "הוסף למסך הבית"
            </div>
          ) : (
            <button onClick={handleInstallClick} className="bg-[#800000] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md hover:bg-[#5a0000] transition-colors">
              התקנה
            </button>
          )}
          <button onClick={() => setShowInstallBanner(false)} className="absolute top-1 left-1 p-1 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Upload Button (Only for Admins) */}
      {isAdmin && userName !== 'אמא' && !showUploadModal && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
           <button 
             onClick={() => { resetForm(); setShowUploadModal(true); }}
             className="bg-gradient-to-r from-[#800000] to-[#5a0000] text-white/90 px-8 py-3.5 rounded-full shadow-[0_10px_40px_rgba(128,0,0,0.4)] font-medium flex items-center gap-3 active:scale-95 transition-all hover:shadow-[0_10px_40px_rgba(128,0,0,0.6)] border border-white/10"
           >
             <Send className="w-5 h-5 text-[#D4AF37]" strokeWidth={1.5} />
             <span className="tracking-wide text-sm">העלאת ברכה</span>
           </button>
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-50 bg-[#FDFBF7] flex flex-col overflow-y-auto"
          >
            <div className="sticky top-0 bg-white/80 backdrop-blur-md p-4 flex justify-between items-center border-b border-gray-100 z-10">
              <h2 className="text-xl font-heading font-bold text-primary">{editingGreetingId ? 'עריכת ברכה' : 'ברכה חדשה'}</h2>
              <button onClick={() => { setShowUploadModal(false); resetForm(); }} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ממי הברכה?</label>
                <input 
                  type="text" 
                  value={senderInput}
                  onChange={e => setSenderInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 text-lg"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">אפשר לשנות את השם אם מעלים בשם מישהו אחר (למשל: "סבתא")</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">סוג הברכה</label>
                <div className="flex gap-2 p-1 bg-gray-50 rounded-xl border border-gray-200">
                  {(['text', 'image', 'video', 'audio'] as GreetingType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { setType(t); setFile(null); }}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors ${type === t ? 'bg-white shadow-sm text-primary font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {t === 'text' && <FileText className="w-4 h-4" />}
                      {t === 'image' && <ImageIcon className="w-4 h-4" />}
                      {t === 'video' && <Video className="w-4 h-4" />}
                      {t === 'audio' && <Mic className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {type !== 'text' && (
                <div className="p-5 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  {existingMediaUrl && !file && (
                     <div className="mb-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg flex justify-between items-center">
                       <span>כבר קיים קובץ לברכה זו. העלאה חדשה תחליף אותו.</span>
                     </div>
                  )}
                  {type === 'audio' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4 text-center">הקליטו הודעה קולית</label>
                      <AudioRecorder 
                        onRecordingComplete={(blob) => setFile(blob)} 
                        onClear={() => setFile(null)} 
                      />
                      <input 
                        type="file" 
                        accept="audio/*"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="mt-6 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        בחירת קובץ ({type === 'image' ? 'תמונה' : 'סרטון'})
                      </label>
                      <input 
                        type="file" 
                        accept={type === 'image' ? 'image/*' : 'video/*'}
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">טקסט הברכה {type !== 'text' && '(אופציונלי)'}</label>
                <textarea 
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="כתבו כאן את הברכה..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  required={type === 'text'}
                ></textarea>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <input 
                  type="checkbox" 
                  id="privateCheckbox"
                  checked={isPrivate}
                  onChange={e => setIsPrivate(e.target.checked)}
                  className="w-5 h-5 text-primary rounded focus:ring-primary"
                />
                <label htmlFor="privateCheckbox" className="text-sm text-gray-700 flex flex-col">
                  <span className="font-bold flex items-center gap-1"><Lock className="w-3 h-3" /> ברכה אישית</span>
                  <span className="text-xs text-gray-500">רק אמא ואני נוכל לראות את הברכה הזו.</span>
                </label>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold tracking-wide hover:bg-primary-light transition-colors shadow-lg shadow-primary/30 disabled:opacity-70 disabled:cursor-not-allowed mb-10"
              >
                {isSubmitting ? (editingGreetingId ? 'מעדכן...' : 'מעלה...') : (editingGreetingId ? 'שמור שינויים' : 'שליחת הברכה')}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
