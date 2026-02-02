import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense } from "react";
import { useGetProductSuspense, type ProductOut } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/products/$id")({
  component: () => <ProductDetailPage />,
});

function ProductDetail({ productId }: { productId: number }) {
  const { data: productData } = useGetProductSuspense({
    params: { product_id: productId },
  });
  const product: ProductOut = productData.data;

  const isLowStock =
    product.inventory !== null &&
    product.inventory !== undefined &&
    product.inventory.quantity < 100;
  const isOutOfStock =
    product.inventory !== null &&
    product.inventory !== undefined &&
    product.inventory.quantity === 0;
  const quantity = product.inventory?.quantity ?? 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-stone-800 border border-amber-700/20">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-900/30 to-stone-900">
            <span className="text-9xl opacity-50">📦</span>
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm">
            <span className="text-2xl font-bold text-red-400">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="space-y-6">
        {/* Category Badge */}
        {product.category && (
          <Link to="/products" search={{ category: product.category.id }}>
            <Badge
              variant="secondary"
              className="bg-amber-950/90 text-amber-200 border-amber-700/50 hover:bg-amber-900/90 cursor-pointer"
            >
              {product.category.name}
            </Badge>
          </Link>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-amber-100">
          {product.name}
        </h1>

        {/* Price */}
        <div className="flex items-center gap-4">
          <span className="text-4xl font-black text-amber-400">
            ${parseFloat(product.price).toFixed(2)}
          </span>
          {!isOutOfStock && (
            <span
              className={`text-sm font-medium ${isLowStock ? "text-orange-400" : "text-stone-500"}`}
            >
              {isLowStock ? `Only ${quantity} left!` : `${quantity} in stock`}
            </span>
          )}
        </div>

        <Separator className="bg-stone-700" />

        {/* Description */}
        <div>
          <h2 className="text-lg font-semibold text-amber-200 mb-2">
            Description
          </h2>
          <p className="text-stone-300 leading-relaxed">
            {product.description || "No description available for this product."}
          </p>
        </div>

        <Separator className="bg-stone-700" />

        {/* Actions */}
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold shadow-xl shadow-amber-900/40"
            disabled={isOutOfStock}
          >
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>
          <Link to="/products" className="block">
            <Button
              variant="outline"
              size="lg"
              className="w-full border-amber-700/50 text-amber-200 hover:bg-amber-900/30"
            >
              ← Back to Products
            </Button>
          </Link>
        </div>

        {/* Metadata */}
        <div className="pt-4 text-xs text-stone-500 space-y-1">
          <p>Product ID: {product.id}</p>
          <p>
            Added:{" "}
            {new Date(product.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Image Skeleton */}
      <Skeleton className="aspect-square rounded-2xl bg-stone-700" />

      {/* Details Skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-6 w-24 bg-stone-700" />
        <Skeleton className="h-10 w-3/4 bg-stone-700" />
        <Skeleton className="h-10 w-32 bg-stone-700" />
        <Skeleton className="h-px w-full bg-stone-700" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32 bg-stone-700" />
          <Skeleton className="h-4 w-full bg-stone-700" />
          <Skeleton className="h-4 w-full bg-stone-700" />
          <Skeleton className="h-4 w-2/3 bg-stone-700" />
        </div>
        <Skeleton className="h-px w-full bg-stone-700" />
        <Skeleton className="h-12 w-full bg-stone-700" />
        <Skeleton className="h-12 w-full bg-stone-700" />
      </div>
    </div>
  );
}

function ProductDetailPage() {
  const { id } = Route.useParams();
  const productId = parseInt(id, 10);

  if (isNaN(productId)) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 text-lg">Invalid product ID</p>
        <Link to="/products" className="mt-4 inline-block">
          <Button variant="outline">← Back to Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetail productId={productId} />
    </Suspense>
  );
}
