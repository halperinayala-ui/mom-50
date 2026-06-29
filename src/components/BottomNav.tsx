import { Plane, Gift, BookOpen, Film, PartyPopper } from 'lucide-react';

export type ActiveScreen = 'boarding' | 'greetings' | 'journal' | 'lifestory';

export function BottomNav({ 
  activeScreen, 
  onChange,
  hasUnreadLifeStory,
  hasUnreadGreetings,
  hasUnreadJournal,
  isBirthdayActive
}: { 
  activeScreen: ActiveScreen, 
  onChange: (screen: ActiveScreen) => void,
  hasUnreadLifeStory?: boolean,
  hasUnreadGreetings?: boolean,
  hasUnreadJournal?: boolean,
  isBirthdayActive?: boolean
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#FDFBF7] border-t border-[#D4AF37]/20 p-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <button 
          onClick={() => onChange('boarding')}
          className={`flex flex-col items-center p-2 transition-colors ${activeScreen === 'boarding' ? 'text-[#800000]' : 'text-gray-400 hover:text-[#D4AF37]'}`}
        >
          {isBirthdayActive ? (
            <PartyPopper className={`w-6 h-6 mb-1 ${activeScreen === 'boarding' ? 'fill-current opacity-20' : ''}`} />
          ) : (
            <Plane className={`w-6 h-6 mb-1 ${activeScreen === 'boarding' ? 'fill-current opacity-20' : ''}`} />
          )}
          <span className="text-[10px] font-bold tracking-wider">{isBirthdayActive ? '50!' : 'כרטיס טיסה'}</span>
        </button>

        <button 
          onClick={() => onChange('journal')}
          className={`relative flex flex-col items-center p-2 transition-colors ${activeScreen === 'journal' ? 'text-[#800000]' : 'text-gray-400 hover:text-[#D4AF37]'}`}
        >
          <div className="relative">
            <BookOpen className={`w-6 h-6 mb-1 ${activeScreen === 'journal' ? 'fill-current opacity-20' : ''}`} />
            {hasUnreadJournal && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#FDFBF7]"></span>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-wider">יומן מסע</span>
        </button>

        <button 
          onClick={() => onChange('greetings')}
          className={`relative flex flex-col items-center p-2 transition-colors ${activeScreen === 'greetings' ? 'text-[#800000]' : 'text-gray-400 hover:text-[#D4AF37]'}`}
        >
          <div className="relative">
            <Gift className={`w-6 h-6 mb-1 ${activeScreen === 'greetings' ? 'fill-current opacity-20' : ''}`} />
            {hasUnreadGreetings && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#FDFBF7]"></span>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-wider">ברכות</span>
        </button>

        <button 
          onClick={() => onChange('lifestory')}
          className={`relative flex flex-col items-center p-2 transition-colors ${activeScreen === 'lifestory' ? 'text-[#800000]' : 'text-gray-400 hover:text-[#D4AF37]'}`}
        >
          <div className="relative">
            <Film className={`w-6 h-6 mb-1 ${activeScreen === 'lifestory' ? 'fill-current opacity-20' : ''}`} />
            {hasUnreadLifeStory && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-wider">סיפור חיים</span>
        </button>
      </div>
    </div>
  );
}
