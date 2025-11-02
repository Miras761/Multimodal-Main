import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';
import CodeBlock from './CodeBlock';

interface MessageProps {
  message: Message;
}

const MessageComponent: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  const containerClasses = `flex ${isUser ? 'justify-end' : 'justify-start'}`;
  const contentClasses = `max-w-[80%] md:max-w-[70%] text-base leading-relaxed break-words ${
    isUser
      ? 'bg-gradient-to-br from-[#11998e] to-[#38ef7d] text-white rounded-2xl rounded-br-none p-4 shadow-sm'
      : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-none shadow-sm'
  }`;

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        {message.parts.map((part, index) => {
          if (part.text) {
             // For model responses, wrap in prose for better markdown styling
            const markdownWrapperClass = !isUser ? "prose prose-sm max-w-none" : "";
            return (
               <div key={index} className={markdownWrapperClass}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code(props) {
                          const {children, className, node, ...rest} = props
                          return <CodeBlock {...props} />
                        }
                      }}
                    >
                      {part.text}
                    </ReactMarkdown>
                </div>
            );
          }
          if (part.inlineData) {
            const imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            return (
              <img
                key={index}
                src={imageUrl}
                alt="User content"
                className="rounded-lg mt-2 max-w-full h-auto p-4"
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default MessageComponent;
