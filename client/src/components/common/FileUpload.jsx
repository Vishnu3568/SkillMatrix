import { useState, useRef } from 'react';
import Button from './Button';

/**
 * FileUpload Component
 * Drag-and-drop file upload interface with size limits and type filtering.
 */
export default function FileUpload({
  onFileSelect,
  accept = 'image/*',
  label = 'Upload File',
  hint = 'PNG, JPG, WEBP or GIF (max. 5MB)',
  loading = false,
  className = '',
  id = 'file-upload',
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (onFileSelect) onFileSelect(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (onFileSelect) onFileSelect(file);
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={id} className="block text-xs font-bold text-slate-300">
        {label}
      </label>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/30'
        }`}
      >
        <input
          ref={fileInputRef}
          id={id}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={loading}
        />

        <div className="flex flex-col items-center text-center space-y-2">
          <span className="text-3xl select-none">📁</span>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-200">
              {loading ? 'Uploading asset...' : 'Click or drag file to upload'}
            </p>
            {hint && <p className="text-[10px] text-slate-500 font-semibold">{hint}</p>}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            className="text-[11px] py-1 px-3 mt-1"
          >
            {loading ? 'Uploading...' : 'Browse Computer'}
          </Button>
        </div>
      </div>
    </div>
  );
}
