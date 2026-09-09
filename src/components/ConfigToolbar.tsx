import React from 'react';
import { CheckSquare, Square, Package, Type } from 'lucide-react';
import type { ConverterConfig } from '../lib/converter/types';

interface ConfigToolbarProps {
  config: ConverterConfig;
  onChange: (newConfig: ConverterConfig) => void;
}

export const ConfigToolbar: React.FC<ConfigToolbarProps> = ({ config, onChange }) => {
  const update = <K extends keyof ConverterConfig>(key: K, value: ConverterConfig[K]) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
      <div className="flex flex-wrap items-center gap-4">
        {/* Output Mode Record vs Lombok */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => update('dtoType', 'RECORD')}
            className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
              config.dtoType === 'RECORD'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Java 17+ Record
          </button>
          <button
            type="button"
            onClick={() => update('dtoType', 'LOMBOK')}
            className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
              config.dtoType === 'LOMBOK'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Lombok Class
          </button>
        </div>

        {/* Root Class Name */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
          <Type className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-400">Class:</span>
          <input
            type="text"
            value={config.rootClassName}
            onChange={(e) => update('rootClassName', e.target.value)}
            placeholder="RootDto"
            className="bg-transparent border-none outline-none text-white font-mono text-xs w-28 focus:ring-0"
          />
        </div>

        {/* Package Name */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
          <Package className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-400">Package:</span>
          <input
            type="text"
            value={config.packageName}
            onChange={(e) => update('packageName', e.target.value)}
            placeholder="com.example.dto"
            className="bg-transparent border-none outline-none text-white font-mono text-xs w-36 focus:ring-0"
          />
        </div>
      </div>

      {/* Checkbox options */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition select-none">
          <input
            type="checkbox"
            checked={config.detectIsoDates}
            onChange={(e) => update('detectIsoDates', e.target.checked)}
            className="sr-only"
          />
          {config.detectIsoDates ? (
            <CheckSquare className="w-4 h-4 text-indigo-400" />
          ) : (
            <Square className="w-4 h-4 text-slate-500" />
          )}
          <span>ISO Dates (Instant / LocalDate)</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition select-none">
          <input
            type="checkbox"
            checked={config.useJakartaValidation}
            onChange={(e) => update('useJakartaValidation', e.target.checked)}
            className="sr-only"
          />
          {config.useJakartaValidation ? (
            <CheckSquare className="w-4 h-4 text-indigo-400" />
          ) : (
            <Square className="w-4 h-4 text-slate-500" />
          )}
          <span>Jakarta Validation (@NotNull, @Valid)</span>
        </label>

        {config.dtoType === 'LOMBOK' && (
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition select-none">
            <input
              type="checkbox"
              checked={config.useLombokBuilder}
              onChange={(e) => update('useLombokBuilder', e.target.checked)}
              className="sr-only"
            />
            {config.useLombokBuilder ? (
              <CheckSquare className="w-4 h-4 text-indigo-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-500" />
            )}
            <span>@Builder</span>
          </label>
        )}
      </div>
    </div>
  );
};
