import React from 'react';
import { cn } from '@/lib/utils';

const LoadingSpinner = ({ size = 'md', className, ...props }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <div
      className={cn(
        'loading-spinner',
        sizes[size],
        className
      )}
      {...props}
    />
  );
};

const LoadingDots = ({ className, ...props }) => (
  <div
    className={cn('loading-dots', className)}
    {...props}
  >
    <div />
    <div />
    <div />
  </div>
);

const LoadingSkeleton = ({ 
  type = 'text', 
  className, 
  lines = 1,
  ...props 
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return (
          <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'skeleton-text',
                  i === lines - 1 && 'w-3/4',
                  className
                )}
              />
            ))}
          </div>
        );
      case 'title':
        return <div className={cn('skeleton-title', className)} />;
      case 'avatar':
        return <div className={cn('skeleton-avatar', className)} />;
      case 'card':
        return <div className={cn('skeleton-card', className)} />;
      default:
        return <div className={cn('skeleton', className)} />;
    }
  };

  return renderSkeleton();
};

const LoadingOverlay = ({ 
  isLoading, 
  children, 
  message = 'Loading...',
  className,
  ...props 
}) => {
  if (!isLoading) return children;

  return (
    <div className="relative" {...props}>
      {children}
      <div
        className={cn(
          'absolute inset-0 bg-white bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center z-10',
          className
        )}
      >
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
        </div>
      </div>
    </div>
  );
};

const LoadingPage = ({ message = 'Loading...', className, ...props }) => (
  <div
    className={cn(
      'min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900',
      className
    )}
    {...props}
  >
    <div className="text-center">
      <LoadingSpinner size="xl" className="mx-auto mb-4" />
      <p className="text-lg text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  </div>
);

export {
  LoadingSpinner,
  LoadingDots,
  LoadingSkeleton,
  LoadingOverlay,
  LoadingPage,
};
