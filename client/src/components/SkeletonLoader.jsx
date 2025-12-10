const SkeletonLoader = ({ type = 'post' }) => {
  if (type === 'post') {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-4 animate-pulse">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          <div className="flex-1">
            <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-3 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
        <div className="h-5 w-3/4 bg-gray-300 dark:bg-gray-700 rounded mb-3"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="flex gap-2 mt-4">
          <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          <div className="h-6 w-20 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (type === 'match') {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 animate-pulse">
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-2xl bg-gray-300 dark:bg-gray-700 mb-6"></div>
          <div className="h-6 w-40 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
          <div className="w-32 h-2 bg-gray-300 dark:bg-gray-700 rounded-full mb-6"></div>
          <div className="w-full mb-6">
            <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded mb-3"></div>
            <div className="flex flex-wrap gap-2 justify-center">
              <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              <div className="h-6 w-20 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              <div className="h-6 w-24 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-700"></div>
            <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'profile') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6">
              <div className="w-32 h-32 rounded-2xl bg-gray-300 dark:bg-gray-700 mx-auto mb-6"></div>
              <div className="h-6 w-40 bg-gray-300 dark:bg-gray-700 rounded mx-auto mb-4"></div>
              <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded mx-auto mb-2"></div>
              <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded mx-auto mb-6"></div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="h-16 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
                <div className="h-16 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
              </div>
              <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="lg:col-span-3 space-y-6">
            <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-2xl mb-6"></div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6">
              <div className="h-5 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-5 w-40 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
              <div className="flex flex-wrap gap-2">
                <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                <div className="h-6 w-20 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                <div className="h-6 w-24 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SkeletonLoader;