import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Bold, Italic, List, ListOrdered, RemoveFormatting } from 'lucide-react';
import { sanitizeRichTextHtml } from '../utils/richText';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeightClass?: string;
  label?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write the scope of work for this section...',
  minHeightClass = 'min-h-[84px]',
  label,
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const lastEmittedRef = useRef<string>(value || '');
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    bullet: false,
    ordered: false,
  });

  // Sync external value changes (e.g., loading another quote, clearing, or cross-tab sync)
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    const normalizedProp = value || '';
    if (normalizedProp !== lastEmittedRef.current && el.innerHTML !== normalizedProp) {
      el.innerHTML = normalizedProp;
      lastEmittedRef.current = normalizedProp;
    }
  }, [value]);

  // Initial mount content
  useEffect(() => {
    const el = editorRef.current;
    if (el && value) {
      el.innerHTML = value;
      lastEmittedRef.current = value;
    }
  }, []);

  const updateToolbarState = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const selection = window.getSelection();
    if (!selection || !selection.anchorNode || !el.contains(selection.anchorNode)) {
      return;
    }
    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        bullet: document.queryCommandState('insertUnorderedList'),
        ordered: document.queryCommandState('insertOrderedList'),
      });
    } catch {
      // Ignore queryCommandState errors in unsupported contexts
    }
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', updateToolbarState);
    return () => {
      document.removeEventListener('selectionchange', updateToolbarState);
    };
  }, [updateToolbarState]);

  const emitChange = () => {
    const el = editorRef.current;
    if (!el) return;
    const cleaned = sanitizeRichTextHtml(el.innerHTML);
    // Keep empty div truly empty so CSS :empty::before placeholder renders
    if (!cleaned && el.innerHTML !== '') {
      el.innerHTML = '';
    }
    lastEmittedRef.current = cleaned;
    onChange(cleaned);
  };

  const applyCommand = (command: string) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    try {
      document.execCommand(command, false);
    } catch (err) {
      console.warn('Formatting command failed:', command, err);
    }
    updateToolbarState();
    emitChange();
  };

  const handleClearFormatting = () => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    try {
      document.execCommand('removeFormat', false);
      if (document.queryCommandState('insertUnorderedList')) {
        document.execCommand('insertUnorderedList', false);
      }
      if (document.queryCommandState('insertOrderedList')) {
        document.execCommand('insertOrderedList', false);
      }
    } catch {
      // Ignore
    }
    updateToolbarState();
    emitChange();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const plainText = e.clipboardData.getData('text/plain');
    if (plainText) {
      document.execCommand('insertText', false, plainText);
      emitChange();
    }
  };

  return (
    <div className="rounded-lg border border-[#223354] bg-[#0a0f1d] overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
      {/* Toolbar */}
      <div className="px-2.5 py-1.5 bg-[#0d1527] border-b border-[#1c2a44] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {label && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-2">
              {label}
            </span>
          )}

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyCommand('bold');
            }}
            title="Bold (Ctrl+B)"
            aria-label="Bold"
            className={`p-1.5 rounded text-xs transition cursor-pointer ${
              activeFormats.bold
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-[#1a2846]'
            }`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyCommand('italic');
            }}
            title="Italic (Ctrl+I)"
            aria-label="Italic"
            className={`p-1.5 rounded text-xs transition cursor-pointer ${
              activeFormats.italic
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-[#1a2846]'
            }`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-[#223354] mx-1" />

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyCommand('insertUnorderedList');
            }}
            title="Bullet List"
            aria-label="Bullet List"
            className={`p-1.5 rounded text-xs transition cursor-pointer ${
              activeFormats.bullet
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-[#1a2846]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyCommand('insertOrderedList');
            }}
            title="Numbered List"
            aria-label="Numbered List"
            className={`p-1.5 rounded text-xs transition cursor-pointer ${
              activeFormats.ordered
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-[#1a2846]'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            handleClearFormatting();
          }}
          title="Clear Formatting"
          aria-label="Clear Formatting"
          className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-[#1a2846] transition cursor-pointer"
        >
          <RemoveFormatting className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={emitChange}
        onBlur={emitChange}
        onKeyUp={updateToolbarState}
        onMouseUp={updateToolbarState}
        onPaste={handlePaste}
        className={`rich-scope-content w-full px-3.5 py-2.5 text-xs text-slate-100 leading-relaxed focus:outline-none overflow-y-auto ${minHeightClass}`}
      />
    </div>
  );
};
