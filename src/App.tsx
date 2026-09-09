import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { ConfigToolbar } from './components/ConfigToolbar';
import { EditorWorkspace } from './components/EditorWorkspace';
import { convertJsonToDto } from './lib/converter';
import type { ConverterConfig } from './lib/converter/types';

const SAMPLE_JSON = `{
  "customer_id": 982347109283741234,
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "is_active": true,
  "account_balance": 1450000.75,
  "registered_at": "2026-09-09T14:48:00Z",
  "birth_date": "1994-05-20",
  "default": true,
  "class": "PREMIUM_VIP",
  "address": {
    "street": "123 Business Avenue",
    "city": "Jakarta",
    "postal_code": "12190"
  },
  "roles": ["ADMIN", "USER"],
  "orders": [
    {
      "order_id": 48271892,
      "item_name": "Ultra Cloud Server Subscription",
      "total_amount": 250000.0,
      "shipped": true
    }
  ]
}`;

export const App: React.FC = () => {
  const [rawJson, setRawJson] = useState<string>(SAMPLE_JSON);
  const [debouncedJson, setDebouncedJson] = useState<string>(SAMPLE_JSON);
  const [config, setConfig] = useState<ConverterConfig>({
    rootClassName: 'CustomerProfile',
    packageName: 'com.example.dto',
    dtoType: 'CLASS',
    useLombok: false,
    useLombokBuilder: false,
    useJsonProperty: false,
    useJakartaValidation: false,
    detectIsoDates: true,
  });

  const [copied, setCopied] = useState<boolean>(false);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  // Debounce JSON changes by 250ms for smooth editing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedJson(rawJson);
    }, 250);
    return () => clearTimeout(timer);
  }, [rawJson]);

  // Conversion result
  const generatedCode = useMemo(() => {
    if (!debouncedJson.trim()) {
      setErrorFeedback(null);
      return '';
    }

    try {
      const result = convertJsonToDto(debouncedJson, config);
      setErrorFeedback(null);
      return result.code;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorFeedback(`JSON Parse Error: ${message}`);
      return '';
    }
  }, [debouncedJson, config]);

  const handleCopy = useCallback(async () => {
    if (!generatedCode) return;
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  }, [generatedCode]);

  const handleDownload = useCallback(() => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.rootClassName || 'Dto'}.java`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [generatedCode, config.rootClassName]);

  const handleLoadSample = useCallback(() => {
    setRawJson(SAMPLE_JSON);
    setConfig((prev) => ({
      ...prev,
      rootClassName: 'CustomerProfile',
    }));
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Header
        onCopy={handleCopy}
        onDownload={handleDownload}
        copied={copied}
        hasOutput={Boolean(generatedCode)}
        onLoadSample={handleLoadSample}
      />
      <ConfigToolbar config={config} onChange={setConfig} />
      <EditorWorkspace
        rawJson={rawJson}
        onJsonChange={(val) => setRawJson(val ?? '')}
        generatedCode={generatedCode}
        errorFeedback={errorFeedback}
      />
    </div>
  );
};

export default App;
