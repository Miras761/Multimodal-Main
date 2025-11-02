import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyIcon, CheckIcon } from './icons';

interface CodeBlockProps {
  className?: string;
  children: React.ReactNode;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ className, children }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const language = className?.replace(/language-/, '') || 'text';
  const code = String(children).replace(/\n$/, '');
  const isHtml = language.toLowerCase() === 'html';

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  return (
    <div className="my-4 rounded-lg overflow-hidden bg-[#1e1e1e] text-sm">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-700 text-gray-300">
        <div className="flex items-center gap-4">
          <span className="font-mono">{language}</span>
          {isHtml && (
            <div className="flex gap-1 bg-gray-800 p-0.5 rounded-md">
              <button
                onClick={() => setShowPreview(false)}
                className={`px-2 py-0.5 text-xs rounded-md transition-colors ${!showPreview ? 'bg-emerald-600 text-white' : 'hover:bg-gray-600'}`}
              >
                Код
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className={`px-2 py-0.5 text-xs rounded-md transition-colors ${showPreview ? 'bg-emerald-600 text-white' : 'hover:bg-gray-600'}`}
              >
                Вид
              </button>
            </div>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs hover:text-white transition-colors"
        >
          {isCopied ? <CheckIcon className="text-emerald-400" /> : <CopyIcon />}
          {isCopied ? 'Скопировано!' : 'Копировать'}
        </button>
      </div>

      {isHtml && showPreview ? (
        <div className="p-4 bg-white">
          <iframe
            srcDoc={code}
            title="HTML Preview"
            sandbox="allow-scripts"
            className="w-full h-64 border-0"
          />
        </div>
      ) : (
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{ margin: 0, borderRadius: '0 0 0.5rem 0.5rem' }}
          codeTagProps={{ style: { fontFamily: 'monospace' } }}
        >
          {code}
        </SyntaxHighlighter>
      )}
    </div>
  );
};

export default CodeBlock;
