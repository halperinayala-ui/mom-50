import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Image as ImageIcon, Save } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { supabase } from '../lib/supabase';
import type { LifeStoryEvent } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

const HEBREW_YEARS = [
  { year: 1976, label: 'תשל"ו (1976)' }, { year: 1977, label: 'תשל"ז (1977)' }, { year: 1978, label: 'תשל"ח (1978)' }, { year: 1979, label: 'תשל"ט (1979)' }, { year: 1980, label: 'תש"מ (1980)' },
  { year: 1981, label: 'תשמ"א (1981)' }, { year: 1982, label: 'תשמ"ב (1982)' }, { year: 1983, label: 'תשמ"ג (1983)' }, { year: 1984, label: 'תשמ"ד (1984)' }, { year: 1985, label: 'תשמ"ה (1985)' },
  { year: 1986, label: 'תשמ"ו (1986)' }, { year: 1987, label: 'תשמ"ז (1987)' }, { year: 1988, label: 'תשמ"ח (1988)' }, { year: 1989, label: 'תשמ"ט (1989)' }, { year: 1990, label: 'תש"נ (1990)' },
  { year: 1991, label: 'תשנ"א (1991)' }, { year: 1992, label: 'תשנ"ב (1992)' }, { year: 1993, label: 'תשנ"ג (1993)' }, { year: 1994, label: 'תשנ"ד (1994)' }, { year: 1995, label: 'תשנ"ה (1995)' },
  { year: 1996, label: 'תשנ"ו (1996)' }, { year: 1997, label: 'תשנ"ז (1997)' }, { year: 1998, label: 'תשנ"ח (1998)' }, { year: 1999, label: 'תשנ"ט (1999)' }, { year: 2000, label: 'תש"ס (2000)' },
  { year: 2001, label: 'תשס"א (2001)' }, { year: 2002, label: 'תשס"ב (2002)' }, { year: 2003, label: 'תשס"ג (2003)' }, { year: 2004, label: 'תשס"ד (2004)' }, { year: 2005, label: 'תשס"ה (2005)' },
  { year: 2006, label: 'תשס"ו (2006)' }, { year: 2007, label: 'תשס"ז (2007)' }, { year: 2008, label: 'תשס"ח (2008)' }, { year: 2009, label: 'תשס"ט (2009)' }, { year: 2010, label: 'תש"ע (2010)' },
  { year: 2011, label: 'תשע"א (2011)' }, { year: 2012, label: 'תשע"ב (2012)' }, { year: 2013, label: 'תשע"ג (2013)' }, { year: 2014, label: 'תשע"ד (2014)' }, { year: 2015, label: 'תשע"ה (2015)' },
  { year: 2016, label: 'תשע"ו (2016)' }, { year: 2017, label: 'תשע"ז (2017)' }, { year: 2018, label: 'תשע"ח (2018)' }, { year: 2019, label: 'תשע"ט (2019)' }, { year: 2020, label: 'תש"פ (2020)' },
  { year: 2021, label: 'תשפ"א (2021)' }, { year: 2022, label: 'תשפ"ב (2022)' }, { year: 2023, label: 'תשפ"ג (2023)' }, { year: 2024, label: 'תשפ"ד (2024)' }, { year: 2025, label: 'תשפ"ה (2025)' },
  { year: 2026, label: 'תשפ"ו (2026)' }
];

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  initialEvent?: LifeStoryEvent;
}

export function AddStoryEventModal({ onClose, onSuccess, initialEvent }: Props) {
  const [hebrewYear, setHebrewYear] = useState(initialEvent?.hebrew_year || '');
  const [yearIndex, setYearIndex] = useState<number | ''>(initialEvent?.year_index || '');
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [content, setContent] = useState(initialEvent?.content || '');
  const [files, setFiles] = useState<File[]>([]);
  const [existingMediaUrls, setExistingMediaUrls] = useState<{url: string, type: 'image'|'video'}[]>(initialEvent?.media_attachments || []);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const uploadFiles = async () => {
    const uploadedUrls: { url: string, type: 'image' | 'video' }[] = [];
    
    for (const file of files) {
      const isVideo = file.type.startsWith('video/');
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `life_story/${fileName}`;

      let fileToUpload = file;
      if (!isVideo) {
        try {
          fileToUpload = await imageCompression(file, {
            maxSizeMB: 0.8,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          });
        } catch (e) {
          console.error('Image compression failed', e);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('greetings_media')
        .upload(filePath, fileToUpload);

      if (uploadError) {
        if (uploadError.message.includes('maximum allowed size')) {
          throw new Error('אחד הקבצים גדול מדי. אנא הגדילו את המגבלה (Maximum allowed file size) ב-Supabase.');
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('greetings_media')
        .getPublicUrl(filePath);

      uploadedUrls.push({ url: publicUrl, type: isVideo ? 'video' : 'image' });
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !hebrewYear || yearIndex === '') {
      toast.error('נא למלא שנת יובל וכותרת');
      return;
    }

    setLoading(true);
    try {
      let mediaUrls = [...existingMediaUrls];
      if (files.length > 0) {
        const newUrls = await uploadFiles();
        mediaUrls = [...mediaUrls, ...newUrls];
      }

      if (initialEvent) {
        const { error } = await supabase
          .from('life_story_events')
          .update({
            title,
            content,
            hebrew_year: hebrewYear,
            year_index: Number(yearIndex),
            media_attachments: mediaUrls,
          })
          .eq('id', initialEvent.id);

        if (error) throw error;
        toast.success('הפרק עודכן בהצלחה!');
      } else {
        const { data: newRow, error } = await supabase
          .from('life_story_events')
          .insert({
            title,
            content,
            hebrew_year: hebrewYear,
            year_index: Number(yearIndex),
            media_attachments: mediaUrls,
            read_by: ['אברמי']
          })
          .select('id')
          .single();

        if (error) throw error;

        // Notify all users about the new chapter
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            title: 'פרק חדש בסיפור חיים! 📖',
            body: `פרק חדש מחכה לך: "${title}"`,
            sender: 'מערכת',
            url: `/?tab=lifestory&id=event-${newRow.id}`
          })
        }).catch(err => console.error('Error triggering push notification', err));

        toast.success('הפרק נוסף בהצלחה!');
      }

      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error('שגיאה: ' + (err.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-[#FDFBF7] rounded-3xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="bg-[#800000] text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-heading font-bold">{initialEvent ? 'עריכת פרק' : 'הוספת פרק בסיפור חיים'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[#4a4843] font-bold mb-2">בחר/י את שנת האירוע</label>
              <select
                value={yearIndex}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : '';
                  setYearIndex(val);
                  if (val !== '') {
                    const option = HEBREW_YEARS.find(hy => hy.year === val);
                    if (option) setHebrewYear(option.label.split(' ')[0]); // e.g. "תשל"ו (1976)" -> "תשל"ו"
                  } else {
                    setHebrewYear('');
                  }
                }}
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-[#D4AF37] outline-none text-right font-sans bg-white"
                dir="rtl"
                required
              >
                <option value="">-- בחר/י שנה --</option>
                {HEBREW_YEARS.map(hy => (
                  <option key={hy.year} value={hy.year}>{hy.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#4a4843] font-bold mb-2">כותרת התקופה</label>
              <input 
                type="text"
                placeholder="לדוג': תקופת הלימודים, החתונה..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-[#D4AF37] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[#4a4843] font-bold mb-2">תיאור / סיפור</label>
              <textarea 
                placeholder="ספר קצת על התקופה הזו..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-[#D4AF37] outline-none min-h-[120px] resize-none"
              />
            </div>

            <div>
              <label className="block text-[#4a4843] font-bold mb-2">תמונות וסרטונים (אפשר להוסיף עוד ועוד)</label>
              
              {existingMediaUrls.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {existingMediaUrls.map((media, idx) => (
                    <div key={idx} className="relative w-20 h-20 flex-shrink-0">
                      {media.type === 'image' ? (
                         <img src={media.url} className="w-full h-full object-cover rounded-md" />
                      ) : (
                         <video src={media.url} className="w-full h-full object-cover rounded-md" />
                      )}
                      <button 
                        type="button"
                        onClick={() => setExistingMediaUrls(existingMediaUrls.filter((_, i) => i !== idx))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {files.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 mt-4">
                  {files.map((file, idx) => {
                    const objectUrl = URL.createObjectURL(file);
                    return (
                      <div key={idx} className="relative w-20 h-20 flex-shrink-0">
                        {file.type.startsWith('image/') ? (
                           <img src={objectUrl} className="w-full h-full object-cover rounded-md border border-gray-200" />
                        ) : (
                           <video src={objectUrl} className="w-full h-full object-cover rounded-md border border-gray-200" />
                        )}
                        <button 
                          type="button"
                          onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 z-10"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors mt-2"
              >
                <div className="flex flex-col items-center">
                  {files.length > 0 ? (
                    <Upload className="w-10 h-10 text-[#800000] mb-2" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                  )}
                  <p className="font-bold text-gray-600">
                    {files.length > 0 ? 'לחץ להוספת תמונות/סרטונים נוספים' : 'לחץ להעלאת תמונות וסרטונים'}
                  </p>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple 
                accept="image/*,video/*" 
                className="hidden"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#800000] text-white font-bold py-4 rounded-xl hover:bg-[#600000] transition-colors flex items-center justify-center gap-2 mt-4 shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <>
                  {initialEvent ? <Save className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                  <span>{initialEvent ? 'שמור שינויים' : 'העלה פרק לסיפור החיים'}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
