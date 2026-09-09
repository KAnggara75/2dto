import React from 'react';
import { CheckSquare, Square, Package, Type, Sun, Moon, Laptop } from 'lucide-react';
import type { ConverterConfig } from '../lib/converter/types';

interface ConfigToolbarProps {
  config: ConverterConfig;
  onChange: (newConfig: ConverterConfig) => void;
  themeMode?: 'system' | 'light' | 'dark';
  onSelectThemeMode?: (mode: 'system' | 'light' | 'dark') => void;
}

export const ConfigToolbar: React.FC<ConfigToolbarProps> = ({
  config,
  onChange,
  themeMode = 'system',
  onSelectThemeMode,
}) => {
  const update = <K extends keyof ConverterConfig>(key: K, value: ConverterConfig[K]) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-300">
      <div className="flex flex-wrap items-center gap-4">
        {/* GitHub Link */}
        <a
          href="https://github.com/KAnggara75/2dto"
          target="_blank"
          rel="noreferrer"
          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 transition"
          aria-label="GitHub Repository"
          title="View on GitHub"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
        </a>

        {/* Output Mode: Standard Class vs Record */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => update('dtoType', 'CLASS')}
            className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
              config.dtoType === 'CLASS'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Java Class (POJO)
          </button>
          <button
            type="button"
            onClick={() => update('dtoType', 'RECORD')}
            className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
              config.dtoType === 'RECORD'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Java 17+ Record
          </button>
        </div>

        {/* Root Class Name */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
          <Type className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span className="text-slate-500 dark:text-slate-400">Class:</span>
          <input
            type="text"
            value={config.rootClassName}
            onChange={(e) => update('rootClassName', e.target.value)}
            placeholder="RootDto"
            className="bg-transparent border-none outline-none text-slate-900 dark:text-white font-mono text-xs w-28 focus:ring-0"
          />
        </div>

        {/* Package Name */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
          <Package className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span className="text-slate-500 dark:text-slate-400">Package:</span>
          <input
            type="text"
            value={config.packageName}
            onChange={(e) => update('packageName', e.target.value)}
            placeholder="com.example.dto"
            className="bg-transparent border-none outline-none text-slate-900 dark:text-white font-mono text-xs w-36 focus:ring-0"
          />
        </div>
      </div>

      {/* Checkbox options */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition select-none">
          <input
            type="checkbox"
            checked={config.useJsonProperty}
            onChange={(e) => update('useJsonProperty', e.target.checked)}
            className="sr-only"
          />
          {config.useJsonProperty ? (
            <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          ) : (
            <Square className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          )}
          <span>@JsonProperty</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition select-none">
          <input
            type="checkbox"
            checked={config.detectIsoDates}
            onChange={(e) => update('detectIsoDates', e.target.checked)}
            className="sr-only"
          />
          {config.detectIsoDates ? (
            <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          ) : (
            <Square className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          )}
          <span>ISO Dates (Instant / LocalDate)</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition select-none">
          <input
            type="checkbox"
            checked={config.useJakartaValidation}
            onChange={(e) => update('useJakartaValidation', e.target.checked)}
            className="sr-only"
          />
          {config.useJakartaValidation ? (
            <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          ) : (
            <Square className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          )}
          <span>Jakarta Validation (@NotNull, @Valid)</span>
        </label>

        {config.dtoType === 'CLASS' && (
          <>
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition select-none">
              <input
                type="checkbox"
                checked={config.useLombok}
                onChange={(e) => update('useLombok', e.target.checked)}
                className="sr-only"
              />
              {config.useLombok ? (
                <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              )}
              <span>Lombok (@Data)</span>
            </label>

            {config.useLombok && (
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition select-none">
                <input
                  type="checkbox"
                  checked={config.useLombokBuilder}
                  onChange={(e) => update('useLombokBuilder', e.target.checked)}
                  className="sr-only"
                />
                {config.useLombokBuilder ? (
                  <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                )}
                <span>@Builder</span>
              </label>
            )}
          </>
        )}

        {/* 3-Way Theme Mode Selector: Light, Dark, System */}
        {onSelectThemeMode && (
          <div className="pl-2 border-l border-slate-200 dark:border-slate-800 flex items-center">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => onSelectThemeMode('light')}
                className={`px-2 py-1 rounded-md transition cursor-pointer flex items-center gap-1 font-medium ${
                  themeMode === 'light'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Light mode"
                aria-label="Light mode"
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px] hidden sm:inline">Light</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectThemeMode('dark')}
                className={`px-2 py-1 rounded-md transition cursor-pointer flex items-center gap-1 font-medium ${
                  themeMode === 'dark'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Dark mode"
                aria-label="Dark mode"
              >
                <Moon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span className="text-[11px] hidden sm:inline">Dark</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectThemeMode('system')}
                className={`px-2 py-1 rounded-md transition cursor-pointer flex items-center gap-1 font-medium ${
                  themeMode === 'system'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Follow system preference"
                aria-label="System mode"
              >
                <Laptop className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span className="text-[11px] hidden sm:inline">System</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
