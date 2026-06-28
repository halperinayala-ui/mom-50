import { Plane } from 'lucide-react';
import { motion } from 'framer-motion';

export function BoardingPassScreen({ userName }: { userName: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-8 min-h-[70vh]">
      
      {/* Boarding Pass Container */}
      <motion.div 
        initial={{ y: 50, opacity: 0, rotateX: -10 }}
        animate={{ y: 0, opacity: 1, rotateX: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-[#D4AF37]/30"
      >
        {/* Top Section - Airline & Flight */}
        <div className="bg-[#800000] text-[#FDFBF7] p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="flex justify-between items-center relative z-10">
            <div>
              <p className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase mb-1">חברת תעופה</p>
              <h2 className="text-xl font-heading font-bold">VIP 50 AIRLINES</h2>
            </div>
            <Plane className="w-8 h-8 text-[#D4AF37] opacity-80" />
          </div>
        </div>

        {/* Middle Section - Route */}
        <div className="p-6 bg-white relative">
          
          {/* Perforated lines */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#FDFBF7] rounded-full shadow-inner border-r border-[#D4AF37]/20"></div>
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#FDFBF7] rounded-full shadow-inner border-l border-[#D4AF37]/20"></div>
          
          <div className="border-b-2 border-dashed border-gray-200 absolute top-1/2 left-4 right-4 -translate-y-1/2"></div>

          <div className="flex justify-between items-center relative z-10 mb-8">
            <div className="text-right">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">From</p>
              <h3 className="text-3xl font-black text-[#800000] font-heading">49</h3>
              <p className="text-sm font-medium text-gray-600 mt-1">שנות עשייה</p>
            </div>
            
            <div className="flex flex-col items-center px-4">
              <Plane className="w-6 h-6 text-[#D4AF37] mb-2 rotate-90" />
              <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Direct</div>
            </div>

            <div className="text-left">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">To</p>
              <h3 className="text-3xl font-black text-[#800000] font-heading">50</h3>
              <p className="text-sm font-medium text-gray-600 mt-1">שנת היובל</p>
            </div>
          </div>
          
          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 relative z-10 mt-8 pt-4">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                 {userName === 'אבא' ? 'נוסע' : 'נוסעת'}
              </p>
              <p className="font-bold text-[#4a4843]">{userName === 'אבא' ? 'אבא' : 'אמא'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                 מחלקה
              </p>
              <p className="font-bold text-[#4a4843]">ראשונה (VIP)</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                 יעד
              </p>
              <p className="font-bold text-[#4a4843]">כה יתן וכה יוסיף</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                 טיסה
              </p>
              <p className="font-bold text-[#4a4843]">MAZAL-TOV</p>
            </div>
          </div>
        </div>

        {/* Bottom Section - Barcode */}
        <div className="bg-[#fcfaf5] p-6 text-center border-t border-gray-100 flex flex-col items-center">
          <p className="text-xs text-[#D4AF37] font-bold tracking-widest uppercase mb-3">Happy Birthday</p>
          <div className="w-full h-16 opacity-60 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPgo8cGF0aCBkPSJNMCAwaDJ2MTAwSDB6IE01IDBoMXYxMDBINXogTTEwIDBoM3YxMDBIMTB6IE0xNiAwaDV2MTAwSDE2eiBNMjQgMGgydjEwMEgyNHogTTI4IDBoNHYxMDBIMjh6IE0zNCAwaDF2MTAwSDM0eiBNMzggMGgzdjEwMEgzOHogTTQ0IDBoNnYxMDBINDR6IE01MiAwaDF2MTAwSDUyeiBNNTYgMGgzdjEwMEg1NnogTTYyIDBoNHYxMDBINjJ6IE02OCAwaDJ2MTAwSDY4eiBNNzIgMGgzdjEwMEg3MnoiIGZpbGw9IiMzMzMiLz4KPC9zdmc+')] bg-repeat-x bg-contain"></div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center px-8"
      >
        <p className="text-[#800000] font-bold text-xl font-heading mb-2">טיסה נעימה ומסע מרומם!</p>
      </motion.div>

    </div>
  );
}
