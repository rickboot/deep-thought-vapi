import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Mic, VolumeX, Zap } from 'lucide-react';
import { useVapi } from '@/hooks/useVapi';

function DeepThought() {
  const {
    isConnected,
    messages,
    startCall,
    endCall,
  } = useVapi();

  return (
    <div className='min-h-screen bg-[var(--background)] p-6'>
      <div className='max-w-4xl mx-auto space-y-4'>
        {/* Header */}
        <Card className='bg-[var(--card)] '>
          <CardHeader>
            <CardTitle className='text-3xl text-center text-[var(--foreground)]'>
              Deep Thought
            </CardTitle>
            <CardDescription className='text-lg text-center text-[var(--muted-foreground)]'>
              The most powerful computer in the universe
            </CardDescription>

            <div className='text-[var(--foreground)] text-center mt-2'>
              <Badge
                variant={isConnected ? 'default' : 'secondary'}
                className='gap-1'
              >
                <Zap className='w-3 h-3' />
                {isConnected ? 'Online' : 'Offline'}
              </Badge>
            </div>

            <div className='flex justify-center gap-4'>
              {!isConnected ? (
                <Button
                  size='lg'
                  onClick={startCall}
                  className='gap-2 bg-[var(--primary)] hover:bg-[var(--primary)]/80 text-black'
                >
                  <Mic className='w-5 h-5' />
                  Begin Session
                </Button>
              ) : (
                <div className='flex gap-3'>
                  <Button
                    variant='destructive'
                    size='lg'
                    onClick={endCall}
                    className='gap-2 bg-[var(--primary)] hover:bg-[var(--primary)]/80 text-black'
                  >
                    <VolumeX className='w-5 h-5' />
                    End Session
                  </Button>
                </div>
              )}
            </div>

          </CardHeader>
        </Card>

        {/* Chat Display */}
        <Card className='border-[var(--border)] bg-[var(--card)]'>
          <CardHeader>
            <CardTitle className='text-white flex items-center gap-2'>
              Deep Thought's Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4 max-h-96 overflow-y-auto'>
              {messages.map((message, index) => (
                <div key={index} className='space-y-2'>
                  <div className='flex items-start gap-3'>
                    <p className='text-[var(--foreground)] text-sm flex-1 bg-[var(--input)] rounded-lg p-4 border border-[var(--border)]'>
                      {message.content}
                      <span className='text-xs text-[var(--muted-foreground)] mt-2 block'>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className='text-[var(--muted-foreground)] text-center text-xs'>
          Copyright 2025
        </p>
      </div>
    </div>
  );
}

export default DeepThought;
