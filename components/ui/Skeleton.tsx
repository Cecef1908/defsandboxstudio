// ============================================================================
// SKELETON - États de chargement élégants
// ============================================================================

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
  count?: number;
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%]';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style = {
    width: width || (variant === 'circular' ? height : undefined),
    height: height || (variant === 'text' ? '1rem' : undefined),
  };

  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  ));

  return count > 1 ? <div className="space-y-3">{skeletons}</div> : skeletons[0];
}

// ============================================================================
// SKELETON PRESETS
// ============================================================================

export function SkeletonCard() {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width="48px" height="48px" />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height="20px" />
          <Skeleton width="40%" height="16px" />
        </div>
      </div>
      <Skeleton height="100px" />
      <div className="flex gap-2">
        <Skeleton width="80px" height="32px" />
        <Skeleton width="80px" height="32px" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-800 p-4">
        <div className="grid grid-cols-4 gap-4">
          <Skeleton height="16px" />
          <Skeleton height="16px" />
          <Skeleton height="16px" />
          <Skeleton height="16px" />
        </div>
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="border-b border-slate-800 p-4 last:border-0">
          <div className="grid grid-cols-4 gap-4">
            <Skeleton height="16px" />
            <Skeleton height="16px" />
            <Skeleton height="16px" />
            <Skeleton height="16px" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="circular" width="48px" height="48px" />
        <Skeleton width="24px" height="24px" />
      </div>
      <Skeleton width="80px" height="32px" className="mb-2" />
      <Skeleton width="120px" height="16px" />
    </div>
  );
}
