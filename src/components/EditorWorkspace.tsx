import React, { useState, useRef, useCallback, useEffect } from 'react';
import Editor, { BeforeMount } from '@monaco-editor/react';
import { AlertCircle, FileCode, Files, GripVertical, Sparkles, Copy, Check, Download } from 'lucide-react';
import type { GeneratedJavaFile } from '../lib/converter/types';

const handleEditorWillMount: BeforeMount = (monaco) => {
  // Enhanced Java tokenizer so types (PascalCase & primitives) are tokenized as 'type'
  // and field identifiers/variables are tokenized as 'variable'
  monaco.languages.setMonarchTokensProvider('java', {
    defaultToken: '',
    tokenPostfix: '.java',
    keywords: [
      'abstract', 'continue', 'for', 'new', 'switch', 'assert', 'default',
      'goto', 'package', 'synchronized', 'boolean', 'do', 'if', 'private',
      'this', 'break', 'double', 'implements', 'protected', 'throw', 'byte',
      'else', 'import', 'public', 'throws', 'case', 'enum', 'instanceof',
      'return', 'transient', 'catch', 'extends', 'int', 'short', 'try',
      'char', 'final', 'interface', 'static', 'void', 'class', 'finally',
      'long', 'strictfp', 'volatile', 'const', 'float', 'native', 'super',
      'while', 'true', 'false', 'yield', 'record', 'sealed', 'non-sealed',
      'permits',
    ],
    operators: [
      '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=', '&&', '||',
      '++', '--', '+', '-', '*', '/', '&', '|', '^', '%', '<<', '>>', '>>>',
      '+=', '-=', '*=', '/=', '&=', '|=', '^=', '%=', '<<=', '>>=', '>>>=',
    ],
    symbols: /[=><!~?:&|+\-*\/\^%]+/,
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
    digits: /\d+(_+\d+)*/,
    octaldigits: /[0-7]+(_+[0-7]+)*/,
    binarydigits: /[0-1]+(_+[0-1]+)*/,
    hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,
    tokenizer: {
      root: [
        ['non-sealed', 'keyword.non-sealed'],
        // @ Annotations
        [/@\s*[a-zA-Z_$][\w$]*/, 'annotation'],
        // Words: keywords, types, collections, or variables
        [
          /[a-zA-Z_$][\w$]*/,
          {
            cases: {
              '@keywords': { token: 'keyword.$0' },
              // List and Map colored green (#98c379)
              '^(List|Map)$': 'type.collection',
              // Other Classes / Types start with uppercase (e.g. String, Long, UserDto)
              '^[A-Z][\\w$]*': 'type',
              '@default': 'variable',
            },
          },
        ],
        { include: '@whitespace' },
        [/[{}()\[\]]/, '@brackets'],
        [/[<>](?!@symbols)/, '@brackets'],
        [
          /@symbols/,
          {
            cases: {
              '@operators': 'delimiter',
              '@default': '',
            },
          },
        ],
        [/(@digits)[eE]([\-+]?(@digits))?[fFdD]?/, 'number.float'],
        [/(@digits)\.(@digits)([eE][\-+]?(@digits))?[fFdD]?/, 'number.float'],
        [/0[xX](@hexdigits)[Ll]?/, 'number.hex'],
        [/0(@octaldigits)[Ll]?/, 'number.octal'],
        [/0[bB](@binarydigits)[Ll]?/, 'number.binary'],
        [/(@digits)[fFdD]/, 'number.float'],
        [/(@digits)[lL]?/, 'number'],
        [/[;,.]/, 'delimiter'],
        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/"""/, 'string', '@multistring'],
        [/"/, 'string', '@string'],
        [/'[^\\']'/, 'string'],
        [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
        [/'/, 'string.invalid'],
      ],
      whitespace: [
        [/[ \t\r\n]+/, ''],
        [/\/\*\*(?!\/)/, 'comment.doc', '@javadoc'],
        [/\/\*/, 'comment', '@comment'],
        [/\/\/.*$/, 'comment'],
      ],
      comment: [
        [/[^\/*]+/, 'comment'],
        [/\*\//, 'comment', '@pop'],
        [/[\/*]/, 'comment'],
      ],
      javadoc: [
        [/[^\/*]+/, 'comment.doc'],
        [/\*\//, 'comment.doc', '@pop'],
        [/[\/*]/, 'comment.doc'],
      ],
      string: [
        [/[^\\"]+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/"/, 'string', '@pop'],
      ],
      multistring: [
        [/[^\\"]+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/"""/, 'string', '@pop'],
        [/./, 'string'],
      ],
    },
  });

  monaco.editor.defineTheme('one-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      // Java modifiers & keywords: Purple (#c678dd)
      { token: 'keyword', foreground: 'c678dd' },
      { token: 'keyword.private', foreground: 'c678dd' },
      { token: 'keyword.public', foreground: 'c678dd' },
      { token: 'keyword.protected', foreground: 'c678dd' },
      { token: 'keyword.package', foreground: 'c678dd' },
      { token: 'keyword.import', foreground: 'c678dd' },
      { token: 'keyword.class', foreground: 'c678dd' },
      { token: 'keyword.static', foreground: 'c678dd' },
      { token: 'keyword.final', foreground: 'c678dd' },
      { token: 'keyword.record', foreground: 'c678dd' },
      // Primitive types & Class / DTO types: Yellow (#e5c07b)
      { token: 'keyword.void', foreground: 'e5c07b' },
      { token: 'keyword.int', foreground: 'e5c07b' },
      { token: 'keyword.long', foreground: 'e5c07b' },
      { token: 'keyword.double', foreground: 'e5c07b' },
      { token: 'keyword.float', foreground: 'e5c07b' },
      { token: 'keyword.boolean', foreground: 'e5c07b' },
      { token: 'keyword.byte', foreground: 'e5c07b' },
      { token: 'keyword.short', foreground: 'e5c07b' },
      { token: 'keyword.char', foreground: 'e5c07b' },
      { token: 'type', foreground: 'e5c07b' },
      { token: 'class', foreground: 'e5c07b' },
      // Collections (List and Map): Green (#98c379)
      { token: 'type.collection', foreground: '98c379' },
      // Variable names & field identifiers: Red (#e06c75)
      { token: 'variable', foreground: 'e06c75' },
      { token: 'identifier', foreground: 'e06c75' },
      // Strings, numbers, comments, annotations
      { token: 'string', foreground: '98c379' },
      { token: 'number', foreground: 'd19a66' },
      { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
      { token: 'annotation', foreground: '61afef' },
      { token: 'delimiter', foreground: 'abb2bf' },
      { token: 'delimiter.bracket', foreground: 'abb2bf' },
    ],
    colors: {
      'editor.background': '#222222',
      'editor.foreground': '#abb2bf',
      'editor.lineHighlightBackground': '#2a2a2a',
      'editorLineNumber.foreground': '#5c6370',
      'editorLineNumber.activeForeground': '#abb2bf',
      'editorCursor.foreground': '#528bff',
      'editor.selectionBackground': '#3a3f4b',
      'editor.inactiveSelectionBackground': '#30343d',
    },
  });
};

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
        className="flex flex-col h-full min-h-0 bg-white dark:bg-[#222222] border-r border-slate-200 dark:border-[#333333] shrink-0 overflow-hidden"
      >
        <div className="bg-slate-100/90 dark:bg-[#1e1e1e] px-4 py-2 border-b border-slate-200 dark:border-[#333333] flex items-center justify-between text-xs font-mono text-slate-700 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${statusColorClass}`}
              title={`Status: ${statusLabel}`}
            ></span>
            <span className="font-semibold text-slate-800 dark:text-slate-300">Input JSON</span>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-sans font-medium">({statusLabel})</span>
          </div>
          <span className="text-[11px] text-slate-600 dark:text-slate-400">Auto-formats on paste</span>
        </div>

        <div className="flex-1 min-h-0 relative">
          <Editor
            height="100%"
            defaultLanguage="json"
            beforeMount={handleEditorWillMount}
            theme={isDark ? 'one-dark' : 'vs'}
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
      <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 bg-white dark:bg-[#222222] overflow-hidden">
        <div className="bg-slate-100/90 dark:bg-[#1e1e1e] px-4 py-1.5 border-b border-slate-200 dark:border-[#333333] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-700 dark:text-slate-400 shrink-0 min-h-[42px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
            <FileCode className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-300">Generated Java DTO</span>
            {files.length > 1 && (
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-300 dark:border-indigo-500/30 flex items-center gap-1 font-sans font-medium">
                <Files className="w-3 h-3" /> {files.length} Separate Files
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onLoadSample}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded bg-white dark:bg-[#2e2e2e] hover:bg-slate-50 dark:hover:bg-[#383838] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-[#3a3a3a] transition cursor-pointer font-sans shadow-xs"
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
                  : 'bg-slate-100 dark:bg-[#1a1a1a] text-slate-500 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-transparent'
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
                  ? 'border-slate-300 dark:border-[#3a3a3a] bg-white dark:bg-[#2e2e2e] hover:bg-slate-50 dark:hover:bg-[#383838] text-slate-700 dark:text-slate-200'
                  : 'border-slate-200 dark:border-[#333333] bg-slate-100/50 dark:bg-[#1a1a1a]/50 text-slate-500 dark:text-slate-500 cursor-not-allowed'
              }`}
            >
              <Download className="w-3 h-3" />
              {files.length > 1 ? `Download (${files.length} .java in .zip)` : 'Download .java'}
            </button>
          </div>
        </div>

        {/* Tab bar when multiple classes exist */}
        {files.length > 1 && (
          <div className="flex items-center bg-slate-50 dark:bg-[#1e1e1e] border-b border-slate-200 dark:border-[#333333] overflow-x-auto scrollbar-none px-2 py-1.5 gap-1.5 shrink-0 min-h-[36px]">
            {files.map((file, idx) => (
              <button
                key={file.filename}
                type="button"
                onClick={() => onSelectFileIndex(idx)}
                className={`px-3 py-1 text-xs font-mono rounded transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                  activeFileIndex === idx
                    ? 'bg-white dark:bg-[#2e2e2e] text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-300 dark:border-indigo-500/40 shadow-xs'
                    : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#282828] border border-transparent'
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
            beforeMount={handleEditorWillMount}
            theme={isDark ? 'one-dark' : 'vs'}
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
