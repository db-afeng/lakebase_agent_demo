import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Suspense, useState, useEffect } from "react";
import {
  useGetProductsSuspense,
  useGetCategoriesSuspense,
  type ProductListOut,
  type CategoryOut,
} from "@/lib/api";
import {
  ProductCard,
  ProductCardSkeleton,
  CategoryFilter,
} from "@/components/store";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductsSearch {
  category?: number;
}

export const Route = createFileRoute("/products")({
  validateSearch: (search: Record<string, unknown>): ProductsSearch => {
    return {
      category: search.category ? Number(search.category) : undefined,
    };
  },
  component: () => <ProductsPage />,
});

function CategoriesAndProducts({
  initialCategoryId,
}: {
  initialCategoryId: number | undefined;
}) {
  const navigate = useNavigate({ from: "/products" });
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    initialCategoryId ?? null
  );

  const { data: categoriesData } = useGetCategoriesSuspense();
  const categories: CategoryOut[] = categoriesData.data;

  const { data: productsData } = useGetProductsSuspense({
    params:
      selectedCategoryId !== null
        ? { category_id: selectedCategoryId }
        : undefined,
  });
  const products: ProductListOut[] = productsData.data;

  // Sync URL with selected category
  useEffect(() => {
    if (selectedCategoryId !== null) {
      navigate({
        search: { category: selectedCategoryId },
        replace: true,
      });
    } else {
      navigate({ search: {}, replace: true });
    }
  }, [selectedCategoryId, navigate]);

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CategoryFilter
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
        <p className="text-stone-400 text-sm">
          {products.length} product{products.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              description={product.description ?? null}
              price={product.price}
              imageUrl={product.image_url ?? null}
              categoryName={product.category_name ?? null}
              quantity={product.quantity ?? null}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-stone-400 text-lg">
            No products found in this category.
          </p>
        </div>
      )}
    </div>
  );
}

function ProductsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Category Filter Skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 bg-stone-700" />
        ))}
      </div>

      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function ProductsPage() {
  const { category } = Route.useSearch();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-amber-100 mb-2">All Products</h1>
        <p className="text-stone-400">
          Browse our complete selection of premium data and bricks.
        </p>
      </div>

      <Suspense fallback={<ProductsLoadingSkeleton />}>
        <CategoriesAndProducts initialCategoryId={category} />
      </Suspense>
    </div>
  );
}
