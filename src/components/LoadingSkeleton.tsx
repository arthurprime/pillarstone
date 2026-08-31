export default function LoadingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-warm-white border border-stone-200">
          <div className="aspect-[4/3] skeleton" />
          <div className="p-5 space-y-3">
            <div className="h-4 w-1/3 skeleton" />
            <div className="h-5 w-2/3 skeleton" />
            <div className="h-4 w-1/2 skeleton" />
            <div className="flex gap-4 pt-2">
              <div className="h-4 w-16 skeleton" />
              <div className="h-4 w-16 skeleton" />
              <div className="h-4 w-16 skeleton" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
