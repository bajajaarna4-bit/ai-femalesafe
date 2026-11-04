'use client';

import { useState, useRef } from 'react';
import { Mic, Square, Play, Pause, Trash2, Download, ShieldCheck } from 'lucide-react';

interface AudioRecorderProps {
  onAudioRecorded?: (audioUrl: string) => void;
}

export default function AudioRecorder({ onAudioRecorded }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    setErrorMsg('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMsg('Microphone access is not supported on this browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedUrl(url);
        if (onAudioRecorded) {
          onAudioRecorded(url);
        }
        // stop tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      setErrorMsg('Microphone permission denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const deleteRecording = () => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
      setRecordingSeconds(0);
      setIsPlaying(false);
    }
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current && recordedUrl) {
      const audio = new Audio(recordedUrl);
      audio.onended = () => setIsPlaying(false);
      audioPlayerRef.current = audio;
    }

    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
        setIsPlaying(false);
      } else {
        audioPlayerRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const formatSecs = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Discreet Audio Evidence
            </h3>
            <p className="text-[11px] text-slate-500">
              Records ambient surroundings securely
            </p>
          </div>
        </div>

        {isRecording && (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-xs font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span>REC {formatSecs(recordingSeconds)}</span>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* Recording status or waveform */}
      <div className="flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
        {isRecording ? (
          <div className="flex items-center gap-1.5 h-8">
            {[40, 70, 90, 60, 30, 85, 45, 95, 60, 40].map((h, i) => (
              <span
                key={i}
                className="w-1.5 bg-rose-500 rounded-full animate-pulse"
                style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        ) : recordedUrl ? (
          <div className="flex items-center justify-between w-full px-2">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlayback}
                className="w-10 h-10 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <div className="text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Audio Recording Captured
                </span>
                <p className="text-[11px] text-slate-500">Duration: {formatSecs(recordingSeconds)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={recordedUrl}
                download={`saathi-evidence-${Date.now()}.webm`}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                title="Download Audio"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={deleteRecording}
                className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                title="Delete Audio"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-2 text-slate-500 dark:text-slate-400 text-xs">
            Tap Start Recording to securely capture ambient audio for incident log.
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div>
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Mic className="w-4 h-4" />
            <span>Start Ambient Audio Recording</span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white shadow-md flex items-center justify-center gap-2 animate-pulse"
          >
            <Square className="w-4 h-4" />
            <span>Stop & Save Evidence</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Audio is saved locally & packaged with SOS if triggered.</span>
      </div>
    </div>
  );
}

