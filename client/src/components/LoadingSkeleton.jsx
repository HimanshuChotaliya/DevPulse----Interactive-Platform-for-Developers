export default function LoadingSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 animate-pulse"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-32" />
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
            </div>
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
          {/* Content */}
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-full" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-5/6" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-4/6" />
          </div>
          {/* Footer */}
          <div className="flex gap-4">
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
