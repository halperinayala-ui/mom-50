import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, X, Download, Gift } from 'lucide-react';
import { BoardingPassScreen } from './BoardingPassScreen';
import { toast } from 'react-hot-toast';
import * as htmlToImage from 'html-to-image';
import Confetti from 'react-confetti';
import { supabase } from '../lib/supabase';

const BalloonSVG = ({ color }: { color: string }) => (
  <svg viewBox="0 0 100 180" className="w-full h-full drop-shadow-md">
    <path
      d="M50 0 C10 0, 0 30, 0 50 C0 80, 30 100, 50 100 C70 100, 100 80, 100 50 C100 30, 90 0, 50 0 Z"
      fill={color}
      opacity="0.4"
    />
    <path
      d="M30 15 C15 25, 10 40, 10 50 C10 45, 15 30, 30 20 Z"
      fill="white"
      opacity="0.3"
    />
    <polygon points="45 100, 55 100, 60 110, 40 110" fill={color} opacity="0.5" />
    <path d="M50 110 Q35 130, 50 150 T50 180" fill="none" stroke="#D4AF37" strokeWidth="2" opacity="0.4" />
  </svg>
);

export function BirthdayScreen({ userName }: { userName: string | null }) {
  const [showBoardingPass, setShowBoardingPass] = useState(false);
  const [showSpecialGreeting, setShowSpecialGreeting] = useState(false);
  const [isGiftRevealed, setIsGiftRevealed] = useState(false);
  
  const [showConfetti, setShowConfetti] = useState(true);

  // Check initial state and subscribe to changes
  useEffect(() => {
    // Check if revealed initially
    const checkReveal = async () => {
      const { data } = await supabase.from('greetings').select('id').eq('content', 'REVEAL_GIFT_50_MOM_SECRET_CODE').limit(1);
      if (data && data.length > 0) {
        setIsGiftRevealed(true);
        if (localStorage.getItem('hasSeenSpecialGreeting') !== 'true') {
          setShowSpecialGreeting(true);
        }
      }
    };
    checkReveal();

    // Listen for the reveal event in real-time
    const channel = supabase.channel('reveal_gift')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'greetings',
        filter: "content=eq.REVEAL_GIFT_50_MOM_SECRET_CODE"
      }, () => {
        setIsGiftRevealed(true);
        if (localStorage.getItem('hasSeenSpecialGreeting') !== 'true') {
          setShowSpecialGreeting(true);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Stop the confetti generator after a few seconds, letting existing pieces fall
  useEffect(() => {
    if (showSpecialGreeting) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSpecialGreeting]);

  const greetingRef = useRef<HTMLDivElement>(null);

  const closeSpecialGreeting = () => {
    setShowSpecialGreeting(false);
    localStorage.setItem('hasSeenSpecialGreeting', 'true');
  };

  const handleDownloadSpecialGreeting = async () => {
    if (!greetingRef.current) return;
    
    try {
      // Temporarily hide the buttons for the screenshot
      const buttonsEl = document.getElementById('greeting-buttons');
      if (buttonsEl) buttonsEl.style.display = 'none';

      const dataUrl = await htmlToImage.toJpeg(greetingRef.current, { 
        quality: 1.0, 
        pixelRatio: 3,
        backgroundColor: '#FDFBF7',
        style: {
          transform: 'none',
          boxShadow: 'none',
          margin: '0',
        }
      });
      
      if (buttonsEl) buttonsEl.style.display = 'flex';

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'ברכה_לאבא_ואמא.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success('הברכה ירדה לגלריה!');
      closeSpecialGreeting();
    } catch (error) {
      console.error('Download failed', error);
      toast.error('ההורדה נכשלה. נסו לצלם מסך במקום.');
    }
  };

  return (
    <div className="h-full min-h-[70vh] flex flex-col items-center justify-center p-6 relative overflow-hidden font-serif">
      <style>
        {`
          @keyframes floatUp {
            0% { transform: translateY(110vh) rotate(-10deg); }
            100% { transform: translateY(-30vh) rotate(10deg); }
          }
          @keyframes floatDust {
            0% { transform: translateY(110vh); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-10vh); opacity: 0; }
          }
          .balloon-anim {
            animation: floatUp 15s linear infinite;
          }
          .dust-anim {
            animation: floatDust 12s linear infinite;
          }
        `}
      </style>
      
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-[#800000]/5 rounded-full blur-3xl"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="bg-white/60 backdrop-blur-md rounded-[3rem] p-10 shadow-2xl border border-white/80 text-center relative overflow-hidden">
          
          {/* Inner subtle glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/5 to-transparent"></div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative z-10"
          >
            <h1 className="text-5xl font-heading font-bold text-[#800000] mb-4 leading-tight drop-shadow-sm">
              מזל טוב<br/>אמא!
            </h1>
            
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto my-6"></div>
            
            <p className="text-xl text-gray-700 font-medium mb-2">
              יום הולדת 50 שמח 🎉
            </p>
            <p className="text-sm text-gray-500 italic">
              אוהבים אותך המון!
            </p>
          </motion.div>
        </div>
      </motion.div>

      <div className="relative z-10 mt-12 flex flex-col items-center gap-4">
        {isGiftRevealed && (
          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => {
              setShowSpecialGreeting(true);
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 5000);
            }}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#800000] to-[#990000] text-white rounded-full shadow-lg shadow-[#800000]/20 hover:shadow-[#800000]/40 transition-all font-medium"
          >
            <Gift className="w-4 h-4" />
            <span>ברכתנו שלוחה</span>
          </motion.button>
        )}

        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          onClick={() => setShowBoardingPass(true)}
          className="flex items-center gap-1.5 text-[#800000]/50 hover:text-[#800000] transition-colors text-xs font-medium"
        >
          <Ticket className="w-3.5 h-3.5" />
          <span className="underline underline-offset-4 decoration-[#D4AF37]/40">כרטיס טיסה למזכרת</span>
        </motion.button>
      </div>

      {/* Floating Balloons Animation */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={`balloon-${i}`}
            className="absolute w-16 h-28 balloon-anim"
            style={{
              left: `${Math.random() * 80 + 10}vw`,
              animationDuration: `${Math.random() * 10 + 12}s`,
              animationDelay: `-${Math.random() * 20}s`, // Negative delay makes them appear immediately
              transform: `scale(${Math.random() * 0.4 + 0.8})`
            }}
          >
            <BalloonSVG color="#D4AF37" />
          </div>
        ))}
        {/* Colorful floating circles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`circle-${i}`}
            className="absolute w-2 h-2 rounded-full blur-[1px] dust-anim"
            style={{
              left: `${Math.random() * 100}vw`,
              animationDuration: `${Math.random() * 8 + 10}s`,
              animationDelay: `-${Math.random() * 15}s`, // Negative delay
              backgroundColor: ['#D4AF37', '#800000', '#3b82f6', '#10b981', '#f43f5e', '#a855f7'][Math.floor(Math.random() * 6)],
              opacity: Math.random() * 0.3 + 0.1
            }}
          />
        ))}

        {/* Little floating gold dust particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={`dust-${i}`}
            className="absolute w-2 h-2 rounded-full bg-[#D4AF37] blur-[1px] dust-anim"
            style={{
              left: `${Math.random() * 100}vw`,
              animationDuration: `${Math.random() * 10 + 10}s`,
              animationDelay: `-${Math.random() * 15}s`, // Negative delay
              opacity: Math.random() * 0.5 + 0.3
            }}
          />
        ))}
      </div>

      {/* Boarding Pass Modal */}
      <AnimatePresence>
        {showBoardingPass && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-sm w-full bg-transparent"
            >
              <button 
                onClick={() => setShowBoardingPass(false)}
                className="absolute -top-12 left-1/2 -translate-x-1/2 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors backdrop-blur-md z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="bg-[#FDFBF7] rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                 <BoardingPassScreen userName={userName} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Special Greeting Full Screen */}
      <AnimatePresence>
        {showSpecialGreeting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-50 bg-[#FDFBF7] p-4 overflow-y-auto"
          >
            {/* Confetti with matching colors */}
            <div className="fixed inset-0 pointer-events-none z-[60]">
              <Confetti 
                width={typeof window !== 'undefined' ? window.innerWidth : 300}
                height={typeof window !== 'undefined' ? window.innerHeight : 800}
                colors={['#800000', '#9e112e', '#c29b4e', '#D4AF37', '#e6b95c', '#FDFBF7']}
                recycle={showConfetti}
                numberOfPieces={showConfetti ? 250 : 0}
                gravity={0.15}
              />
            </div>
            
            <div className="min-h-full flex flex-col items-center py-8">
              <div 
                ref={greetingRef}
                className="w-full max-w-lg bg-[#FDFBF7] rounded-xl flex flex-col items-stretch justify-start relative text-[#800000] p-6 sm:p-10"
              >
               {/* Background watermark */}
               <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                 <img src="/logo.png" alt="" className="w-64 h-64 object-contain" />
               </div>
               
               <div className="relative z-10 font-sans">
                 {/* Top Logo */}
                 <div className="flex justify-center mb-6">
                   <img src="/logo.png" alt="לוגו" className="h-20 object-contain drop-shadow-sm" />
                 </div>

                 <h2 className="text-3xl font-heading font-bold mb-8 text-center text-[#9e112e]">אבא ואמא יקרים ואהובים,</h2>
                 
                 <p className="text-lg leading-relaxed mb-6 font-medium text-gray-800">
                   במועד חגיגי, משמעותי ומיוחד בחייכם ובחיינו, במלאות יובל שנים, ברכתנו שלוחה בזאת:
                 </p>
                 
                 <div className="space-y-5 text-base leading-relaxed mb-10 text-gray-800">
                   <p><strong className="text-2xl font-heading text-[#c29b4e] ml-1">כה</strong>- כפי מה שכתוב כאן בפנים, וששפתותיכם מרחשות כבר יובל שנים, בתפילה, תחינה ובקשה,</p>
                   
                   <p><strong className="text-2xl font-heading text-[#c29b4e] ml-1">יתן</strong>הקב"ה מידו הפתוחה, הקדושה הגדושה והרחבה, בשפע נחת, בריאות והצלחה, והכל בהרחבה בלתי מוגבלת, כפי שיכול להינתן ממי שאליו מיחלות עיננו,</p>
                   
                   <p><strong className="text-2xl font-heading text-[#c29b4e] ml-1">ה'</strong>- טבע הטוב האינסופי, שמאיתו הכל, ושמעולם לא העזיב מכם את רחמיו וחסדיו.</p>
                   
                   <p><strong className="text-2xl font-heading text-[#c29b4e] ml-1">וכה</strong>בכפליים לתושיה, תבורכו במשנה ברכות, ובאופן גלוי, ברור, נהיר, מוחשי ונוכח שאפשר להראות באצבע,</p>
                   
                   <p><strong className="text-2xl font-heading text-[#c29b4e] ml-1">יוסיף</strong>ה' עליכם ככם אלף פעמים, ויברך אתכם כאשר דבר לכם. בשפע עד בלי די, בגשמיות וברוחניות, ונחת אמיתי מכולנו כאחד, באור פני מלך חיים.</p>
                 </div>
                 
                 <div className="mt-8 text-center">
                   <p className="text-lg font-medium text-gray-700">אוהבים ומעריצים,</p>
                   <p className="text-4xl font-heading font-bold text-[#c29b4e] mt-2">הילדים.</p>
                 </div>
               </div>

               {/* Buttons that will be hidden during download */}
               <div id="greeting-buttons" className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-20">
                 <button 
                   onClick={handleDownloadSpecialGreeting}
                   className="flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#800000] to-[#9e112e] text-white font-bold rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all w-full sm:w-auto"
                 >
                   <Download className="w-5 h-5" />
                   <span>הורדה</span>
                 </button>
                 
                 {localStorage.getItem('hasSeenSpecialGreeting') === 'true' && (
                   <button 
                     onClick={closeSpecialGreeting}
                     className="flex items-center justify-center px-8 py-3.5 bg-white text-gray-500 font-bold rounded-full shadow-md border border-gray-100 hover:bg-gray-50 transition-all w-full sm:w-auto"
                   >
                     <span>סגירה</span>
                   </button>
                 )}
               </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
