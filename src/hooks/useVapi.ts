import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import { SYSTEM_PROMPT } from '@/lib/prompts';
import { DEEP_THOUGHT_GREETING } from '@/lib/constants';

interface Message {
  role: 'user' | 'assistant';
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

  const registerVapiListeners = useCallback((vapi: Vapi) => {
    vapi.on('call-start', () => setIsConnected(true));

    vapi.on('call-end', () => {
      setIsConnected(false);
      setIsSpeaking(false);
    });

    vapi.on('speech-start', () => {
      console.log('Speech started');
      setIsSpeaking(true);
    });

    vapi.on('speech-end', () => {
      console.log('Speech ended');
      setIsSpeaking(false);
    });

    vapi.on('message', (message: any) => {
      if (message.type === 'transcript' || message.type === 'conversation-update') {
        console.log('Message received:', message);
      }

      if (message.type === 'transcript') {
        console.log('MESSAGE TEXT', message.role);

        setMessages((prev) => [
          ...prev,
          {
            role: message.role,
            content: message.transcript,
            timestamp: Date.now(),
          },
        ]);
      }
    });

    vapi.on('error', (error: any) => {
      console.error('Vapi error:', error);
    });
  }, []);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_VAPI_API_KEY;

    if (!apiKey) {
      console.error('VITE_VAPI_API_KEY not found in environment variables');
      return;
    }

    vapiRef.current = new Vapi(apiKey);
    const vapi = vapiRef.current;

    registerVapiListeners(vapi);

    setMessages([]);

    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, [registerVapiListeners]);

  const startCall = useCallback(() => {
    if (!vapiRef.current) return;

    vapiRef.current.start({
      model: {
        provider: 'openai',
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
        ],
      },
      voice: {
        provider: 'deepgram',
        voiceId: 'draco',
        model: 'aura-2',
      },
      firstMessage: DEEP_THOUGHT_GREETING,
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
