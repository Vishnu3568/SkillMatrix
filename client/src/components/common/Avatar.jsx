import { useState, memo } from 'react';

/**
 * Reusable Avatar component with initial fallback loader.
 */
const Avatar = memo(({
  src,
  name = '',
  size = 'md',
  className = '',
}) => {
  const [error, setError] = useState(false);

  const getInitial = () => {
    if (!name) return '?';
    return name.trim().charAt(0).toUpperCase();
  };

  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg',
  };

  const hasImage = src && !error;

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden select-none font-bold bg-indigo-600 text-white shrink-0 ${sizes[size]} ${className}`}
    >
      {hasImage ? (
        <img
          src={src}
          alt={`${name}'s profile avatar`}
          onError={() => setError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{getInitial()}</span>
      )}
    </div>
  );
});

Avatar.displayName = 'Avatar';

export default Avatar;
