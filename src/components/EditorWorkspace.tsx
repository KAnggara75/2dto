import React from 'react';
import Editor from '@monaco-editor/react';
import { AlertCircle, FileCode, CheckCircle2, Files } from 'lucide-react';
import type { GeneratedJavaFile } from '../lib/converter/types';

interface EditorWorkspaceProps {
  rawJson: string;
  onJsonChange: (value: string | undefined) => void;
  files: GeneratedJavaFile[];
  generatedCode: string;
  errorFeedback: string | null;
  activeFileIndex: number;
  onSelectFileIndex: (index: number) => void;
}

export const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({
  rawJson,
  onJsonChange,
  files,
  generatedCode,
  errorFeedback,
  activeFileIndex,
  onSelectFileIndex,
}) => {
  const currentCode =
    files.length > 0 && files[activeFileIndex]
      ? files[activeFileIndex].code
      : generatedCode;

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 h-[calc(100vh-105px)] overflow-hidden">
      {/* Left Pane: JSON Input */}
      <div className="flex flex-col h-full bg-slate-950">
        <div className="bg-slate-900/60 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Input JSON</span>
          </div>
          <span className="text-[11px] text-slate-500">Auto-formats on paste</span>
        </div>

        <div className="flex-1 relative">
          <Editor
            height="100%"
            defaultLanguage="json"
            theme="vs-dark"
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
          <div className="bg-rose-950/80 border-t border-rose-800/60 p-2.5 px-4 text-xs text-rose-200 flex items-start gap-2 backdrop-blur">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="font-mono break-all">{errorFeedback}</span>
          </div>
        )}
      </div>

      {/* Right Pane: Java DTO Output */}
      <div className="flex flex-col h-full bg-slate-950">
        <div className="bg-slate-900/60 px-4 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
            <span>Generated Java DTO</span>
            {files.length > 1 && (
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30 flex items-center gap-1">
                <Files className="w-3 h-3" /> {files.length} Separate Files
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400/90 font-sans">
            <CheckCircle2 className="w-3.5 h-3.5" /> 1 Class / File
          </div>
        </div>

        {/* Tab bar when multiple classes exist */}
        {files.length > 1 && (
          <div className="flex items-center bg-slate-950 border-b border-slate-800/80 overflow-x-auto scrollbar-none px-2 py-1 gap-1">
            {files.map((file, idx) => (
              <button
                key={file.filename}
                type="button"
                onClick={() => onSelectFileIndex(idx)}
                className={`px-3 py-1 text-xs font-mono rounded transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeFileIndex === idx
                    ? 'bg-slate-800 text-indigo-300 font-semibold border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <FileCode className="w-3 h-3" />
                {file.filename}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 relative">
          <Editor
            height="100%"
            defaultLanguage="java"
            theme="vs-dark"
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
