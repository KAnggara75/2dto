import React, { useState, useEffect, useMemo, useCallback } from 'react';
import JSZip from 'jszip';
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
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);

  // Debounce JSON changes by 250ms for smooth editing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedJson(rawJson);
    }, 250);
    return () => clearTimeout(timer);
  }, [rawJson]);

  // Conversion result
  const conversionResult = useMemo(() => {
    if (!debouncedJson.trim()) {
      setErrorFeedback(null);
      return { code: '', files: [], classes: [] };
    }

    try {
      const result = convertJsonToDto(debouncedJson, config);
      setErrorFeedback(null);
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorFeedback(`JSON Parse Error: ${message}`);
      return { code: '', files: [], classes: [] };
    }
  }, [debouncedJson, config]);

  const { code: generatedCode, files } = conversionResult;

  // Ensure active index is within bounds
  useEffect(() => {
    if (activeFileIndex >= files.length) {
      setActiveFileIndex(0);
    }
  }, [files.length, activeFileIndex]);

  const handleCopy = useCallback(async () => {
    const codeToCopy =
      files.length > 0 && files[activeFileIndex]
        ? files[activeFileIndex].code
        : generatedCode;

    if (!codeToCopy) return;
    try {
      await navigator.clipboard.writeText(codeToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  }, [files, activeFileIndex, generatedCode]);

  const handleDownload = useCallback(async () => {
    if (files.length === 0 && !generatedCode) return;

    if (files.length > 1) {
      // Download multi-file classes as zip archive
      const zip = new JSZip();
      for (const file of files) {
        zip.file(file.filename, file.code);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${config.rootClassName || 'dto'}-classes.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // Single file download
      const singleFile = files[0];
      const codeContent = singleFile ? singleFile.code : generatedCode;
      const filename = singleFile ? singleFile.filename : `${config.rootClassName || 'Dto'}.java`;

      const blob = new Blob([codeContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [files, generatedCode, config.rootClassName]);

  const handleLoadSample = useCallback(() => {
    setRawJson(SAMPLE_JSON);
    setConfig((prev) => ({
      ...prev,
      rootClassName: 'CustomerProfile',
    }));
    setActiveFileIndex(0);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <ConfigToolbar config={config} onChange={setConfig} />
      <EditorWorkspace
        rawJson={rawJson}
        onJsonChange={(val) => setRawJson(val ?? '')}
        files={files}
        generatedCode={generatedCode}
        errorFeedback={errorFeedback}
        activeFileIndex={activeFileIndex}
        onSelectFileIndex={setActiveFileIndex}
        onLoadSample={handleLoadSample}
        onCopy={handleCopy}
        onDownload={handleDownload}
        copied={copied}
        hasOutput={Boolean(generatedCode || files.length > 0)}
      />
    </div>
  );
};

export default App;
