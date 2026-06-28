import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Upload, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import AudioRecorder from './AudioRecorder';

interface GuestUploadScreenProps {
  guestName: string | null;
}

export function GuestUploadScreen({ guestName }: GuestUploadScreenProps) {
  const [senderInput, setSenderInput] = useState(guestName || '');
  const [type, setType] = useState<'video' | 'text' | 'image' | 'audio'>('video');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderInput.trim()) {
      toast.error('חובה להזין את השם שלך');
      return;
    }

    if (type !== 'text' && !file) {
      toast.error('חובה להוסיף קובץ מדיה');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('מעלה את הברכה, נא להמתין...');

    try {
      let mediaUrl = '';
      if (file) {
        const fileExt = file instanceof File ? file.name.split('.').pop() : 'webm';
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('greetings_media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('greetings_media')
          .getPublicUrl(filePath);

        mediaUrl = publicUrl;
      }

      // Important: is_approved = false!
      const { error: insertError } = await supabase
        .from('greetings')
        .insert({
          type,
          content: content.trim(),
          media_url: mediaUrl,
          sender: senderInput.trim(),
          uploaded_by: senderInput.trim() + ' (אורח)',
          is_private: false,
          is_approved: false
        });

      if (insertError) throw insertError;

      // Notify Super Admin
      fetch('/api/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sender: senderInput.trim()
        })
      }).catch(err => console.error('Error triggering admin push notification', err));

      toast.success('הברכה נשלחה בהצלחה!', { id: toastId });
      setIsSuccess(true);
      
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.3 },
        colors: ['#D4AF37', '#FFD700', '#FFFFFF', '#800000']
      });
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('שגיאה בהעלאה: ' + error.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-[#D4AF37]/30 max-w-md w-full relative"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-heading font-bold text-primary mb-4">תודה רבה!</h2>
          <p className="text-lg text-gray-600">
            הברכה שלך התקבלה בהצלחה ותצורף ללוח הברכות לאמא! ✨
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 font-sans pb-20 relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#f2e8d5] to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      </div>
      
      <div className="relative z-10 max-w-md w-full mx-auto">
        <header className="text-center py-8">
          <img src="/logo.png" alt="Logo" className="w-32 mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold text-primary">הוזמנת לברך את אמא! ❤️</h1>
          <p className="text-gray-600 mt-2">כל ברכה שלכם הופכת את היום הזה למיוחד יותר.</p>
        </header>

        <form onSubmit={handleUploadSubmit} className="bg-white p-6 rounded-3xl shadow-xl border border-[#D4AF37]/30 space-y-6 text-right" dir="rtl">
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">מי מברך? (שמך המלא או הכינוי שלך)</label>
            <input
              type="text"
              value={senderInput}
              onChange={(e) => setSenderInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-right"
              placeholder="למשל: משפחת כהן או דודה שרה"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">סוג הברכה</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('video')}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${type === 'video' ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                וידאו
              </button>
              <button
                type="button"
                onClick={() => setType('image')}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${type === 'image' ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                תמונה
              </button>
              <button
                type="button"
                onClick={() => setType('text')}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${type === 'text' ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                טקסט בלבד
              </button>
              <button
                type="button"
                onClick={() => setType('audio')}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${type === 'audio' ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                אודיו
              </button>
            </div>
          </div>

          {type !== 'text' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">קובץ מצורף</label>
              
              {type === 'audio' ? (
                <div className="border-2 border-dashed border-[#D4AF37]/50 rounded-xl p-6 text-center">
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
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#D4AF37]/50 rounded-xl p-6 text-center cursor-pointer hover:bg-yellow-50/30 transition-colors"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept={type === 'video' ? "video/*" : "image/*"}
                    className="hidden"
                  />
                  {file && file instanceof File ? (
                    <div className="text-primary font-medium flex items-center justify-center gap-2">
                      <AlertCircle className="w-4 h-4 text-green-500" />
                      {file.name}
                    </div>
                  ) : (
                    <div className="text-gray-500 flex flex-col items-center">
                      <Upload className="w-8 h-8 mb-2 text-[#D4AF37]" />
                      <span>לחץ כאן לבחירת {type === 'video' ? 'סרטון' : 'תמונה'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {type === 'text' ? 'תוכן הברכה' : 'מילים אישיות (לא חובה)'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/50 text-right resize-y"
              placeholder="כתבו משהו מרגש..."
              required={type === 'text'}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#800000] to-[#5a0000] text-white py-4 rounded-xl font-medium hover:shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="animate-pulse">מעלה...</span>
            ) : (
              <>
                <span>שליחת הברכה ללוח</span>
                <Send className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
