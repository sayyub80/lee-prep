'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Mic, Check, AlertTriangle, Play, Pause, Square, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';

type Status = 'idle' | 'ready' | 'recording' | 'finished' | 'uploading' | 'evaluating' | 'error';

interface ChallengeData {
  _id: string;
  topic: string;
  timeLimit: number; // in seconds
  reward: number;
}

export default function DailyChallengePage() {
  const router = useRouter();
  const params = useParams();
  const challengeId = params.challengeId as string;

  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [error, setError] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');

  // --- NEW: Fetch challenge details ---
  useEffect(() => {
    if (!challengeId) {
      setError("No challenge ID was provided.");
      setStatus('error');
      return;
    }

    const fetchChallenge = async () => {
      try {
        const res = await fetch(`/api/challenges/${challengeId}`);
        const data = await res.json();
        if (data.success) {
          setChallenge(data.data);
          setTimeLeft(data.data.timeLimit); // Set initial time from challenge data
          setStatus('ready');
        } else {
          throw new Error(data.error || "Failed to load challenge");
        }
      } catch (err: any) {
        setError(err.message);
        setStatus('error');
      }
    };
    fetchChallenge();

    // Setup speech recognition
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interim_transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += event.results[i][0].transcript + ' ';
          } else {
            interim_transcript += event.results[i][0].transcript;
          }
        }
        setLiveTranscript(finalTranscriptRef.current + interim_transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setError("Sorry, a speech recognition error occurred.");
      };
    }

    // Cleanup for speech recognition
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };

  }, [challengeId]);

  const startRecording = async () => {
    if (status !== 'ready' || !recognitionRef.current || !challenge) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      setLiveTranscript('');
      finalTranscriptRef.current = '';

      mediaRecorderRef.current.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorderRef.current.onstop = handleSubmission;
      
      mediaRecorderRef.current.start();
      recognitionRef.current.start();
      setStatus('recording');
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      setError("Microphone access denied. Please enable it.");
      setStatus('error');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      if(recognitionRef.current) recognitionRef.current.stop();
    }
    setStatus('finished');
  };

  const handleSubmission = async () => {
    setStatus('uploading');
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', audioBlob, 'challenge-recording.webm');
    formData.append('challengeId', challengeId);
    formData.append('transcript', finalTranscriptRef.current.trim());
    
    try {
      const res = await fetch('/api/challenges/submit', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      
      setStatus('evaluating');
      router.push(`/practice/challenge/results/${data.submissionId}`);
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "Failed to submit challenge.");
      setStatus('error');
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusContent = () => {
    if (!challenge && (status === 'idle' || status === 'ready')) {
      return <Loader2 className="animate-spin" size={32} />;
    }
    switch(status) {
      case 'recording':
        return (
          <motion.div
            key="recording-state"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <h2 className="text-6xl font-bold font-mono tracking-tighter text-indigo-600">
                {formatTime(timeLeft)}
            </h2>
            <p className="text-muted-foreground mt-4 h-6 px-4 text-center text-lg">{liveTranscript || "Speak clearly into your microphone..."}</p>
          </motion.div>
        );
      case 'uploading': return <div className="flex flex-col items-center gap-2"><Loader2 className="animate-spin" size={32} /><p>Uploading your recording...</p></div>;
      case 'evaluating': return <div className="flex flex-col items-center gap-2"><Loader2 className="animate-spin" size={32} /><p>AI is analyzing your speech...</p></div>;
      case 'finished': return <div className="flex flex-col items-center gap-2"><Check size={32} className="text-green-500"/><p>Recording complete!</p></div>;
      case 'error': return <div className="flex flex-col items-center gap-2 text-destructive"><AlertTriangle size={32} /><p className="max-w-xs text-center">{error}</p></div>;
      case 'ready': default: return (
        <motion.div
            key="ready-state"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
        >
            <Mic size={48} className="text-gray-400 mb-4" />
            <p className="text-lg text-muted-foreground">Click Start to begin.</p>
        </motion.div>
      );
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-2xl text-center shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-800">Today's Challenge</CardTitle>
          {challenge ? (
            <CardDescription className="text-lg pt-2 text-indigo-700 font-medium">"{challenge.topic}"</CardDescription>
          ) : (
            <CardDescription className="text-lg pt-2 text-muted-foreground">Loading challenge topic...</CardDescription>
          )}
          {challenge && (
            <div className="flex justify-center items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1"><Clock className="w-4 h-4"/> {formatTime(challenge.timeLimit)}</div>
                <div className="flex items-center gap-1"><Zap className="w-4 h-4"/> {challenge.reward} XP</div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="my-12 flex items-center justify-center h-40">
            {getStatusContent()}
          </div>
          <div className="flex justify-center gap-4">
            {status === 'ready' && <Button size="lg" onClick={startRecording}><Mic className="mr-2"/> Start Speaking</Button>}
            {status === 'recording' && <Button size="lg" variant="destructive" onClick={stopRecording}><Square className="mr-2"/> Stop Recording</Button>}
            {(status === 'error' || (status === 'finished' && !error)) && (
              <Button size="lg" onClick={() => router.push('/practice')}>Back to Practice</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}