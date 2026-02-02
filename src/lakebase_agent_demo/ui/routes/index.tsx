import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense } from "react";
import { useGetProductsSuspense, type ProductListOut } from "@/lib/api";
import { ProductCard, ProductCardSkeleton } from "@/components/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: () => <Index />,
});

function FeaturedProducts() {
  const { data } = useGetProductsSuspense();
  const products: ProductListOut[] = data.data;

  // Show first 6 products as featured
  const featuredProducts = products.slice(0, 6);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuredProducts.map((product) => (
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
  );
}

function FeaturedProductsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

function Index() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-900/40 via-stone-900 to-orange-900/40 p-8 md:p-12 border border-amber-700/20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 bg-clip-text text-transparent mb-4">
            Welcome to Data & Bricks
          </h1>
          <p className="text-lg text-stone-300 mb-6">
            Your one-stop shop for premium data products and artisan bricks.
            From organic CSVs to fire-resistant blocks, we've got you covered.
          </p>
          <Link to="/products">
            <Button
              size="lg"
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold shadow-xl shadow-amber-900/40"
            >
              Browse All Products
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Products Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-amber-100">
            Featured Products
          </h2>
          <Link to="/products">
            <Button
              variant="ghost"
              className="text-amber-400 hover:text-amber-300 hover:bg-amber-900/30"
            >
              View All →
            </Button>
          </Link>
        </div>
        <Suspense fallback={<FeaturedProductsSkeleton />}>
          <FeaturedProducts />
        </Suspense>
      </section>

      {/* Categories Preview */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/products"
          search={{ category: 1 }}
          className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-blue-900/30 to-stone-900 border border-blue-700/20 hover:border-blue-500/40 transition-colors"
        >
          <div className="absolute top-4 right-4 text-5xl opacity-30 group-hover:opacity-50 transition-opacity">
            💾
          </div>
          <h3 className="text-xl font-bold text-blue-200 mb-2">Data Products</h3>
          <p className="text-stone-400 text-sm">
            Premium JSON, Parquet, CSV, and more. Artisanally crafted datasets
            for the modern data connoisseur.
          </p>
        </Link>
        <Link
          to="/products"
          search={{ category: 3 }}
          className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-orange-900/30 to-stone-900 border border-orange-700/20 hover:border-orange-500/40 transition-colors"
        >
          <div className="absolute top-4 right-4 text-5xl opacity-30 group-hover:opacity-50 transition-opacity">
            🧱
          </div>
          <h3 className="text-xl font-bold text-orange-200 mb-2">
            Brick Products
          </h3>
          <p className="text-stone-400 text-sm">
            From artisan red bricks to industrial cinder blocks. Build
            something amazing.
          </p>
        </Link>
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-stone-800 text-center text-stone-500 text-sm">
        <p>
          © 2026 Data & Bricks Store. Powered by{" "}
          <a
            href="https://www.databricks.com/product/lakebase"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-500 hover:text-amber-400"
          >
            Databricks Lakebase
          </a>
        </p>
      </footer>
    </div>
  );
}
