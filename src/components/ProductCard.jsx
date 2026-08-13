/*
  TIP: Each ProductCard is a self-contained unit — image, name,
  price, and an "Add to Bag" button. The image and the name/price
  both link to the product detail page. The bag icon adds the
  product directly with default options (first color, shade, size).

  We use <Link> from react-router-dom instead of <a> tags so
  navigation happens without a full page reload.
*/
import { Heart, ShoppingBag } from 'lucide-react';
/* TIP: Link is no longer used since product detail pages are gated —
     we use <button> + toast instead. Remove this comment and restore
     the import when you unlock /product/:id. */
import ProductPlaceholder from './ProductPlaceholder';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';

export default function ProductCard({ product }) {
  const { addToBag } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();

  /* TIP: This shortcut adds the product with default selections
     (first color, first shade, first size) — useful for the grid
     where you don't want to force someone through the detail page
     just to add something to their bag. */
  const handleAddToBag = () =>
    addToBag(
      product,
      product.colors?.[0] || 'Default',
      product.shades?.[0] || 'Default',
      product.sizes?.[0] || 'S'
    );

  /* TIP: Product detail pages are GATED behind Coming Soon. Clicking
       the image or name shows a toast instead of navigating. When you
       unlock /product/:id in App.jsx, replace these buttons with <Link>
       components pointing to `/product/${product.id}`. */

  const handleViewProduct = (e) => {
    e.preventDefault();
    window.dispatchEvent(
      new CustomEvent('lara-toast', { detail: 'Product details coming soon!' })
    );
  };

  return (
    <div className="group">
      {/* Image — GATED: shows toast instead of navigating to product detail */}
      <button
        onClick={handleViewProduct}
        className="relative block aspect-[3/4] overflow-hidden bg-[#efece6] text-left"
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <ProductPlaceholder className="h-full w-full" />
        )}

        {/* Wishlist heart — positioned top-left */}
        <button
          aria-label={`${isInWishlist(product.id) ? 'Remove' : 'Add'} ${product.name} ${isInWishlist(product.id) ? 'from' : 'to'} wishlist`}
          aria-pressed={isInWishlist(product.id)}
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className="absolute left-3 top-3 hover:text-[var(--maroon)]"
        >
          <Heart
            size={16}
            strokeWidth={1.5}
            fill={isInWishlist(product.id) ? 'currentColor' : 'none'}
          />
        </button>
      </button>

      {/* Name + price on the left, Add to Bag on the right */}
      <div className="mt-3 flex items-end justify-between">
        <button
          onClick={handleViewProduct}
          className="text-sm text-left"
        >
          <div className="uppercase tracking-wide">{product.name}</div>
          <div className="text-[var(--muted)]">
            {formatPrice(product.price)}
          </div>
        </button>

        <button
          aria-label={`Add ${product.name} to bag`}
          onClick={handleAddToBag}
          className="shrink-0 rounded-full border border-[var(--line)] p-2 transition-colors hover:border-[var(--maroon)] hover:bg-[var(--maroon)] hover:text-white"
        >
          <ShoppingBag size={15} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}