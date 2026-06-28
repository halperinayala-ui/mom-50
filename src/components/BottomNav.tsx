import { Plane, Gift, BookOpen } from 'lucide-react';

export type ActiveScreen = 'boarding' | 'greetings' | 'journal';

export function BottomNav({ 
  activeScreen, 
  onChange 
}: { 
  activeScreen: ActiveScreen, 
  onChange: (screen: ActiveScreen) => void 
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#FDFBF7] border-t border-[#D4AF37]/20 p-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <button 
          onClick={() => onChange('boarding')}
          className={`flex flex-col items-center p-2 transition-colors ${activeScreen === 'boarding' ? 'text-[#800000]' : 'text-gray-400 hover:text-[#D4AF37]'}`}
        >
          <Plane className={`w-6 h-6 mb-1 ${activeScreen === 'boarding' ? 'fill-current opacity-20' : ''}`} />
          <span className="text-[10px] font-bold tracking-wider">כרטיס טיסה</span>
        </button>

        <button 
          onClick={() => onChange('journal')}
          className={`flex flex-col items-center p-2 transition-colors ${activeScreen === 'journal' ? 'text-[#800000]' : 'text-gray-400 hover:text-[#D4AF37]'}`}
        >
          <BookOpen className={`w-6 h-6 mb-1 ${activeScreen === 'journal' ? 'fill-current opacity-20' : ''}`} />
          <span className="text-[10px] font-bold tracking-wider">יומן מסע</span>
        </button>

        <button 
          onClick={() => onChange('greetings')}
          className={`flex flex-col items-center p-2 transition-colors ${activeScreen === 'greetings' ? 'text-[#800000]' : 'text-gray-400 hover:text-[#D4AF37]'}`}
        >
          <Gift className={`w-6 h-6 mb-1 ${activeScreen === 'greetings' ? 'fill-current opacity-20' : ''}`} />
          <span className="text-[10px] font-bold tracking-wider">ברכות</span>
        </button>
      </div>
    </div>
  );
}
