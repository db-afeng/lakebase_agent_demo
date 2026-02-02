import { Link } from "@tanstack/react-router";

export function StoreHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-200/20 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 backdrop-blur supports-[backdrop-filter]:bg-amber-950/95">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 opacity-25 blur group-hover:opacity-50 transition-opacity" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-600 to-orange-700 shadow-lg">
              <span className="text-xl">🧱</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tight bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 bg-clip-text text-transparent">
              Data & Bricks
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-amber-400/70 font-medium">
              Premium Store
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-amber-100/80 hover:text-amber-100 transition-colors [&.active]:text-amber-300"
          >
            Home
          </Link>
          <Link
            to="/products"
            className="text-sm font-medium text-amber-100/80 hover:text-amber-100 transition-colors [&.active]:text-amber-300"
          >
            Products
          </Link>
        </nav>
      </div>
    </header>
  );
}
