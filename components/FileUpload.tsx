import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Plus, Lock } from 'lucide-react';

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
      // Clear the value so the same file can be selected again if needed (though we filter duplicates upstream)
      // This fixes the "onChange not firing for same file" issue.
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
    <div className="w-full mb-10">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-4 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 group
          ${isDragging ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' : 'border-gray-300 hover:border-indigo-400 hover:bg-white'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white'}
          shadow-sm hover:shadow-md
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          className="hidden"
          accept="application/pdf,image/png,image/jpeg,image/webp"
          multiple // Enabled multiple files
          disabled={isProcessing}
        />

        <div className="flex flex-col items-center justify-center space-y-5">
          <div className="bg-indigo-100 p-5 rounded-full group-hover:scale-110 transition-transform duration-300 relative">
            <UploadCloud className="w-10 h-10 text-indigo-600" />
            {!isProcessing && (
               <div className="absolute -top-1 -right-1 bg-indigo-600 rounded-full p-1 border-2 border-white">
                 <Plus className="w-3 h-3 text-white" />
               </div>
            )}
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {isProcessing ? 'Processing Batch...' : 'Upload Statements'}
            </h3>
            <p className="text-lg text-gray-500 mb-4">
              Drag & Drop multiple PDFs or Images here
            </p>
             <div className="inline-flex items-center text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                <Lock className="w-3 h-3 mr-1.5" />
                Files are processed securely in memory
             </div>
          </div>

          {!isProcessing && (
            <div className="flex gap-6 text-sm font-medium text-gray-400 bg-gray-50 px-6 py-2 rounded-full">
              <span className="flex items-center"><FileText className="w-4 h-4 mr-2" /> Multiple PDFs</span>
              <span className="flex items-center"><ImageIcon className="w-4 h-4 mr-2" /> Photo Batch</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;