import { useState, useRef } from 'react';
import { Mic, Square, RotateCcw } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onClear: () => void;
}

export default function AudioRecorder({ onRecordingComplete, onClear }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecordingComplete(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      setRecordingTime(0);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('לא הצלחנו לגשת למיקרופון. אנא ודאי שיש הרשאות בדפדפן.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const clearRecording = () => {
    setAudioUrl(null);
    setRecordingTime(0);
    onClear();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (audioUrl) {
    return (
      <div className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <audio src={audioUrl} controls className="w-full" />
        <button 
          onClick={(e) => { e.preventDefault(); clearRecording(); }}
          className="text-red-500 text-sm flex items-center gap-1 hover:text-red-700"
        >
          <RotateCcw className="w-4 h-4" />
          הקלטה מחדש
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
      <div className={`text-2xl font-mono ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
        {formatTime(recordingTime)}
      </div>
      
      {!isRecording ? (
        <button
          onClick={(e) => { e.preventDefault(); startRecording(); }}
          className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
        >
          <Mic className="w-8 h-8" />
        </button>
      ) : (
        <button
          onClick={(e) => { e.preventDefault(); stopRecording(); }}
          className="w-16 h-16 rounded-full bg-gray-800 text-white flex items-center justify-center shadow-lg hover:bg-gray-900 transition-colors"
        >
          <Square className="w-6 h-6" fill="currentColor" />
        </button>
      )}
      
      <p className="text-sm text-gray-500">
        {isRecording ? 'מקליט... לחצי לעצירה' : 'לחצי להקלטה'}
      </p>
    </div>
  );
}
