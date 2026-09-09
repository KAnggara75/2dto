import React from 'react';
import { Copy, Check, Download, ShieldCheck, Code2, Sparkles } from 'lucide-react';

interface HeaderProps {
  onCopy: () => void;
  onDownload: () => void;
  copied: boolean;
  hasOutput: boolean;
  onLoadSample: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onCopy,
  onDownload,
  copied,
  hasOutput,
  onLoadSample,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur px-4 py-3 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-inner">
          <Code2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              2dto
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Client-Side
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            100% Private in-browser AST engine. Zero data leaves your machine.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onLoadSample}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
          title="Load Sample JSON"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Load Sample
        </button>

        <button
          type="button"
          onClick={onCopy}
          disabled={!hasOutput}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer shadow-sm ${
            copied
              ? 'bg-emerald-600 text-white'
              : hasOutput
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" /> Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" /> Copy Code
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onDownload}
          disabled={!hasOutput}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md border transition cursor-pointer ${
            hasOutput
              ? 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200'
              : 'border-slate-800 bg-slate-900/50 text-slate-600 cursor-not-allowed'
          }`}
        >
          <Download className="w-3.5 h-3.5" /> Download .java
        </button>

        <a
          href="https://github.com/KAnggara75/2dto"
          target="_blank"
          rel="noreferrer"
          className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition"
          aria-label="GitHub Repository"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>
      </div>
    </header>
  );
};
