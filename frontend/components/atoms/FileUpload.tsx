
import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  label?: string;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, accept = "*", label = "Upload File", className }) => {
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      onFileSelect(selected);
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div 
      onClick={() => inputRef.current?.click()}
      className={cn(
        "relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all cursor-pointer hover:bg-muted/30",
        file ? "border-primary/50 bg-primary/5" : "border-muted-foreground/20",
        className
      )}
    >
      <input 
        type="file" 
        ref={inputRef} 
        className="hidden" 
        onChange={handleFileChange} 
        accept={accept}
      />
      {file ? (
        <div className="flex flex-col items-center">
          <div className="h-12 w-10 bg-white dark:bg-slate-800 rounded shadow-sm border flex items-center justify-center mb-2">
            {file.type.includes('image') ? <ImageIcon className="text-primary h-5 w-5" /> : <FileText className="text-primary h-5 w-5" />}
          </div>
          <p className="text-xs font-medium truncate max-w-[150px]">{file.name}</p>
          <button 
            className="mt-2 p-1 text-rose-500 hover:bg-rose-50 rounded-full"
            onClick={removeFile}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          <div className="p-3 bg-primary/10 rounded-full text-primary mb-2">
            <Upload className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-[10px] text-muted-foreground mt-1 text-center">Click or drag and drop</p>
        </>
      )}
    </div>
  );
};

export default FileUpload;
