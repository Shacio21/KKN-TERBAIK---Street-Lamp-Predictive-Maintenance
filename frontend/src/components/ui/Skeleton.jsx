/**
 * @fileoverview Skeleton loading components for the PJU IoT Monitoring System.
 * Provides shimmer-animated placeholder elements used during data loading states.
 * Uses the existing `.shimmer` CSS class from the design system.
 */

/**
 * Base Skeleton element with shimmer animation.
 *
 * @param {object} props
 * @param {string} [props.className] - Additional CSS classes for custom sizing/styling.
 * @param {'rectangle'|'circle'|'text'} [props.variant='rectangle'] - Shape variant.
 * @returns {JSX.Element}
 */
export default function Skeleton({ className = '', variant = 'rectangle' }) {
  const baseClasses = 'bg-surface shimmer';

  const variantClasses = {
    rectangle: 'rounded-[var(--radius-glass)] w-full h-20',
    circle: 'rounded-full w-12 h-12',
    text: 'rounded-md w-full h-4',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-hidden="true"
    />
  );
}

/**
 * Full card skeleton with header, body lines, and action area.
 *
 * @param {object} props
 * @param {string} [props.className] - Additional wrapper classes.
 * @returns {JSX.Element}
 */
export function SkeletonCard({ className = '' }) {
  return (
    <div
      className={`glass-card p-6 space-y-4 ${className}`}
      aria-hidden="true"
    >
      {/* Header row: icon + title */}
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" className="w-10 h-10 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-3/5 h-4" />
          <Skeleton variant="text" className="w-2/5 h-3" />
        </div>
      </div>
      {/* Body lines */}
      <div className="space-y-3 pt-2">
        <Skeleton variant="text" className="w-full h-3" />
        <Skeleton variant="text" className="w-4/5 h-3" />
        <Skeleton variant="text" className="w-3/5 h-3" />
      </div>
      {/* Action bar */}
      <div className="flex justify-end gap-2 pt-2">
        <Skeleton variant="rectangle" className="w-20 h-8 rounded-[var(--radius-button)]" />
        <Skeleton variant="rectangle" className="w-20 h-8 rounded-[var(--radius-button)]" />
      </div>
    </div>
  );
}

/**
 * Table skeleton with configurable rows and columns.
 *
 * @param {object} props
 * @param {number} [props.rows=5] - Number of body rows.
 * @param {number} [props.cols=5] - Number of columns.
 * @param {string} [props.className] - Additional wrapper classes.
 * @returns {JSX.Element}
 */
export function SkeletonTable({ rows = 5, cols = 5, className = '' }) {
  return (
    <div
      className={`glass-card overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead>
            <tr className="border-b border-neon-blue/20">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <Skeleton
                    variant="text"
                    className={`h-4 ${i === 0 ? 'w-24' : 'w-20'}`}
                  />
                </th>
              ))}
            </tr>
          </thead>
          {/* Body */}
          <tbody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr
                key={rowIdx}
                className={
                  rowIdx % 2 === 0 ? 'bg-transparent' : 'bg-surface'
                }
              >
                {Array.from({ length: cols }).map((_, colIdx) => (
                  <td key={colIdx} className="px-4 py-3">
                    <Skeleton
                      variant="text"
                      className={`h-3 ${
                        colIdx === 0
                          ? 'w-28'
                          : colIdx === cols - 1
                          ? 'w-16'
                          : 'w-20'
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination skeleton */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <Skeleton variant="text" className="w-32 h-3" />
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangle"
              className="w-8 h-8 rounded-lg"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Chart area skeleton showing a placeholder for chart visualizations.
 *
 * @param {object} props
 * @param {string} [props.className] - Additional wrapper classes.
 * @returns {JSX.Element}
 */
export function SkeletonChart({ className = '' }) {
  return (
    <div
      className={`glass-card p-6 ${className}`}
      aria-hidden="true"
    >
      {/* Chart title */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton variant="text" className="w-40 h-5" />
        <div className="flex gap-2">
          <Skeleton variant="rectangle" className="w-16 h-7 rounded-lg" />
          <Skeleton variant="rectangle" className="w-16 h-7 rounded-lg" />
        </div>
      </div>
      {/* Chart area: simulated bars */}
      <div className="flex items-end gap-2 h-48">
        {[40, 65, 50, 80, 35, 70, 55, 90, 45, 60, 75, 50].map(
          (height, i) => (
            <div
              key={i}
              className="flex-1 bg-surface shimmer rounded-t-md"
              style={{ height: `${height}%` }}
            />
          )
        )}
      </div>
      {/* X-axis labels */}
      <div className="flex gap-2 mt-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="text" className="flex-1 h-3" />
        ))}
      </div>
    </div>
  );
}

/**
 * KPI card skeleton matching the dashboard stat card layout.
 *
 * @param {object} props
 * @param {string} [props.className] - Additional wrapper classes.
 * @returns {JSX.Element}
 */
export function SkeletonKPI({ className = '' }) {
  return (
    <div
      className={`glass-card p-5 ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          {/* Label */}
          <Skeleton variant="text" className="w-24 h-3" />
          {/* Big number */}
          <Skeleton variant="text" className="w-20 h-8" />
          {/* Trend */}
          <Skeleton variant="text" className="w-28 h-3" />
        </div>
        {/* Icon placeholder */}
        <Skeleton variant="rectangle" className="w-12 h-12 rounded-xl shrink-0" />
      </div>
    </div>
  );
}
