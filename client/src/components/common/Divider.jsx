import { memo } from 'react';

/**
 * Reusable Divider line separator component.
 */
const Divider = memo(({
  orientation = 'horizontal',
  className = '',
}) => {
  return (
    <div
      role="separator"
      className={`bg-white/5 border-none shrink-0 ${
        orientation === 'horizontal' ? 'h-[1px] w-full my-4' : 'w-[1px] h-full mx-4'
      } ${className}`}
    />
  );
});

Divider.displayName = 'Divider';

export default Divider;
