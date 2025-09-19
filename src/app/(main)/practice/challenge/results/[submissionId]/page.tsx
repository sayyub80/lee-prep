'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, RefreshCw, FileText, Headphones, Award, ThumbsUp, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CircularProgress } from '@/components/ui/CircularProgress';
import Link from 'next/link';

interface Submission {
  _id: string;
  score: number;
  transcript: string;
  feedback: {
    wellDone: string;
    improvementArea: string;
  };
  audioUrl: string;
  challenge: {
    topic: string;
  };
}

export default function ChallengeResultsPage() {
  const router = useRouter();
  const params = useParams();
  // This will now correctly find the ID from the URL because the folder name matches
  const submissionId = params.submissionId as string;

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!submissionId) {
      setError('No submission ID was provided in the URL.');
      setLoading(false);
      return;
    }
    
    const fetchSubmission = async () => {
      try {
        const res = await fetch(`/api/challenges/submissions/${submissionId}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch results');
        }
        const data = await res.json();
        setSubmission(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [submissionId]);

  if (loading) {
    return <div className="flex justify-center items-center h-[calc(100vh-80px)]"><Loader2 className="w-12 h-12 animate-spin text-primary"/></div>;
  }

  if (error) {
    return (
        <div className="flex flex-col gap-4 justify-center items-center text-center h-[calc(100vh-80px)] p-4">
            <h2 className="text-xl font-semibold text-destructive">Could Not Load Results</h2>
            <p className="text-muted-foreground max-w-md">{error}</p>
            <Button onClick={() => router.push('/practice')}>Return to Practice</Button>
        </div>
    );
  }

  if (!submission) {
    return <div className="flex justify-center items-center h-[calc(100vh-80px)]">No submission data found.</div>;
  }

  return (
    <div className="bg-secondary/30 min-h-[calc(100vh-80px)] py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.push('/practice')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Practice
        </Button>
        
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <Award className="w-12 h-12 mx-auto text-amber-500" />
            <CardTitle className="text-3xl mt-2">Challenge Complete!</CardTitle>
            <CardDescription className="text-base">Here's your feedback for the topic: "{submission.challenge.topic}"</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="flex flex-col items-center">
                 <CircularProgress value={submission.score} size={160} strokeWidth={12} />
                 <p className="text-lg text-muted-foreground mt-4">Your Score</p>
              </div>
              <div className="space-y-6">
                 <div>
                    <h3 className="font-semibold text-lg flex items-center mb-2 text-green-600">
                        <ThumbsUp className="w-5 h-5 mr-2" />
                        What you did well
                    </h3>
                    <p className="text-muted-foreground">{submission.feedback.wellDone}</p>
                 </div>
                 <div>
                    <h3 className="font-semibold text-lg flex items-center mb-2 text-blue-600">
                        <ArrowUpRight className="w-5 h-5 mr-2" />
                        Area for improvement
                    </h3>
                    <p className="text-muted-foreground">{submission.feedback.improvementArea}</p>
                 </div>
              </div>
            </div>
            <div className="mt-12 border-t pt-8">
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-semibold text-lg flex items-center mb-4"><FileText className="w-5 h-5 mr-2"/> Your Transcript</h3>
                        <div className="p-4 bg-secondary rounded-lg max-h-60 overflow-y-auto">
                            <p className="text-muted-foreground whitespace-pre-wrap">{submission.transcript}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg flex items-center mb-4"><Headphones className="w-5 h-5 mr-2"/> Listen to Your Recording</h3>
                        {submission.audioUrl !== '/uploads/placeholder.webm' ? (
                            <audio controls className="w-full">
                                <source src={submission.audioUrl} type="audio/webm" />
                                Your browser does not support the audio element.
                            </audio>
                        ) : (
                            <p className="text-sm text-muted-foreground p-4 bg-secondary rounded-lg">
                              Note: Audio playback is not available for this submission because a real file storage service is not configured.
                            </p>
                        )}
                    </div>
                </div>
            </div>
             <div className="mt-12 text-center border-t pt-8">
                <Button size="lg" asChild>
                    <Link href="/practice">
                       <RefreshCw className="w-4 h-4 mr-2"/>
                       Try Another Challenge Tomorrow
                    </Link>
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}