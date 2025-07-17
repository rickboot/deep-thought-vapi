import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import { SYSTEM_PROMPT } from '@/lib/prompts';
import { DEEP_THOUGHT_GREETING } from '@/lib/constants';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

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
  messages: Message[];
  startCall: () => void;
  endCall: () => void;
}

export const useVapi = (): UseVapiReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
  const [userIsSpeaking, setUserIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');

  const vapiRef = useRef<Vapi | null>(null);

  const registerVapiListeners = useCallback((vapi: Vapi) => {
    //! call start and end
    vapi.on('call-start', () => {
      console.log('***************CALL START***************');
      setIsConnected(true);
    });
    vapi.on('call-end', () => {
      console.log('***************CALL END***************');
      setIsConnected(false);
      setAssistantIsSpeaking(false);
    });

    //! assistant speech start
    vapi.on('speech-start', () => {
      console.log('***************SPEECH START***************');
      setCurrentMessage('');
      setUserIsSpeaking(false);
      setAssistantIsSpeaking(true);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
        },
      ]);
    });

    //! assistant speech end
    vapi.on('speech-end', () => {
      console.log('***************SPEECH END***************');
      setAssistantIsSpeaking(false);
    });

    // messages - assistant and user
    vapi.on('message', (message: VapiMessage) => {
      console.log('=====MESSAGE=====:', message);

      if (message.type === 'transcript' && message.transcriptType === 'final') {
        console.log('Final transcript:', message);

        if (message.role === 'user' && !assistantIsSpeaking) {
          setUserIsSpeaking(true);
        }

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

    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, [registerVapiListeners]);

  useEffect(() => {
    if (messages.length > 0) {
      messages[messages.length - 1].content = currentMessage;
    }
  }, [currentMessage, messages]);

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
    messages,
    startCall,
    endCall,
  };
};
