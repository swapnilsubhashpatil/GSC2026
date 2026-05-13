/** @format */

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
  );
}

export function ShipmentRowSkeleton() {
  return (
    <tr className="border-b border-gray-100">
      <td className="py-4 pr-4"><Skeleton className="h-4 w-20" /></td>
      <td className="py-4 pr-4"><Skeleton className="h-6 w-16" /></td>
      <td className="py-4 pr-4"><Skeleton className="h-4 w-32" /></td>
      <td className="py-4 pr-4"><Skeleton className="h-4 w-20" /></td>
      <td className="py-4 pr-4"><Skeleton className="h-4 w-12" /></td>
      <td className="py-4 pr-4"><Skeleton className="h-4 w-16" /></td>
      <td className="py-4"><Skeleton className="h-4 w-16" /></td>
    </tr>
  );
}

export function StatsBarSkeleton() {
  return (
    <div className="grid grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-4 rounded-xl border border-gray-100 bg-white">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DecisionCardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-full" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 p-5 space-y-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
