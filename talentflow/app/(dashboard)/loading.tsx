import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-pulse">
      {/* 1. PAGE HEADER SKELETON */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 bg-gray-100" />
          <Skeleton className="h-4 w-48 bg-gray-100" />
        </div>
        <Skeleton className="h-4 w-32 bg-gray-100" />
      </div>

      {/* 2. STATS ROW SKELETON */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white rounded-xl border-gray-200 shadow-sm p-6 relative overflow-hidden">
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-8 w-12 bg-gray-100" />
              <Skeleton className="h-4 w-24 bg-gray-100" />
            </div>
            <div className="absolute top-6 right-6 p-2 h-10 w-10 bg-orange-50 rounded-lg" />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3. CHART SKELETON */}
        <Card className="lg:col-span-2 bg-white rounded-xl border-gray-200 shadow-sm">
          <CardHeader>
            <Skeleton className="h-5 w-40 bg-gray-100" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full bg-gray-50 rounded-xl" />
          </CardContent>
        </Card>

        {/* 4. ACTIVITY FEED SKELETON */}
        <Card className="bg-white rounded-xl border-gray-200 shadow-sm flex flex-col">
          <CardHeader>
            <Skeleton className="h-5 w-32 bg-gray-100" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 p-2">
                <Skeleton className="h-2 w-2 rounded-full mt-2 bg-orange-200" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full bg-gray-100" />
                  <Skeleton className="h-3 w-2/3 bg-gray-50" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 5. ACTIVE JOBS SKELETON */}
        <Card className="bg-white rounded-xl border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-50">
            <Skeleton className="h-5 w-48 bg-gray-100" />
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-5 w-32 bg-gray-100" />
                <Skeleton className="h-8 w-20 bg-orange-50" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 6. QUICK ACTIONS SKELETON */}
        <Card className="bg-white rounded-xl border-gray-200 shadow-sm">
          <CardHeader>
             <Skeleton className="h-5 w-32 bg-gray-100" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full bg-gray-100" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-1/3 bg-gray-100" />
              <Skeleton className="h-10 w-1/3 bg-gray-100" />
              <Skeleton className="h-10 w-1/3 bg-gray-100" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
