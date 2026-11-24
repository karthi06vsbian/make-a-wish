import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Play, Pause, Trash2, RotateCcw, AlertCircle, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { VoiceNoteMeta } from '../types';

interface VoiceRecorderProps {
  onAudioReady: (meta: VoiceNoteMeta) => void;
  onAudioRemoved: () => void;
  maxDurationSeconds?: number; // default 180 (3 minutes)
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onAudioReady,
  onAudioRemoved,
  maxDurationSeconds = 180,
}) => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Determine supported audio mime type
  const getSupportedMimeType = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/aac',
    ];
    for (const type of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  };

  // Draw real-time audio waveform during recording
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const renderFrame = () => {
      animationFrameRef.current = requestAnimationFrame(renderFrame);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / 32) - 2;
      let x = 0;

      for (let i = 0; i < 32; i++) {
        const index = Math.floor(i * (bufferLength / 32));
        const barHeight = Math.max(4, (dataArray[index] / 255) * canvas.height * 0.9);

        // Warm gold gradient
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#D97706');
        gradient.addColorStop(0.5, '#F59E0B');
        gradient.addColorStop(1, '#FDE68A');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, (canvas.height - barHeight) / 2, barWidth, barHeight, 3);
        ctx.fill();

        x += barWidth + 2;
      }
    };

    renderFrame();
  }, []);

  // Cleanup active audio/stream
  const cleanupRecording = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  // Stop recording handler
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      cleanupRecording();
    }
  }, [isRecording, cleanupRecording]);

  // Start recording
  const startRecording = async () => {
    setErrorMessage(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Audio recording is not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Web Audio Analyser setup
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mimeType = getSupportedMimeType();
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalMime = mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: finalMime });

        // Max 15MB file validation
        if (blob.size > 15 * 1024 * 1024) {
          setErrorMessage('Audio file size exceeds 15MB. Please keep recording concise.');
          return;
        }

        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setAudioUrl(url);

        onAudioReady({
          storagePath: `voice_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.webm`,
          fileSizeBytes: blob.size,
          durationSeconds: duration,
          mimeType: finalMime,
          audioBlob: blob,
          previewUrl: url,
        });
      };

      recorder.start(250); // Slice data every 250ms
      setIsRecording(true);
      setDuration(0);

      // Start timer
      let secs = 0;
      timerIntervalRef.current = window.setInterval(() => {
        secs += 1;
        setDuration(secs);
        if (secs >= maxDurationSeconds) {
          stopRecording();
        }
      }, 1000);

      // Start Visualizer
      drawWaveform();
    } catch (err: unknown) {
      console.error('Microphone error:', err);
      const msg = err instanceof Error ? err.message : 'Could not access microphone.';
      setErrorMessage(
        msg.includes('Permission') || msg.includes('NotAllowedError')
          ? 'Microphone permission was denied. Please allow microphone access in your browser settings to record your voice.'
          : 'Unable to start audio recording: ' + msg
      );
      cleanupRecording();
    }
  };

  // Playback handlers
  const togglePlay = () => {
    if (!audioElementRef.current) return;
    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioElementRef.current) {
      setCurrentTime(audioElementRef.current.currentTime);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Delete & reset recording
  const handleDelete = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setRecordedBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setErrorMessage(null);
    onAudioRemoved();
  };

  useEffect(() => {
    return () => {
      cleanupRecording();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl, cleanupRecording]);

  const percentageLeft = Math.max(0, 100 - (duration / maxDurationSeconds) * 100);

  return (
    <div className="w-full rounded-2xl glass-panel p-6 border border-gold-500/20 space-y-4">
      {/* Error alert */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-950/50 border border-red-500/30 text-red-200 text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* STATE 1: IDLE / NOT RECORDED YET */}
      {!isRecording && !recordedBlob && (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-500/20 via-amber-600/10 to-midnight-900 border border-gold-500/30 flex items-center justify-center shadow-glow-gold group cursor-pointer">
              <button
                type="button"
                onClick={startRecording}
                className="w-14 h-14 rounded-full bg-gradient-to-tr from-gold-400 to-amber-500 text-midnight-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-glow-gold"
                aria-label={t('form.startRecord')}
              >
                <Mic className="w-7 h-7" />
              </button>
            </div>
          </div>
          <div>
            <h4 className="font-serif text-gold-200 font-semibold text-sm">
              {t('form.tabVoice')}
            </h4>
            <p className="text-cream-400/70 text-xs mt-1 max-w-sm">
              {t('form.voicePrompt')}
            </p>
          </div>
          <span className="text-[11px] text-gold-400/70 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20">
            Max limit: 3 minutes (180 seconds)
          </span>
        </div>
      )}

      {/* STATE 2: ACTIVE RECORDING */}
      {isRecording && (
        <div className="flex flex-col items-center py-6 space-y-4 text-center">
          {/* Pulsing visualizer canvas */}
          <div className="w-full max-w-md h-16 bg-midnight-950/80 rounded-xl p-2 border border-gold-500/30 flex items-center justify-center shadow-inner">
            <canvas
              ref={canvasRef}
              width={340}
              height={56}
              className="w-full h-full"
            />
          </div>

          {/* Timer Display */}
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <span className="font-mono text-2xl font-bold tracking-wider text-gold-200">
              {formatTime(duration)}
            </span>
            <span className="text-xs text-cream-400/60 font-mono">/ 03:00</span>
          </div>

          <p className="text-xs text-cream-300/80">
            {t('form.recordingActive')} ({Math.round(percentageLeft)}% {t('form.recordingTimeLeft')})
          </p>

          {/* Stop Button */}
          <button
            type="button"
            onClick={stopRecording}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-cream-100 bg-red-600/80 hover:bg-red-500 border border-red-400/40 shadow-lg hover:shadow-red-500/20 transition-all duration-200"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>{t('form.stopRecord')}</span>
          </button>
        </div>
      )}

      {/* STATE 3: RECORDED PREVIEW & CONTROLS */}
      {!isRecording && recordedBlob && audioUrl && (
        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between border-b border-gold-500/15 pb-2">
            <div className="flex items-center gap-2 text-xs font-medium text-gold-200">
              <Volume2 className="w-4 h-4 text-gold-400" />
              <span>{t('form.playbackPreview')}</span>
            </div>
            <span className="text-xs font-mono text-gold-400/80">
              {formatTime(duration)}
            </span>
          </div>

          {/* Hidden audio element */}
          <audio
            ref={audioElementRef}
            src={audioUrl}
            onTimeUpdate={handleAudioTimeUpdate}
            onEnded={handleAudioEnded}
            className="hidden"
          />

          {/* Audio Player Scrubber Bar */}
          <div className="flex items-center gap-4 bg-midnight-950/70 p-3 rounded-xl border border-gold-500/20">
            <button
              type="button"
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-gold-500 text-midnight-950 flex items-center justify-center hover:bg-gold-400 shadow-glow-gold transition-transform hover:scale-105 shrink-0"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <div className="flex-1 flex flex-col gap-1">
              <div className="w-full bg-midnight-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-gold-400 to-amber-500 h-full transition-all"
                  style={{
                    width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-cream-400/60 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Re-record & Delete actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                handleDelete();
                startRecording();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-cream-300 hover:text-gold-200 hover:bg-midnight-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('form.reRecord')}</span>
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400/80 hover:text-red-300 hover:bg-red-950/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('form.deleteAudio')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
