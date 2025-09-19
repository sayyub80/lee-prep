'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Sparkles, Zap } from 'lucide-react';

export default function ManageChallengesPage() {
  const [challengeTopic, setChallengeTopic] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [challengeFeedback, setChallengeFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSuggestTopics = async () => {
    setIsSuggesting(true);
    setSuggestions([]);
    setChallengeFeedback(null);
    try {
      const res = await fetch('/api/admin/challenges/suggest');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get suggestions');
      setSuggestions(data.suggestions);
    } catch (error: any) {
      setChallengeFeedback({ type: 'error', message: error.message });
    } finally {
      setIsSuggesting(false);
    }
  };
  
  const handlePublishChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    setChallengeFeedback(null);
    try {
      const res = await fetch('/api/admin/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: challengeTopic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish');
      setChallengeFeedback({ type: 'success', message: 'Today\'s challenge has been published!' });
      setChallengeTopic('');
      setSuggestions([]);
    } catch (error: any) {
      setChallengeFeedback({ type: 'error', message: error.message });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Daily Challenge</h1>
      <Card>
        <CardHeader>
          {/* --- ICON COLOR ADDED --- */}
          <CardTitle className="flex items-center gap-2"><Zap className="text-amber-500"/> Set Today's Challenge</CardTitle>
          <CardDescription>Publish a new speaking topic for all users. This will overwrite any existing challenge for today.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePublishChallenge} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="challengeTopic" className="font-medium">Topic</label>
              <Textarea id="challengeTopic" value={challengeTopic} onChange={(e) => setChallengeTopic(e.target.value)} required placeholder="e.g., Describe your favorite movie without saying its name."/>
            </div>

            <div className="space-y-2">
              <Button type="button" variant="outline" size="sm" onClick={handleSuggestTopics} disabled={isSuggesting}>
                  {/* --- ICON COLOR ADDED --- */}
                  {isSuggesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Sparkles className="w-4 h-4 mr-2 text-purple-500"/>}
                  Suggest with AI
              </Button>
              {suggestions.length > 0 && (
                  <div className="pt-2 space-y-2">
                      <p className="text-sm font-medium">Suggestions:</p>
                      {suggestions.map((s, i) => (
                          <div key={i} onClick={() => setChallengeTopic(s)} className="text-sm p-2 bg-secondary rounded-md hover:bg-secondary/80 cursor-pointer transition-colors">
                              {s}
                          </div>
                      ))}
                  </div>
              )}
            </div>
            
            {challengeFeedback && <div className={`p-3 rounded-md text-sm ${challengeFeedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{challengeFeedback.message}</div>}
            <Button type="submit" disabled={isPublishing || !challengeTopic} className="w-full">
              {isPublishing ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Publish Challenge'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}