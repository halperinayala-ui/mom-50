import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import type { LifeStoryEvent } from '../lib/supabase';
import { Plus, Image as ImageIcon, ChevronLeft, ChevronRight, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Props {
  currentUser: string | null;
  isStoryAdmin: boolean;
  onAddClick: () => void;
  onEditClick?: (event: LifeStoryEvent) => void;
}

const DECADES = [
  { year: 1976, hebrew_year: 'תשל"ו' },
  { year: 1986, hebrew_year: 'תשמ"ו' },
  { year: 1996, hebrew_year: 'תשנ"ו' },
  { year: 2006, hebrew_year: 'תשס"ו' },
  { year: 2016, hebrew_year: 'תשע"ו' },
  { year: 2026, hebrew_year: 'תשפ"ו' }
];

export function LifeStoryScreen({ currentUser, isStoryAdmin, onAddClick, onEditClick }: Props) {
  const [events, setEvents] = useState<LifeStoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const combinedEvents = useMemo(() => {
    const items: any[] = [...events];
    DECADES.forEach(decade => {
      if (!events.some(e => e.year_index === decade.year)) {
        items.push({
          id: `decade-${decade.year}`,
          year_index: decade.year,
          hebrew_year: decade.hebrew_year,
          isDecadeMarker: true
        });
      }
    });
    items.sort((a, b) => a.year_index - b.year_index);
    return items;
  }, [events]);

  useEffect(() => {
    fetchEvents();
    
    const subscription = supabase
      .channel('life_story_events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'life_story_events' }, payload => {
        fetchEvents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('life_story_events')
      .select('*')
      .order('year_index', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching life story:', error);
      // Fail silently if table doesn't exist yet, just show empty
      setEvents([]);
    } else if (data) {
      setEvents(data);
      // Determine what to mark as seen
      if (currentUser) {
        const unseenEvents = data.filter(e => !e.read_by || !e.read_by.includes(currentUser));
        if (unseenEvents.length > 0) {
          setExpanded(prev => {
             const next = { ...prev };
             unseenEvents.forEach(e => {
                if (next[e.id] === undefined) next[e.id] = true;
             });
             return next;
          });

          // Find the earliest unseen event (first one chronologically)
          const firstUnseen = unseenEvents[0];
          setTimeout(() => {
             const el = document.getElementById(`event-${firstUnseen.id}`);
             if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
             }
             // Mark as seen after lingering for 5 seconds
             setTimeout(() => {
                markAsSeen(unseenEvents);
             }, 5000);
          }, 800);
        }
      }
    }
    setLoading(false);
  };

  const markAsSeen = async (unseenEvents: LifeStoryEvent[]) => {
     if (!currentUser) return;
     
     for (const event of unseenEvents) {
        const newReadBy = [...(event.read_by || []), currentUser];
        supabase.from('life_story_events').update({ read_by: newReadBy }).eq('id', event.id).then();
     }
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: prev[id] === undefined ? false : !prev[id] }));
    
    // Mark as seen when expanded
    const event = events.find(e => e.id === id);
    if (event && currentUser && (!event.read_by || !event.read_by.includes(currentUser))) {
      markAsSeen([event]);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('life_story_events').delete().eq('id', id);
      if (error) throw error;
      toast.success('הפרק נמחק!', { duration: 3000 });
      setEvents(events.filter(e => e.id !== id));
    } catch (e) {
      toast.error('שגיאה במחיקה', { duration: 3000 });
    }
  };

  const confirmDelete = (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3 font-sans">
        <p className="font-bold text-gray-800 text-right">האם את/ה בטוח/ה שברצונך למחוק פרק זה?</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.remove(t.id)}
            className="px-4 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            ביטול
          </button>
          <button
            onClick={() => {
              toast.remove(t.id);
              handleDelete(id);
            }}
            className="px-4 py-1.5 text-sm font-medium text-white bg-[#800000] rounded-md hover:bg-[#600000] transition-colors shadow-sm"
          >
            כן, מחק
          </button>
        </div>
      </div>
    ), { duration: Infinity, position: 'bottom-center' });
  };

  const scrollGallery = (id: string, direction: 'left' | 'right') => {
    const el = document.getElementById(`gallery-${id}`);
    if (el) {
      const scrollAmount = el.clientWidth;
      el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin w-8 h-8 border-4 border-[#800000] border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div ref={containerRef} className="pb-32 px-4 pt-6 max-w-lg mx-auto relative min-h-screen font-serif" style={{ backgroundColor: '#FDFBF7', backgroundImage: 'radial-gradient(#e5e5e5 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      
      {/* Timeline main line - ALWAYS VISIBLE */}
      <div className="absolute top-20 bottom-0 right-8 w-1 bg-[#800000]/20 rounded-full z-0 pointer-events-none">
      </div>

      <div className="text-center mb-10 relative z-10">
        <h1 className="text-4xl font-heading font-bold text-[#800000] mb-2 tracking-wide">סיפור חיים</h1>
        <p className="text-[#D4AF37] font-medium text-lg italic">מיומנה של אמא</p>
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 w-24 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
      </div>

      <div className="relative z-10">
        {events.length === 0 && (
           <div className="text-center text-gray-400 mt-12 mb-8 bg-white/60 p-6 rounded-2xl border border-gray-200 shadow-sm relative z-10">
             <p className="font-sans">עוד לא נוספו פרקים בסיפור החיים.</p>
           </div>
        )}
        <div className="space-y-16 mt-12">
          {combinedEvents.map((event, index) => {
            if (event.isDecadeMarker) {
              return (
                <div key={event.id} className="relative h-8 flex items-center justify-end pr-[72px]">
                  <div className="absolute right-[34px] translate-x-1/2 h-6 px-3 rounded-full bg-[#FDFBF7] border-2 border-[#800000]/30 shadow-sm z-20 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-[#800000]/70 font-serif">{event.hebrew_year}</span>
                  </div>
                </div>
              );
            }

            const isNew = currentUser && (!event.read_by || !event.read_by.includes(currentUser));
            const isExpanded = expanded[event.id] !== undefined ? expanded[event.id] : isNew;

               return (
                 <motion.div 
                   id={`event-${event.id}`}
                   key={event.id}
                   initial={{ opacity: 0, y: 30, rotate: index % 2 === 0 ? -2 : 2 }}
                   whileInView={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? -1 : 1 }}
                   viewport={{ once: true, margin: "-50px" }}
                   transition={{ duration: 0.6, type: "spring" }}
                   className="relative pr-[72px] mb-12 last:mb-0"
                 >
                   {/* Year Bubble on Timeline */}
                   <div className="absolute right-[34px] translate-x-1/2 top-6 h-7 px-3 rounded-full bg-[#800000] border-2 border-[#FDFBF7] shadow-md z-20 flex items-center justify-center">
                     <span className="text-[11px] font-bold text-[#FDFBF7] tracking-wider font-serif">{event.hebrew_year}</span>
                   </div>

                   {/* Content Card (Scrapbook style) */}
                   <div className="bg-[#fffdf9] rounded-sm shadow-[2px_4px_16px_rgba(0,0,0,0.08)] border border-[#e8dfc8] relative group overflow-hidden">
                     {/* Tape mark top center */}
                     <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/40 backdrop-blur-sm border border-white/50 shadow-sm rotate-2 z-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.4) 55%, transparent 60%)' }}></div>
                     
                     {/* Header / Title (Click to toggle) */}
                     <div 
                       onClick={() => toggleExpand(event.id)}
                       className="p-5 pr-5 pb-4 cursor-pointer flex justify-between items-center bg-[#fdfaf2] hover:bg-[#faf4e6] transition-colors"
                     >
                       <h3 className="text-xl font-heading font-bold text-[#800000] pr-4">{event.title}</h3>
                       <div className="flex items-center gap-2">
                         {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                       </div>
                     </div>

                     {/* Admin Controls */}
                     {isStoryAdmin && (
                       <div className="absolute top-4 left-4 flex gap-2 transition-opacity z-30">
                         <button onClick={(e) => { e.stopPropagation(); onEditClick?.(event); }} className="p-1.5 bg-white rounded-full shadow-sm text-gray-500 hover:text-blue-500">
                           <Edit2 className="w-4 h-4" />
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); confirmDelete(event.id); }} className="p-1.5 bg-white rounded-full shadow-sm text-gray-500 hover:text-red-500">
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                     )}

                     {isNew && (
                       <div className="absolute top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md rotate-[10deg] shadow-lg z-30 animate-pulse font-sans">
                         חדש!
                       </div>
                     )}

                     <AnimatePresence>
                       {isExpanded && (
                         <motion.div
                           initial={{ height: 0, opacity: 0 }}
                           animate={{ height: 'auto', opacity: 1 }}
                           exit={{ height: 0, opacity: 0 }}
                           className="px-5 pb-5"
                         >
                           {event.content && (
                             <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-right font-sans mb-6 text-[15px]">
                               {event.content}
                             </p>
                           )}

                           {/* Media Gallery */}
                           {event.media_attachments && event.media_attachments.length > 0 && (
                             <div className="relative -mx-5 group/gallery bg-gray-50 py-4 border-t border-gray-100 overflow-hidden">
                               <div id={`gallery-${event.id}`} className="flex overflow-x-auto pb-2 snap-x snap-mandatory hide-scrollbar scroll-smooth items-center w-full">
                                 {event.media_attachments.map((media, mIdx) => (
                                   <div key={mIdx} className="w-full flex-shrink-0 snap-center px-5">
                                     <div className="bg-white p-2 pb-6 shadow-md border border-gray-200 rounded-sm transform rotate-1 hover:rotate-0 transition-transform cursor-pointer relative group/img max-w-full mx-auto">
                                       {media.type === 'image' ? (
                                         <img src={media.url} alt="זיכרון" className="max-h-80 w-full object-contain rounded-sm" />
                                       ) : (
                                         <video src={media.url} className="max-h-80 w-full object-contain rounded-sm" controls />
                                       )}
                                     </div>
                                   </div>
                                 ))}
                               </div>
                               {/* Navigation Chevrons */}
                               {event.media_attachments.length > 1 && (
                                 <>
                                   <button onClick={(e) => { e.stopPropagation(); scrollGallery(event.id, 'right'); }} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 p-1.5 rounded-full shadow-md text-gray-700 hover:text-black transition-opacity z-10">
                                     <ChevronRight className="w-5 h-5" />
                                   </button>
                                   <button onClick={(e) => { e.stopPropagation(); scrollGallery(event.id, 'left'); }} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 p-1.5 rounded-full shadow-md text-gray-700 hover:text-black transition-opacity z-10">
                                     <ChevronLeft className="w-5 h-5" />
                                   </button>
                                 </>
                               )}
                             </div>
                           )}
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </div>
                 </motion.div>
               );
             })}
           </div>
      </div>

      {isStoryAdmin && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={onAddClick}
          className="fixed bottom-24 left-6 z-50 bg-[#800000] text-white p-4 rounded-full shadow-xl hover:bg-[#600000] transition-colors"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
