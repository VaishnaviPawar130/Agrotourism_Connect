import { ChangeEvent, useRef } from 'react';
import { UploadCloud } from 'lucide-react';

export function FileUpload({
  label = 'Upload files',
  multiple = true,
  accept,
  onFilesSelected,
}: {
  label?: string;
  multiple?: boolean;
  accept?: string;
  onFilesSelected: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length) onFilesSelected(files);
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-slate-300 bg-brand-cream px-4 py-6 text-sm text-slate-500 hover:border-brand-sage hover:text-brand-forest"
      >
        <UploadCloud className="h-5 w-5" />
        {label}
      </button>
      <input ref={inputRef} type="file" multiple={multiple} accept={accept} onChange={handleChange} className="hidden" />
    </div>
  );
}
