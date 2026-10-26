export function MonthGridSkeleton() {
  return (
    <div className="px-2 pb-4">
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] animate-pulse rounded-lg p-1 bg-tg-secondary" />
        ))}
      </div>
    </div>
  );
}