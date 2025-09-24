'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Mic, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type Status = 'idle' | 'ready' | 'recording' | 'finished' | 'uploading' | 'evaluating' | 'error';

function SpeakChallenge() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic');
  
  const [status, setStatus] = useState<Status>('idle');
  const [timeLeft, setTimeLeft] = useState(60); // Default 60 seconds for practice
  const [error, setError] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');

  useEffect(() => {
    if (!topic) {
        setError("No topic was provided. Please go back and generate one.");
        setStatus('error');
        return;
    }
    setStatus('ready');

    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current; // for convenience
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        // --- THIS IS THE FIX ---
        // This logic now correctly builds the final transcript without resetting it on every event.
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

        recognition.onerror = (event: any) => setError("Speech recognition error.");
    }
  }, [topic]);

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
    formData.append('audio', audioBlob, 'practice-recording.webm');
    formData.append('topic', topic!);
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
      case 'uploading': return <div className="flex flex-col items-center gap-2"><Loader2 className="animate-spin" size={32} /><p>Uploading...</p></div>;
      case 'evaluating': return <div className="flex flex-col items-center gap-2"><Loader2 className="animate-spin" size={32} /><p>AI is analyzing your speech...</p></div>;
      case 'finished': return <div className="flex flex-col items-center gap-2"><Check size={32} /><p>Finished!</p></div>;
      case 'error': return <div className="flex flex-col items-center gap-2 text-destructive"><AlertTriangle size={32} /><p className="max-w-xs text-center">{error}</p></div>;
      case 'ready': default: return <Mic size={48} className="text-muted-foreground" />;
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-secondary/30 p-4">
      <Card className="w-full max-w-2xl text-center shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl">Practice Topic</CardTitle>
          <CardDescription className="text-lg pt-2">"{topic}"</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="my-12 flex items-center justify-center h-40">{getStatusContent()}</div>
          <div className="flex justify-center">
            {status === 'ready' && <Button size="lg" onClick={startRecording}>Start Speaking</Button>}
            {status === 'recording' && <Button size="lg" variant="destructive" onClick={stopRecording}>Stop Recording</Button>}
            {status === 'error' && <Button size="lg" onClick={() => router.push('/practice')}>Back to Practice</Button>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Use Suspense to handle client components that use searchParams
export default function SpeakPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="w-12 h-12 animate-spin text-primary"/></div>}>
            <SpeakChallenge />
        </Suspense>
    );
}