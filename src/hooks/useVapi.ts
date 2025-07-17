import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import { SYSTEM_PROMPT } from '@/lib/prompts';
import { DEEP_THOUGHT_GREETING } from '@/lib/constants';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// VAPI
// assistant conversations start
// user conversations are in orange
//
//

export type VapiMessage =
  | {
      type: 'transcript';
      transcriptType: string;
      role: 'user' | 'assistant';
      transcript: string;
    }
  | {
      type: 'conversation-update';
    };

interface UseVapiReturn {
  isConnected: boolean;
  isSpeaking: boolean;
  messages: Message[];
  startCall: () => void;
  endCall: () => void;
}

export const useVapi = (): UseVapiReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const vapiRef = useRef<Vapi | null>(null);

  const registerVapiListeners = useCallback((vapi: Vapi) => {
    // call start and end
    vapi.on('call-start', () => setIsConnected(true));
    vapi.on('call-end', () => {
      setIsConnected(false);
      setIsSpeaking(false);
    });

    // assistant speech start and end
    vapi.on('speech-start', () => {
      console.log('Speech started');
      setIsSpeaking(true);
    });
    vapi.on('speech-end', () => {
      console.log('Speech ended');
      setIsSpeaking(false);
    });

    // messages - assistant and user
    // final transcripts represent a complete assistant or user sentence
    vapi.on('message', (message: VapiMessage) => {
      // if (message.type === 'transcript' && message.transcriptType === 'partial')
      //   console.log('Partial transcript:', message);

      if (message.type === 'transcript' && message.transcriptType === 'final') {
        console.log('Final transcript:', message);
        setMessages((prev) => [
          ...prev,
          {
            role: message.role,
            content: message.transcript,
            timestamp: Date.now(),
          },
        ]);
      } else if (message.type === 'conversation-update') {
        console.log('Conversation update:', message);
      }
    });

    vapi.on('error', (error: Error) => {
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

  return {
    isConnected,
    isSpeaking,
    messages,
    startCall,
    endCall,
  };
};
