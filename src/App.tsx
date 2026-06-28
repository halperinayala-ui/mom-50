import React, { useState, useEffect, useRef } from 'react';
import { Gift, Video, Image as ImageIcon, Send, Lock, Mic, FileText, Calendar, X, Trash2, Edit2, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import type { Greeting, GreetingType } from './lib/supabase';
import { supabase } from './lib/supabase';
import AudioRecorder from './components/AudioRecorder';

// --- Types ---
type AppGreeting = Greeting & { isOpened?: boolean };

// --- Components ---

function LockedGreetingCard({ greeting, currentUser, onDelete }: { greeting: Greeting, currentUser: string, onDelete: (id: string) => void }) {
  const timeString = new Date(greeting.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  const canEdit = greeting.uploaded_by === currentUser || (!greeting.uploaded_by && greeting.sender === currentUser);

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
  onEdit 
}: { 
  greeting: AppGreeting, 
  onOpen: () => void, 
  currentUser: string,
  onDelete: (id: string) => void,
  onEdit: (greeting: AppGreeting) => void
}) {
  // Privacy check
  const isMom = currentUser === 'אמא';
  const isSender = greeting.sender === currentUser;
  const isUploader = greeting.uploaded_by === currentUser;
  const canView = !greeting.is_private || isMom || isSender || isUploader;
  const canEdit = isUploader || (!greeting.uploaded_by && isSender);

  if (!canView) {
    return <LockedGreetingCard greeting={greeting} currentUser={currentUser} onDelete={onDelete} />;
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
    </motion.article>
  );
}

// --- Main App ---

export default function App() {
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
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for saved name on load
  useEffect(() => {
    const savedName = localStorage.getItem('birthday_user_name');
    const savedIsAdmin = localStorage.getItem('birthday_is_admin') === 'true';
    if (savedName) {
      setUserName(savedName);
      setIsAdmin(savedIsAdmin);
      setSenderInput(savedName);
    }
  }, []);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      let finalName = nameInput.trim();
      let hasAdminRights = false;
      
      // Secret admin login logic
      if (finalName.toLowerCase().endsWith('mom50')) {
         hasAdminRights = true;
         finalName = finalName.slice(0, -5).trim(); // Remove 'mom50' from the end
      }
      
      setUserName(finalName);
      setIsAdmin(hasAdminRights);
      setSenderInput(finalName);
      localStorage.setItem('birthday_user_name', finalName);
      localStorage.setItem('birthday_is_admin', hasAdminRights ? 'true' : 'false');
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

    async function fetchGreetings() {
      const { data, error } = await supabase
        .from('greetings')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching greetings:', error);
      } else if (data) {
        const now = new Date();
        const visibleGreetings = data.filter(g => !g.scheduled_for || new Date(g.scheduled_for) <= now);
        setGreetings(visibleGreetings.map(g => ({ ...g, isOpened: false })));
      }
      setLoading(false);
    }
    fetchGreetings();

    const channel = supabase
      .channel('public:greetings')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'greetings' }, payload => {
         const newGreeting = payload.new as Greeting;
         const now = new Date();
         if (!newGreeting.scheduled_for || new Date(newGreeting.scheduled_for) <= now) {
            setGreetings(prev => [{ ...newGreeting, isOpened: false }, ...prev]);
         }
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
  }, [userName]);

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

      let scheduled_for = null;
      if (scheduledDate && scheduledTime) {
         scheduled_for = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
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
            scheduled_for,
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
              scheduled_for,
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
      setScheduledDate('');
      setScheduledTime('');
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
    
    if (greeting.scheduled_for) {
      const d = new Date(greeting.scheduled_for);
      setScheduledDate(d.toISOString().split('T')[0]);
      setScheduledTime(d.toTimeString().slice(0,5));
    } else {
      setScheduledDate('');
      setScheduledTime('');
    }
    
    setShowUploadModal(true);
  };

  const resetForm = () => {
    setSenderInput(userName || '');
    setType('text');
    setContent('');
    setFile(null);
    setIsPrivate(false);
    setScheduledDate('');
    setScheduledTime('');
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
    } catch (error) {
      console.error(error);
      toast.error('שגיאה בהרשמה להתראות');
    }
  };

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
              placeholder="למשל: דניאל, אבא, רותי..." 
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-4 text-center focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg"
              autoFocus
              required
            />
            <button type="submit" className="w-full bg-gradient-to-r from-[#800000] to-[#5a0000] text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all">
              היכנס לאפליקציה
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // 2. Main Feed
  return (
    <div className="min-h-screen max-w-md mx-auto bg-[#FDFBF7] shadow-2xl flex flex-col relative overflow-hidden font-sans">
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
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </AnimatePresence>
        )}

        <div className="text-center pt-8 pb-12 flex flex-col items-center">
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent mb-6"></div>
          <p className="text-sm text-[#a09e99] tracking-widest uppercase font-light">עוד הפתעות בדרך...</p>
        </div>
      </main>
      
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

              <div className="p-4 bg-yellow-50/50 rounded-xl border border-yellow-100">
                <label className="block text-sm font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-yellow-600" />
                  תזמון עתידי (אופציונלי)
                </label>
                <div className="flex gap-4">
                  <div className="flex-1">
                     <input 
                       type="date" 
                       value={scheduledDate}
                       onChange={e => setScheduledDate(e.target.value)}
                       className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                     />
                  </div>
                  <div className="flex-1">
                     <input 
                       type="time" 
                       value={scheduledTime}
                       onChange={e => setScheduledTime(e.target.value)}
                       className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                     />
                  </div>
                </div>
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
