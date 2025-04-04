import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileType, Loader, AlertCircle } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { useMindMapStore } from '../lib/store';
import * as pdfjsLib from 'pdfjs-dist';
import { detectLanguage } from '../lib/languageDetection';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const SUPPORTED_TYPES = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'application/pdf': ['.pdf']
};

// Add memory management for workers
const workerPool = new Map();

export function DocumentUploader() {
  const { setDocument, setProcessing, setError } = useMindMapStore();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const workerRef = useRef(null);

  // Cleanup workers on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      // Cleanup worker pool
      workerPool.forEach(worker => worker.terminate());
      workerPool.clear();
    };
  }, []);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    try {
      for (let i = 1; i <= pdf.numPages; i++) {
        setProcessingStatus(`Processing page ${i} of ${pdf.numPages}`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n\n';
      }
    } finally {
      // Ensure PDF is destroyed to prevent memory leaks
      pdf.destroy();
    }

    return fullText;
  };

  const extractTextFromImage = async (file: File): Promise<string> => {
    if (workerRef.current) {
      await workerRef.current.terminate();
    }

    workerRef.current = await createWorker();
    
    try {
      await workerRef.current.loadLanguage('eng+fra+spa+deu+ita+por');
      await workerRef.current.initialize('eng');

      const { data: { text } } = await workerRef.current.recognize(file, {
        progress: (progress) => {
          setProcessingStatus(`OCR Processing: ${Math.round(progress * 100)}%`);
        }
      });

      return text;
    } finally {
      await workerRef.current.terminate();
      workerRef.current = null;
    }
  };

  const processFile = async (file: File) => {
    try {
      setProcessing(true);
      setError(null);
      setUploadProgress(0);
      setProcessingStatus('Starting processing...');

      let content = '';
      const fileType = file.type;

      if (fileType.startsWith('image/')) {
        content = await extractTextFromImage(file);
      } else if (fileType === 'application/pdf') {
        content = await extractTextFromPDF(file);
      }

      // Clean up the extracted text
      content = content
        .replace(/\s+/g, ' ')
        .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
        .trim();

      if (!content) {
        throw new Error('No text could be extracted from the document');
      }

      // Detect language
      const languageInfo = detectLanguage(content);
      
      setDocument({
        content,
        language: languageInfo.code,
        originalFormat: fileType,
        languageInfo: {
          name: languageInfo.name,
          confidence: languageInfo.confidence,
          alternatives: languageInfo.alternatives
        }
      });

      setProcessingStatus('Processing complete!');
      setTimeout(() => setProcessingStatus(''), 2000);
    } catch (error) {
      console.error('Error processing document:', error);
      setError(error instanceof Error ? error.message : 'Error processing document');
      setProcessingStatus('');
    } finally {
      setProcessing(false);
      setUploadProgress(0);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.size <= MAX_FILE_SIZE) {
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      processFile(file).finally(() => {
        clearInterval(interval);
        setUploadProgress(100);
      });
    } else {
      setError('File too large. Maximum size is 25MB.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: SUPPORTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          p-8 border-2 border-dashed rounded-xl transition-colors cursor-pointer
          ${isDragActive 
            ? 'border-violet-500 bg-violet-50' 
            : 'border-gray-300 hover:border-violet-400'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4 text-center">
          <Upload 
            className={`w-12 h-12 ${
              isDragActive ? 'text-violet-500' : 'text-gray-400'
            }`}
          />
          <div>
            <p className="text-lg font-medium text-gray-700">
              Drop your document here or click to upload
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Supports PNG, JPEG, and PDF files up to 25MB
            </p>
          </div>
        </div>
      </div>

      {(uploadProgress > 0 || processingStatus) && (
        <div className="space-y-2">
          {uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
          {processingStatus && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader className="w-4 h-4 animate-spin" />
              {processingStatus}
            </div>
          )}
        </div>
      )}

      <div className="text-sm text-gray-500">
        <p className="flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          For best results:
        </p>
        <ul className="list-disc ml-5 mt-1">
          <li>Use clear, high-resolution images</li>
          <li>Ensure text is clearly visible and not blurred</li>
          <li>PDF documents should have selectable text</li>
          <li>Documents can be in any language - we'll detect it automatically</li>
        </ul>
      </div>
    </div>
  );
}