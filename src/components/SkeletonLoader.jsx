import React from "react";

export const SkeletonPage = () => (
  <div className="animate-pulse space-y-8 p-4 md:p-8 max-w-4xl mx-auto">
    <div className="h-48 bg-stone-200 rounded-3xl w-full"></div>
    <div className="space-y-4">
      <div className="h-8 bg-stone-200 rounded-lg w-3/4"></div>
      <div className="h-4 bg-stone-200 rounded-lg w-1/2"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="h-32 bg-stone-200 rounded-2xl"></div>
      <div className="h-32 bg-stone-200 rounded-2xl"></div>
    </div>
  </div>
);

export const SkeletonMenu = () => (
  <div className="animate-pulse space-y-6 px-4 py-12 max-w-2xl mx-auto">
    <div className="h-12 bg-stone-200 rounded-xl w-48 mx-auto mb-8"></div>
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-stone-100">
        <div className="w-24 h-24 bg-stone-200 rounded-xl flex-shrink-0"></div>
        <div className="flex-grow space-y-3">
          <div className="h-4 bg-stone-200 rounded w-1/2"></div>
          <div className="h-3 bg-stone-200 rounded w-3/4"></div>
          <div className="h-8 bg-stone-200 rounded-full w-24"></div>
        </div>
      </div>
    ))}
  </div>
);
