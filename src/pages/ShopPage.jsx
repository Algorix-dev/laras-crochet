/*
  TIP: This page is mostly wiring, not new logic — ProductGrid and
  ProductCard were already built for the homepage, and they just
  take a `products` array as a prop. So "building a shop page" here
  really means: (1) filter the array by category with useState +
  .filter(), (2) render a row of tab buttons that set that state,
  (3) hand the filtered array to the ProductGrid we already have.
  This is a common React pattern: components that render lists don't
  need to know WHY the list is the length it is — the parent (this
  page) decides what data to pass down, the child (ProductGrid) just
  renders whatever it's given.
*/
import { useState } from 'react';
import { products, CATEGORIES } from '../data/products';
import ProductGrid from '../components/ProductGrid';

// TIP: turns 'two-pieces' into 'Two Pieces' for display, so the data
// file can stay in clean lowercase-hyphen slugs (good for URLs/code)
// while the UI still shows something readable.
const formatLabel = (slug) =>
  slug
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');

export default function ShopPage() {
  // TIP: 'all' is the default tab — no category selected means show
  // everything. Kept as a string rather than null/undefined so the
  // comparison in the filter below and the "is this tab active"
  // check are both simple equality checks.
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredProducts =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <section className="max-w-7xl mx-auto px-5 md:px-8 pt-10">
      {/* Page header */}
      <h1 className="font-display text-3xl md:text-4xl italic mb-2">
        Shop Lara's Crochet
      </h1>
      <p className="text-sm text-[var(--muted)] mb-8">
        Shop the latest pieces and made items from Lara's Crochet
      </p>

      {/* Category tabs — horizontally scrollable on mobile so it
          doesn't wrap awkwardly if Lara adds more categories later */}
      <div className="flex gap-6 overflow-x-auto border-b border-[var(--line)] pb-3 mb-10 text-sm uppercase tracking-wide">
        <button
          onClick={() => setActiveCategory('all')}
          className={`shrink-0 pb-1 ${
            activeCategory === 'all'
              ? 'border-b-2 border-[var(--ink)] font-bold text-[var(--ink)]'
              : 'text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 pb-1 ${
              activeCategory === cat
                ? 'border-b-2 border-[var(--ink)] font-bold text-[var(--ink)]'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            {formatLabel(cat)}
          </button>
        ))}
      </div>

      {/* TIP: reusing ProductGrid here instead of copy-pasting the
          grid markup is the whole point of having pulled it into its
          own component earlier — one place to fix bugs/tweak spacing,
          and it stays in sync on both the homepage and this page. */}
      {filteredProducts.length > 0 ? (
        <ProductGrid products={filteredProducts} />
      ) : (
        // TIP: this is a tiny taste of "various states" from her
        // list — an empty state so the page doesn't just go blank
        // if a category has zero products yet.
        <p className="pb-24 text-sm text-[var(--muted)]">
          No products in this category yet — check back soon.
        </p>
      )}
    </section>
  );
}
