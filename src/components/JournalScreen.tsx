import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Send, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Greeting, Comment } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export function JournalScreen({ 
  greetings, 
  currentUser, 
  isTraveler,
  onUploadClick
}: { 
  greetings: Greeting[], 
  currentUser: string | null,
  isTraveler: boolean,
  onUploadClick: () => void
}) {
  const journalEntries = greetings.filter(g => g.is_journal_entry);
  
  return (
    <div className="p-5 space-y-6 pb-32 max-w-lg mx-auto">
      
      {/* Header & Upload Button for Mom */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-heading font-bold text-[#800000]">יומן מסע</h2>
        {isTraveler && (
          <button 
            onClick={onUploadClick}
            className="bg-[#800000] text-[#FDFBF7] px-4 py-2 rounded-full shadow-md flex items-center gap-2 hover:bg-[#600000] transition-colors"
          >
            <Camera className="w-4 h-4" />
            <span className="text-sm font-bold">שתפי חוויה</span>
          </button>
        )}
      </div>

      {journalEntries.length === 0 ? (
        <div className="text-center text-gray-400 py-10 font-light bg-white/50 rounded-2xl border border-[#D4AF37]/20">
          אמא עדיין לא שיתפה חוויות מהמסע...
        </div>
      ) : (
        journalEntries.map(entry => (
          <JournalEntryCard 
            key={entry.id} 
            entry={entry} 
            currentUser={currentUser} 
          />
        ))
      )}
    </div>
  );
}

function JournalEntryCard({ entry, currentUser }: { entry: Greeting, currentUser: string | null }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeString = new Date(entry.created_at).toLocaleString('he-IL', { 
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('greeting_id', entry.id)
      .order('created_at', { ascending: true });
    
    if (!error && data) {
      setComments(data);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;
    
    setIsSubmitting(true);
    const { error } = await supabase.from('comments').insert({
      greeting_id: entry.id,
      author: currentUser,
      content: newComment.trim()
    });

    if (error) {
      toast.error('שגיאה בשליחת תגובה');
    } else {
      setNewComment('');
      fetchComments();
    }
    setIsSubmitting(false);
  };

  const handleLike = async () => {
    if (!currentUser) return;
    
    const currentReadBy = entry.read_by || [];
    let newReadBy = [...currentReadBy];
    
    if (newReadBy.includes(currentUser)) {
      newReadBy = newReadBy.filter(u => u !== currentUser);
    } else {
      newReadBy.push(currentUser);
    }
    
    const { error } = await supabase
      .from('greetings')
      .update({ read_by: newReadBy })
      .eq('id', entry.id);
      
    if (error) {
      toast.error('שגיאה בשמירת לייק');
    } else {
      entry.read_by = newReadBy; // optimistic local update handled by parent usually, but we mutate locally for fast UI
    }
  };

  const hasLiked = currentUser ? (entry.read_by || []).includes(currentUser) : false;
  const likesCount = (entry.read_by || []).length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#800000] to-[#D4AF37] flex items-center justify-center text-white font-bold font-heading shadow-inner">
            {entry.sender?.substring(0, 3)}
          </div>
          <div>
            <p className="font-bold text-gray-800">{entry.sender}</p>
            <p className="text-xs text-gray-400">{timeString}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-2">
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{entry.content}</p>
      </div>

      {/* Media */}
      {entry.media_url && (
        <div className="w-full bg-gray-100 max-h-[500px] overflow-hidden flex items-center justify-center">
          {entry.type === 'video' ? (
            <video src={entry.media_url} controls className="max-h-[500px] w-full object-contain" />
          ) : (
            <img src={entry.media_url} alt="Journal" className="max-h-[500px] w-full object-contain" />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-6">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-1.5 transition-colors ${hasLiked ? 'text-[#800000]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{likesCount > 0 ? likesCount : 'לייק'}</span>
        </button>

        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">תגובות</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
            {comments.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-2">אין עדיין תגובות. תהיו הראשונים להגיב!</p>
            ) : (
              comments.map(c => (
                <div key={c.id} className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 text-sm">
                  <span className="font-bold text-[#800000] ml-2">{c.author}:</span>
                  <span className="text-gray-700">{c.content}</span>
                </div>
              ))
            )}
          </div>
          
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input 
              type="text" 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="כתבו תגובה..."
              className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#D4AF37]"
            />
            <button 
              type="submit" 
              disabled={isSubmitting || !newComment.trim()}
              className="w-9 h-9 rounded-full bg-[#D4AF37] text-white flex items-center justify-center disabled:opacity-50"
            >
              <Send className="w-4 h-4 rtl:-scale-x-100" />
            </button>
          </form>
        </div>
      )}
    </motion.div>
  );
}
