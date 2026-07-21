import { memo } from 'react';

/**
 * Reusable Container grid max-width limiter.
 */
const Container = memo(({
  children,
  className = '',
}) => {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full ${className}`}>
      {children}
    </div>
  );
});

Container.displayName = 'Container';

export default Container;
