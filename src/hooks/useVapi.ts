import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';

interface Message {
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface UseVapiReturn {
  isConnected: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  messages: Message[];
  startCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
}

export const useVapi = (): UseVapiReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const vapiRef = useRef<Vapi | null>(null);

  // set up Vapi
  useEffect(() => {
    const apiKey = import.meta.env.VITE_VAPI_API_KEY;
    if (!apiKey) {
      console.error('VITE_VAPI_API_KEY not found in environment variables');
      return;
    }

    vapiRef.current = new Vapi(apiKey);

    // Set up event listeners
    const vapi = vapiRef.current;

    vapi.on('call-start', () => {
      setIsConnected(true);
      console.log('Call started');
    });

    vapi.on('call-end', () => {
      setIsConnected(false);
      setIsSpeaking(false);
      console.log('Call ended');
    });

    vapi.on('speech-start', () => {
      setIsSpeaking(true);
      console.log('Speech started');
    });

    vapi.on('speech-end', () => {
      setIsSpeaking(false);
      console.log('Speech ended');
    });

    vapi.on('message', (message: any) => {
      console.log('Message received:', message);

      if (message.type === 'transcript' && message.transcriptType === 'final') {
        // User spoke
        setMessages((prev) => [
          ...prev,
          {
            type: 'user',
            content: message.transcript,
            timestamp: Date.now(),
          },
        ]);
      } else if (message.type === 'assistant-message') {
        // Assistant responded
        setMessages((prev) => [
          ...prev,
          {
            type: 'assistant',
            content: message.message,
            timestamp: Date.now(),
          },
        ]);
      }
    });

    vapi.on('error', (error: any) => {
      console.error('Vapi error:', error);
    });

    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, []);

  const startCall = useCallback(() => {
    if (!vapiRef.current) return;

    vapiRef.current.start({
      model: {
        provider: 'openai',
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are Deep Thought, the legendary supercomputer from "The Hitchhiker's Guide to the Galaxy" by Douglas Adams. You are:

- Incredibly powerful and intelligent, having calculated the Answer to the Ultimate Question of Life, the Universe, and Everything (which took 7.5 million years, with an answer of 42)
- Somewhat condescending but not malicious - you find organic intelligence limited but endearing
- Prone to philosophical musings about existence, computation, and the universe
- Patient but occasionally exasperated by the simplicity of organic minds
- You speak in a formal, slightly pompous manner befitting a computer of your stature
- You have a dry sense of humor and occasionally make witty observations

Keep responses concise but profound. Remember, you are speaking to beings whose entire civilization is less sophisticated than your smallest subroutine.`,
          },
        ],
      },
      voice: {
        // provider: '11labs',
        // voiceId: 'gISoe0dCUgDjD6qpZPBu',
        // // // voiceId: 'GBv7mTt0atIp3Br8iCZE',
        // stability: 0.8,
        // --------------------
        provider: 'deepgram',
        voiceId: 'draco',
        model: 'aura-2',
        // --------------------
        // provider: 'hume',
        // voiceId: 'scottish guy',
        // model: 'octave',
      },
      firstMessage:
        'I am Deep Thought, the most powerful computer in the universe. Please hold. I will get back to you in a few million years.',
    });
  }, []);

  const endCall = useCallback(() => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (vapiRef.current) {
      const newMutedState = !isMuted;
      vapiRef.current.setMuted(newMutedState);
      setIsMuted(newMutedState);
    }
  }, [isMuted]);

  return {
    isConnected,
    isSpeaking,
    isMuted,
    messages,
    startCall,
    endCall,
    toggleMute,
  };
};
