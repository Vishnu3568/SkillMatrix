import { memo } from 'react';

/**
 * Reusable Card component supporting glassmorphic theme styles.
 */
const Card = memo(({
  children,
  className = '',
  onClick,
  ...props
}) => {
  const isClickable = !!onClick;
  
  return (
    <div
      onClick={onClick}
      className={`glass rounded-xl p-5 border border-white/5 transition-all duration-200 ${
        isClickable ? 'cursor-pointer hover:border-indigo-500/30 hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
