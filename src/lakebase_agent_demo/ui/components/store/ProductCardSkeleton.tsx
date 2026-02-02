import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden border-amber-200/10 bg-gradient-to-b from-stone-900 to-stone-950">
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-800">
        <Skeleton className="h-full w-full bg-stone-700" />
      </div>

      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4 bg-stone-700" />
        <div className="space-y-1 pt-1">
          <Skeleton className="h-4 w-full bg-stone-700" />
          <Skeleton className="h-4 w-2/3 bg-stone-700" />
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <Skeleton className="h-8 w-24 bg-stone-700" />
      </CardContent>

      <CardFooter>
        <Skeleton className="h-10 w-full bg-stone-700" />
      </CardFooter>
    </Card>
  );
}
