import React, { useState, useRef, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { AlertCircle, FileCode, Files, GripVertical, Sparkles, Copy, Check, Download } from 'lucide-react';
import type { GeneratedJavaFile } from '../lib/converter/types';

interface EditorWorkspaceProps {
  rawJson: string;
  onJsonChange: (value: string | undefined) => void;
  files: GeneratedJavaFile[];
  generatedCode: string;
  errorFeedback: string | null;
  activeFileIndex: number;
  onSelectFileIndex: (index: number) => void;
  onLoadSample: () => void;
  onCopy: () => void;
  onDownload: () => void;
  copied: boolean;
  hasOutput: boolean;
  isDark?: boolean;
}

export const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({
  rawJson,
  onJsonChange,
  files,
  generatedCode,
  errorFeedback,
  activeFileIndex,
  onSelectFileIndex,
  onLoadSample,
  onCopy,
  onDownload,
  copied,
  hasOutput,
  isDark = true,
}) => {
  // Left pane width percentage (default: 50%, max: 50%, min: 20%)
  const [leftWidthPercent, setLeftWidthPercent] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const currentX = e.clientX - containerRect.left;
      let newPercent = (currentX / containerRect.width) * 100;

      // Restrict maximum width to 50% (as requested: "maksimal ukuran 50 lebar layar")
      // and minimum width to 20% for usability
      if (newPercent > 50) newPercent = 50;
      if (newPercent < 20) newPercent = 20;

      setLeftWidthPercent(newPercent);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const currentCode =
    files.length > 0 && files[activeFileIndex]
      ? files[activeFileIndex].code
      : generatedCode;

  // Determine JSON status: empty (yellow), invalid (red), valid (green)
  const isJsonEmpty = !rawJson.trim();
  const isJsonInvalid = Boolean(errorFeedback);
  const statusColorClass = isJsonEmpty
    ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
    : isJsonInvalid
    ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
    : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]';

  const statusLabel = isJsonEmpty
    ? 'Empty'
    : isJsonInvalid
    ? 'Invalid JSON'
    : 'Valid JSON';

  return (
    <div
      ref={containerRef}
      className={`flex-1 flex flex-col md:flex-row min-h-0 h-full overflow-hidden select-none ${
        isDragging ? 'cursor-col-resize select-none' : ''
      }`}
    >
      {/* Left Pane: JSON Input (Dynamic width up to 50%) */}
      <div
        style={{ width: `${leftWidthPercent}%` }}
        className="flex flex-col h-full min-h-0 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shrink-0 overflow-hidden"
      >
        <div className="bg-slate-100/80 dark:bg-slate-900/60 px-4 py-2 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${statusColorClass}`}
              title={`Status: ${statusLabel}`}
            ></span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Input JSON</span>
            <span className="text-[10px] text-slate-500 font-sans">({statusLabel})</span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Auto-formats on paste</span>
        </div>

        <div className="flex-1 min-h-0 relative">
          <Editor
            height="100%"
            defaultLanguage="json"
            theme={isDark ? 'vs-dark' : 'vs'}
            value={rawJson}
            onChange={onJsonChange}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, 'Courier New', monospace",
              formatOnPaste: true,
              formatOnType: true,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              folding: true,
              lineNumbers: 'on',
            }}
          />
        </div>

        {errorFeedback && (
          <div className="bg-rose-100/90 dark:bg-rose-950/80 border-t border-rose-300 dark:border-rose-800/60 p-2.5 px-4 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2 backdrop-blur shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span className="font-mono break-all">{errorFeedback}</span>
          </div>
        )}
      </div>

      {/* Draggable Divider Handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`hidden md:flex items-center justify-center w-2 -mx-1 z-20 cursor-col-resize group hover:bg-indigo-500/30 transition select-none shrink-0 ${
          isDragging ? 'bg-indigo-600' : 'bg-transparent'
        }`}
        title="Drag to resize editor (Max: 50% screen width)"
      >
        <div className="w-1 h-8 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-indigo-500 flex items-center justify-center transition">
          <GripVertical className="w-3 h-3 text-slate-500 dark:text-slate-400 group-hover:text-white" />
        </div>
      </div>

      {/* Right Pane: Java DTO Output (Takes remaining space) */}
      <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 bg-white dark:bg-slate-950 overflow-hidden">
        <div className="bg-slate-100/80 dark:bg-slate-900/60 px-4 py-1.5 border-b border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-600 dark:text-slate-400 shrink-0 min-h-[42px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
            <FileCode className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-300">Generated Java DTO</span>
            {files.length > 1 && (
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/30 flex items-center gap-1 font-sans">
                <Files className="w-3 h-3" /> {files.length} Separate Files
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onLoadSample}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition cursor-pointer font-sans shadow-xs"
              title="Load Sample JSON"
            >
              <Sparkles className="w-3 h-3 text-amber-500 dark:text-amber-400" />
              Load Sample
            </button>

            <button
              type="button"
              onClick={onCopy}
              disabled={!hasOutput}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded transition cursor-pointer shadow-sm font-sans ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : hasOutput
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-transparent'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy Code
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onDownload}
              disabled={!hasOutput}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded border transition cursor-pointer font-sans shadow-xs ${
                hasOutput
                  ? 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              <Download className="w-3 h-3" />
              {files.length > 1 ? `Download (${files.length} .java in .zip)` : 'Download .java'}
            </button>
          </div>
        </div>

        {/* Tab bar when multiple classes exist */}
        {files.length > 1 && (
          <div className="flex items-center bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/80 overflow-x-auto scrollbar-none px-2 py-1.5 gap-1.5 shrink-0 min-h-[36px]">
            {files.map((file, idx) => (
              <button
                key={file.filename}
                type="button"
                onClick={() => onSelectFileIndex(idx)}
                className={`px-3 py-1 text-xs font-mono rounded transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                  activeFileIndex === idx
                    ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-300 dark:border-indigo-500/40 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent'
                }`}
              >
                <FileCode className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                {file.filename}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 min-h-0 relative">
          <Editor
            height="100%"
            defaultLanguage="java"
            theme={isDark ? 'vs-dark' : 'vs'}
            value={currentCode}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, 'Courier New', monospace",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
              folding: true,
              lineNumbers: 'on',
            }}
          />
        </div>
      </div>
    </div>
  );
};
