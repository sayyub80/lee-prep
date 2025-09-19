'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Mic, Check, AlertTriangle, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type Status = 'idle' | 'ready' | 'recording' | 'finished' | 'uploading' | 'evaluating' | 'error';

interface Challenge {
  _id: string;
  topic: string;
  reward: number;
  timeLimit: number;
}

export default function ChallengePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const challengeId = params.challengeId as string;
  
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>(''); // Ref to store the complete final transcript

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      // --- THIS IS THE CORRECTED LOGIC ---
      recognition.onresult = (event: any) => {
        let interim_transcript = '';
        finalTranscriptRef.current = ''; // Reset and rebuild the final transcript each time

        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += event.results[i][0].transcript + ' ';
          } else {
            interim_transcript += event.results[i][0].transcript;
          }
        }
        // Update the live display with the full final transcript plus the current interim part
        setLiveTranscript(finalTranscriptRef.current + interim_transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setError("Sorry, a speech recognition error occurred.");
      };

    }
  }, []);


  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const res = await fetch('/api/challenges/today');
        const data = await res.json();
        if (data.success && data.data._id === challengeId) {
          setChallenge(data.data);
          setTimeLeft(data.data.timeLimit);
          setStatus('ready');
        } else {
          throw new Error("Challenge not found or ID mismatch.");
        }
      } catch (err: any) {
        setError(err.message || "Could not load the challenge.");
        setStatus('error');
      }
    };
    if (challengeId) {
      fetchChallenge();
    }
  }, [challengeId]);

  const startRecording = async () => {
    if (status !== 'ready' || !recognitionRef.current) return;
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
      setError("Microphone access denied. Please enable it in your browser settings.");
      setStatus('error');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      recognitionRef.current.stop();
    }
    setStatus('finished');
  };

  const handleSubmission = async () => {
    setStatus('uploading');
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', audioBlob, 'challenge-recording.webm');
    formData.append('challengeId', challengeId);
    // Use the final transcript from the ref for submission
    formData.append('transcript', finalTranscriptRef.current.trim());
    
    try {
      const res = await fetch('/api/challenges/submit', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      
      setStatus('evaluating');
      router.push(`/practice/challenge/results/${data.submissionId}`);
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  };

  const getStatusContent = () => {
    switch(status) {
      case 'recording':
        return (
          <div className="flex flex-col items-center">
            <h2 className="text-6xl font-bold font-mono tracking-tighter text-primary">{new Date(timeLeft * 1000).toISOString().substr(14, 5)}</h2>
            <p className="text-muted-foreground mt-4 h-6 px-4">{liveTranscript}</p>
          </div>
        );
      case 'uploading':
        return <div className="flex flex-col items-center gap-2"><Loader2 className="animate-spin" size={32} /><p>Uploading...</p></div>;
      case 'evaluating':
         return <div className="flex flex-col items-center gap-2"><Loader2 className="animate-spin" size={32} /><p>AI is analyzing your speech...</p></div>;
      case 'finished':
        return <div className="flex flex-col items-center gap-2"><Check size={32} /><p>Finished!</p></div>;
      case 'error':
        return <div className="flex flex-col items-center gap-2 text-destructive"><AlertTriangle size={32} /><p className="max-w-xs text-center">{error}</p></div>;
      case 'ready':
      default:
        return <Mic size={48} className="text-muted-foreground" />;
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-secondary/30 p-4">
      <Card className="w-full max-w-2xl text-center shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl">Today's Challenge</CardTitle>
          <CardDescription className="text-lg pt-2">"{challenge?.topic}"</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="my-12 flex items-center justify-center h-40">
            {getStatusContent()}
          </div>
          <div className="flex justify-center">
            {status === 'ready' && <Button size="lg" onClick={startRecording}>Start Challenge</Button>}
            {status === 'recording' && <Button size="lg" variant="destructive" onClick={stopRecording}>Stop Recording</Button>}
            {status === 'error' && <Button size="lg" onClick={() => window.location.reload()}>Try Again</Button>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}