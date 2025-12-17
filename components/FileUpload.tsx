import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Plus, ShieldCheck } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (files: FileList) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isProcessing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (!isProcessing) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fileInputRef.current?.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files);
    }
  };

  return (
    <div className="w-full mb-12 animate-in fade-in zoom-in duration-500">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-3 border-dashed rounded-[2rem] p-12 text-center cursor-pointer transition-all duration-300 group overflow-hidden
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02] shadow-xl shadow-indigo-100' 
            : 'border-slate-200 hover:border-indigo-400 hover:bg-white/80 bg-white/50 backdrop-blur-sm'}
          ${isProcessing ? 'opacity-60 cursor-not-allowed grayscale' : ''}
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          className="hidden"
          accept="application/pdf,image/png,image/jpeg,image/webp"
          multiple
          disabled={isProcessing}
        />

        {/* Decorative background circle */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-10 transition-opacity duration-500 ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

        <div className="flex flex-col items-center justify-center space-y-6 relative z-10">
          <div className={`p-6 rounded-full transition-transform duration-500 relative ${isDragging ? 'scale-110' : 'group-hover:scale-110'}`}>
            <div className="absolute inset-0 bg-indigo-100 rounded-full animate-pulse opacity-50"></div>
            <div className="bg-white p-5 rounded-full shadow-lg relative z-10">
                <UploadCloud className={`w-10 h-10 text-indigo-600 ${isProcessing ? 'animate-bounce' : ''}`} />
            </div>
            {!isProcessing && (
               <div className="absolute -top-1 -right-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full p-1.5 border-4 border-white shadow-sm">
                 <Plus className="w-3 h-3 text-white" />
               </div>
            )}
          </div>

          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
              {isProcessing ? 'Analyzing Documents...' : 'Upload Bank Statements'}
            </h3>
            <p className="text-lg text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
              Drag & Drop PDF or Images here, or click to browse.
            </p>
             <div className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                Processed securely on device
             </div>
          </div>

          {!isProcessing && (
            <div className="flex flex-wrap justify-center gap-4 text-sm font-semibold text-slate-500">
              <span className="flex items-center px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100"><FileText className="w-4 h-4 mr-2 text-indigo-500" /> PDF Statements</span>
              <span className="flex items-center px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100"><ImageIcon className="w-4 h-4 mr-2 text-indigo-500" /> Receipts</span>
              <span className="flex items-center px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100"><ImageIcon className="w-4 h-4 mr-2 text-indigo-500" /> Invoices</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;