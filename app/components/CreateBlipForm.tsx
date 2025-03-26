'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { createBlip } from '../actions';

export default function CreateBlipForm() {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const maxLength = 280;
  const userId = '550e8400-e29b-41d4-a716-446655440000'; // Fijo por ahora
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Ajustar la altura del textarea dinámicamente
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`; 
    }
  }, [content]);

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await createBlip(formData);
        setContent('');
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al crear el Blip';
        setError(errorMessage);
      }
    });
  };

  // Calcular el porcentaje para el contador circular
  const remainingChars = maxLength - content.length;
  const showCircle = content.length > 0;
  const circleProgress = (content.length / maxLength) * 100;
  const isNearLimit = remainingChars <= 20;

  return (
    <form
      action={handleSubmit}
      className="bg-white py-4 px-4 border-b border-gray-200 rounded-sm"
    >
      <input type="hidden" name="userId" value={userId} />

      <textarea
        ref={textareaRef}
        name="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="¿Qué estás pensando?"
        maxLength={maxLength}
        className="w-full resize-none border-none focus:outline-none text-gray-900 text-[15px] leading-5 placeholder-gray-500 overflow-hidden"
        disabled={isPending}
      />

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          {showCircle && (
            <svg className="w-5 h-5" viewBox="0 0 20 20">
              <circle
                cx="10"
                cy="10"
                r="9"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="2"
              />
              <circle
                cx="10"
                cy="10"
                r="9"
                fill="none"
                stroke={isNearLimit ? '#ef4444' : '#1d9bf0'}
                strokeWidth="2"
                strokeDasharray="56.5487"
                strokeDashoffset={56.5487 * (1 - circleProgress / 100)}
                transform="rotate(-90 10 10)"
              />
            </svg>
          )}
          {isNearLimit && (
            <span className={`text-[13px] ${remainingChars < 0 ? 'text-red-500' : 'text-gray-500'}`}>
              {remainingChars}
            </span>
          )}
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-full font-medium text-sm disabled:opacity-50"
          disabled={isPending || content.trim() === ''}
        >
          {isPending ? 'Creando...' : 'Blip'}
        </button>
      </div>

      {error && <p className="text-red-500 text-[13px] mt-2">{error}</p>}
    </form>
  );
}