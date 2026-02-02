import { Link } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  id: number;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  categoryName: string | null;
  quantity: number | null;
}

export function ProductCard({
  id,
  name,
  description,
  price,
  imageUrl,
  categoryName,
  quantity,
}: ProductCardProps) {
  const isLowStock = quantity !== null && quantity < 100;
  const isOutOfStock = quantity === 0;

  return (
    <Card className="group overflow-hidden border-amber-200/10 bg-gradient-to-b from-stone-900 to-stone-950 hover:border-amber-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-amber-900/20">
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-800">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-900/30 to-stone-900">
            <span className="text-5xl opacity-50">📦</span>
          </div>
        )}
        {categoryName && (
          <Badge
            variant="secondary"
            className="absolute left-3 top-3 bg-amber-950/90 text-amber-200 border-amber-700/50 backdrop-blur-sm"
          >
            {categoryName}
          </Badge>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm">
            <span className="text-lg font-bold text-red-400">Out of Stock</span>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1 text-lg font-bold text-amber-50">
          {name}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-stone-400 h-10">
          {description || "No description available"}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-black text-amber-400">
            ${parseFloat(price).toFixed(2)}
          </span>
          {quantity !== null && !isOutOfStock && (
            <span
              className={`text-xs font-medium ${isLowStock ? "text-orange-400" : "text-stone-500"}`}
            >
              {isLowStock ? `Only ${quantity} left!` : `${quantity} in stock`}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Link to="/products/$id" params={{ id: String(id) }} className="w-full">
          <Button
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold shadow-lg shadow-amber-900/30"
            disabled={isOutOfStock}
          >
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
