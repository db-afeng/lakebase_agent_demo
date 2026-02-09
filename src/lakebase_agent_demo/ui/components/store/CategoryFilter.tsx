import { Button } from "@/components/ui/button";

interface Category {
  id: number;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

export function CategoryFilter({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedCategoryId === null ? "default" : "outline"}
        size="sm"
        onClick={() => onSelectCategory(null)}
        className={
          selectedCategoryId === null
            ? "bg-amber-600 hover:bg-amber-500 text-white"
            : "border-amber-700/50 bg-amber-950/60 text-amber-200 hover:bg-amber-900/50 hover:text-amber-100"
        }
      >
        All Products
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategoryId === category.id ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectCategory(category.id)}
          className={
            selectedCategoryId === category.id
              ? "bg-amber-600 hover:bg-amber-500 text-white"
              : "border-amber-700/50 bg-amber-950/60 text-amber-200 hover:bg-amber-900/50 hover:text-amber-100"
          }
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}
