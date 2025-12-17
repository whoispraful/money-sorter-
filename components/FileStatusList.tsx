import React from 'react';
import { FileTracker } from '../types';
import { FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface FileStatusListProps {
  files: FileTracker[];
}

const FileStatusList: React.FC<FileStatusListProps> = ({ files }) => {
  if (files.length === 0) return null;

  return (
    <div className="mb-8 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-900">File Queue ({files.length})</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {files.map((file) => (
          <div key={file.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3 overflow-hidden w-full">
              <div className={`p-2 rounded-lg flex-shrink-0 mt-1 ${file.status === 'ERROR' ? 'bg-red-50' : 'bg-blue-50'}`}>
                {file.status === 'ERROR' ? (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <FileText className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`font-medium truncate max-w-[200px] md:max-w-xs ${file.status === 'ERROR' ? 'text-red-700' : 'text-gray-900'}`}>
                  {file.file.name}
                </p>
                {/* Show error message explicitly if error, otherwise show size */}
                {file.status === 'ERROR' ? (
                   <p className="text-xs text-red-600 font-semibold mt-1 break-words leading-relaxed bg-red-50/50 p-2 rounded-lg border border-red-100">
                     {file.errorMessage || "Invalid file type"}
                   </p>
                ) : (
                   <p className="text-xs text-gray-500 mt-0.5">{(file.file.size / 1024).toFixed(0)} KB</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
              {file.status === 'PENDING' && (
                <span className="text-sm text-gray-400 font-medium bg-gray-50 px-3 py-1 rounded-full">Waiting...</span>
              )}
              {file.status === 'PROCESSING' && (
                <div className="flex items-center text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-sm font-medium">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing
                </div>
              )}
              {file.status === 'COMPLETE' && (
                <div className="flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Done
                </div>
              )}
              {file.status === 'ERROR' && (
                <div className="flex items-center text-red-700 bg-red-50 px-3 py-1 rounded-full text-sm font-bold border border-red-100 whitespace-nowrap">
                  Failed
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileStatusList;