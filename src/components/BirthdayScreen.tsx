import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, X } from 'lucide-react';
import { BoardingPassScreen } from './BoardingPassScreen';

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

      <motion.button 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        onClick={() => setShowBoardingPass(true)}
        className="relative z-10 mt-12 flex items-center gap-1.5 text-[#800000]/50 hover:text-[#800000] transition-colors text-xs font-medium"
      >
        <Ticket className="w-3.5 h-3.5" />
        <span className="underline underline-offset-4 decoration-[#D4AF37]/40">כרטיס טיסה למזכרת</span>
      </motion.button>

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

    </div>
  );
}
