import Button from './Button';

/**
 * ImagePreview Component
 * Responsive image thumbnail preview with Replace and Remove actions.
 */
export default function ImagePreview({
  src,
  alt = 'Image preview',
  onRemove,
  onReplace,
  className = '',
}) {
  if (!src) return null;

  return (
    <div className={`relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950/60 p-2 ${className}`}>
      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      </div>

      <div className="flex items-center justify-between gap-2 mt-2">
        <span className="text-[10px] text-slate-400 font-bold truncate">Uploaded Preview</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {onReplace && (
            <Button type="button" variant="outline" size="sm" onClick={onReplace} className="text-[10px] py-0.5 px-2">
              Replace
            </Button>
          )}
          {onRemove && (
            <Button type="button" variant="danger" size="sm" onClick={onRemove} className="text-[10px] py-0.5 px-2">
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
