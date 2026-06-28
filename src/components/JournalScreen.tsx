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
  onUploadClick,
  onEdit,
  onDelete
}: { 
  greetings: Greeting[], 
  currentUser: string | null,
  isTraveler: boolean,
  onUploadClick: () => void,
  onEdit: (greeting: Greeting) => void,
  onDelete: (id: string) => void
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
            <span className="text-sm font-bold">שיתוף חוויה</span>
          </button>
        )}
      </div>

      {journalEntries.length === 0 ? (
        <div className="text-center text-gray-400 py-10 font-light bg-white/50 rounded-2xl border border-[#D4AF37]/20">
          אמא ואבא עדיין לא שיתפו חוויות מהמסע...
        </div>
      ) : (
        journalEntries.map(entry => (
          <JournalEntryCard 
            key={entry.id} 
            entry={entry} 
            currentUser={currentUser} 
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
}

function JournalEntryCard({ 
  entry, 
  currentUser,
  onEdit,
  onDelete
}: { 
  entry: Greeting, 
  currentUser: string | null,
  onEdit: (greeting: Greeting) => void,
  onDelete: (id: string) => void
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeString = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(entry.created_at));

  useEffect(() => {
    fetchComments();

    const channel = supabase
      .channel(`public:comments:${entry.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'comments', 
        filter: `greeting_id=eq.${entry.id}` 
      }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [entry.id]);

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
      
      // Send push notification for comment
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sender: currentUser, 
          title: 'תגובה חדשה ביומן המסע',
          body: `${currentUser} הגיב/ה על החוויה של ${entry.sender}`
        })
      }).catch(console.error);
    }
    setIsSubmitting(false);
  };

  const handleUpdateComment = async (id: string) => {
    if (!editCommentText.trim()) return;
    const { error } = await supabase.from('comments').update({ content: editCommentText.trim() }).eq('id', id);
    if (error) {
      toast.error('שגיאה בעדכון התגובה');
    } else {
      setEditingCommentId(null);
      fetchComments();
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (window.confirm('למחוק את התגובה?')) {
      const { error } = await supabase.from('comments').delete().eq('id', id);
      if (error) {
        toast.error('שגיאה במחיקת התגובה');
      } else {
        fetchComments();
      }
    }
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
      entry.read_by = newReadBy;
    }
  };

  const hasLiked = currentUser ? (entry.read_by || []).includes(currentUser) : false;

  const renderLikesText = () => {
    const likers = entry.read_by || [];
    if (likers.length === 0) return 'לייק';
    if (likers.length === 1) return likers[0] === currentUser ? 'אהבת' : `${likers[0]} אהב/ה`;
    if (likers.length === 2) return `${likers[0]} ו-${likers[1]} אהבו`;
    return `${likers[0]}, ${likers[1]} ועוד ${likers.length - 2} אהבו`;
  };

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
        
        {currentUser === entry.sender && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onEdit(entry)}
              className="p-1.5 text-gray-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-full transition-colors"
              title="עריכה"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button 
              onClick={() => onDelete(entry.id)}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="מחיקה"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
        )}
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
          <span className="text-sm font-medium">{renderLikesText()}</span>
        </button>

        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{comments.length > 0 ? `תגובות (${comments.length})` : 'תגובות'}</span>
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
                <div key={c.id} className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 text-sm group relative">
                  {editingCommentId === c.id ? (
                    <div className="flex gap-2 w-full mt-1">
                      <input 
                        type="text" 
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-[#D4AF37]"
                        autoFocus
                      />
                      <button onClick={() => handleUpdateComment(c.id)} className="text-xs font-bold text-[#D4AF37]">שמור</button>
                      <button onClick={() => setEditingCommentId(null)} className="text-xs text-gray-500">בטל</button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-[#800000] ml-2">{c.author}:</span>
                        <span className="text-gray-700">{c.content}</span>
                      </div>
                      {c.author === currentUser && (
                        <div className="flex flex-col gap-2 mr-3">
                          <button 
                            onClick={() => {
                              setEditingCommentId(c.id);
                              setEditCommentText(c.content);
                            }} 
                            className="p-1.5 bg-gray-50 text-gray-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-full transition-colors"
                            title="ערוך"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteComment(c.id)}
                            className="p-1.5 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="מחק"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
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
