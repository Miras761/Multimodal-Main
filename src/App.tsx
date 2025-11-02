import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, Part } from './types';
import { sendMessageToGemini } from './services/geminiService';
import MessageComponent from './components/Message';
import ImagePreview from './components/ImagePreview';
import { PaperclipIcon, SendIcon } from './components/icons';

const App: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<Message[]>([
    {
      role: 'model',
      parts: [{ text: "Привет! Я — Multimodal Main, AI-ассистент, созданный программистом. Чем я могу вам сегодня помочь?" }],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApiConfigured, setIsApiConfigured] = useState(true);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fix: Use process.env.API_KEY to align with guidelines and fix TypeScript error.
    // Check for API Key on mount using Vite's env variable
    if (!process.env.API_KEY) {
      setIsApiConfigured(false);
    }
  }, []);

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [chatHistory]);

  const fileToGenerativePart = async (file: File): Promise<Part> => {
    const base64EncodedData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: {
        mimeType: file.type,
        data: base64EncodedData,
      },
    };
  };

  const handleSendMessage = useCallback(async () => {
    if ((!inputValue.trim() && !imageFile) || isLoading) return;

    setError(null);
    setIsLoading(true);

    const userParts: Part[] = [];
    if (imageFile) {
      const imagePart = await fileToGenerativePart(imageFile);
      userParts.push(imagePart);
    }
    if (inputValue.trim()) {
      userParts.push({ text: inputValue.trim() });
    }

    const userMessage: Message = { role: 'user', parts: userParts };
    const newChatHistory = [...chatHistory, userMessage];
    setChatHistory(newChatHistory);
    
    setInputValue('');
    setImageFile(null);

    try {
      const modelResponseText = await sendMessageToGemini(chatHistory, userParts);
      const modelMessage: Message = { role: 'model', parts: [{ text: modelResponseText }] };
      setChatHistory(prev => [...prev, modelMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to get response: ${errorMessage}`);
      setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: `Извините, произошла ошибка: ${errorMessage}` }] }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, imageFile, isLoading, chatHistory]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };
  
  if (!isApiConfigured) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="w-full max-w-3xl h-[90vh] max-h-[800px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden items-center justify-center p-8 text-center">
          <header className="w-full bg-gradient-to-r from-[#11998e] to-[#38ef7d] text-white p-6 text-center shadow-md animated-gradient rounded-t-2xl">
            <h1 className="text-2xl font-bold">Multimodal Main</h1>
          </header>
          <div className="p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Ошибка конфигурации</h2>
            <p className="text-gray-700">
              {/* Fix: Update error message to refer to API_KEY. */}
              Ключ Gemini API не найден. Пожалуйста, добавьте переменную окружения <code className="bg-gray-200 text-red-700 font-mono p-1 rounded">API_KEY</code> в настройках вашего проекта на Vercel.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              После добавления ключа не забудьте сделать **Redeploy** (повторное развертывание), чтобы изменения вступили в силу.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-3xl h-[90vh] max-h-[800px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <header className="bg-gradient-to-r from-[#11998e] to-[#38ef7d] text-white p-6 text-center shadow-md z-10 animated-gradient">
          <h1 className="text-2xl font-bold">Multimodal Main</h1>
          <p className="text-sm opacity-90">Создан программистом</p>
        </header>
        
        <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 chat-bg">
          <div className="flex flex-col gap-4">
            {chatHistory.map((message, index) => (
              <MessageComponent key={index} message={message} />
            ))}
            {isLoading && (
               <div className="flex justify-start">
                  <div className="max-w-[70%] p-3 rounded-xl rounded-bl-none bg-white border border-gray-200 text-gray-800">
                      <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse delay-75"></div>
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse delay-150"></div>
                      </div>
                  </div>
              </div>
            )}
          </div>
        </main>

        {error && <div className="p-4 bg-red-100 text-red-700 border-t border-gray-200">{error}</div>}

        <footer className="p-4 bg-white border-t border-gray-200">
          {imageFile && (
            <div className="p-2">
              <ImagePreview file={imageFile} onRemove={() => setImageFile(null)} />
            </div>
          )}
          <form
            className="flex items-center gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-emerald-600 transition-colors rounded-full hover:bg-emerald-100"
              aria-label="Attach file"
            >
              <PaperclipIcon className="w-6 h-6" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Введите ваше сообщение..."
              className="flex-1 w-full px-5 py-3 text-base text-gray-700 bg-gray-100 border-2 border-transparent rounded-full focus:outline-none focus:border-emerald-400 transition-colors"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={(!inputValue.trim() && !imageFile) || isLoading}
              className="p-3 bg-gradient-to-br from-[#11998e] to-[#38ef7d] text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:scale-105"
              aria-label="Send message"
            >
              <SendIcon className="w-6 h-6" />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default App;