import clsx from 'clsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, VolumeX, Zap } from 'lucide-react';
import { useVapi } from '@/hooks/useVapi';
import { useEffect, useRef } from 'react';

function DeepThought() {
  const { isConnected, messages, startCall, endCall } = useVapi();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <div className="mx-auto max-w-4xl space-y-4">
        {/* Header */}
        <Card className="bg-[var(--card)]">
          <CardHeader>
            <CardTitle className="text-center text-3xl text-[var(--foreground)]">
              Deep Thought
            </CardTitle>
            <CardDescription className="text-center text-lg text-[var(--muted-foreground)]">
              The most powerful computer in the universe
            </CardDescription>

            <div className="mt-2 text-center text-[var(--foreground)]">
              <Badge variant={isConnected ? 'default' : 'secondary'} className="gap-1">
                <Zap className="h-3 w-3" />
                {isConnected ? 'Online' : 'Offline'}
              </Badge>
            </div>

            <div className="flex justify-center gap-4">
              {!isConnected ? (
                <Button
                  size="lg"
                  onClick={startCall}
                  className="gap-2 bg-[var(--primary)] text-black hover:bg-[var(--primary)]/80"
                >
                  <Mic className="h-5 w-5" />
                  Begin Session
                </Button>
              ) : (
                <div className="flex gap-3">
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={endCall}
                    className="gap-2 bg-[var(--primary)] text-black hover:bg-[var(--primary)]/80"
                  >
                    <VolumeX className="h-5 w-5" />
                    End Session
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Chat Display */}
        <Card className="border-[var(--border)] bg-[var(--card)]">
          <CardContent>
            <div className="flex max-h-96 flex-col space-y-4 overflow-y-auto">
              {messages.map((message, index) => (
                // chat bubble
                <div key={index} className="mx-8 flex flex-col gap-4">
                  <div
                    className={clsx(
                      'w-[80%] rounded-xl border border-[var(--border)] bg-[var(--input)] p-4 text-sm',
                      message.role === 'user'
                        ? 'self-end rounded-bl-none bg-amber-400/70 text-white'
                        : 'self-start rounded-br-none bg-[var(--card)] text-white',
                    )}
                  >
                    <p>
                      {message.content}
                      <span
                        className={clsx(
                          'mt-2 block text-xs',
                          message.role === 'user' ? 'text-black' : 'text-black',
                        )}
                      >
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
              <div ref={endOfMessagesRef} />
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--muted-foreground)]">Copyright 2025</p>
      </div>
    </div>
  );
}

export default DeepThought;
