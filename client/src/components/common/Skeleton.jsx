import { memo } from 'react';

/**
 * Reusable skeleton placeholder loader.
 */
const Skeleton = memo(({
  variant = 'text',
  width,
  height,
  className = '',
}) => {
  const shapes = {
    circle: 'rounded-full',
    rect: 'rounded-lg',
    text: 'rounded h-3 w-full my-1.5',
  };

  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div
      style={style}
      className={`animate-pulse bg-slate-800/80 ${shapes[variant]} ${className}`}
    />
  );
});

Skeleton.displayName = 'Skeleton';

export default Skeleton;
