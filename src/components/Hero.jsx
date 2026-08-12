import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import ShareButton from './ShareButton';
import MoreOptionsMenu from './MoreOptionsMenu';

/*
  TIP: "Rotate to center" carousel — when you click an angle, it
  smoothly animates to the center position, and the previous center
  item animates to the clicked item's old position. This creates a
  satisfying "swap" effect that feels like physically rotating a
  product display.

  Implementation: we keep a `centerIndex` state. The displayed array
  is reordered so the center item is always at index 2 (the middle
  slot). Framer-motion's `layout` prop handles the smooth position
  swapping automatically — we just need to give each item a stable
  `key` and the `layout` prop, and it figures out the animation.
*/
export default function Hero({ product }) {
  const [centerIndex, setCenterIndex] = useState(2); // start with front view in center
  const angles = product.angles;
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();

  /* TIP: Build the display order so the center item is always at
     position 2 (middle). The items wrap around — if centerIndex is
     0, the display order is [3, 4, 0, 1, 2] so that 0 is in the
     middle and the others flow naturally to its sides. */
  const getDisplayOrder = () => {
    const order = [];
    for (let i = 0; i < angles.length; i++) {
      // Calculate the offset from center, wrapping around
      const offset = (i - centerIndex + angles.length) % angles.length;
      // Place at position based on offset (center=2, then spread left/right)
      const displayPos = (offset + 2) % angles.length;
      order[displayPos] = i;
    }
    return order;
  };

  const displayOrder = getDisplayOrder();

  /* TIP: Responsive — on mobile we only show 3 items (center ±1),
     on desktop we show all 5. The displayOrder handles the wrapping. */

  return (
    <section className="pt-10 md:pt-16 pb-10 text-center px-5">
      <div className="relative max-w-5xl mx-auto">
        <h1 className="relative z-0 font-display text-[4.5rem] sm:text-[5.5rem] md:text-[7rem] leading-none text-[#d8d5cd] select-none">
          {product.name.toUpperCase()}
        </h1>

        <div className="flex items-end justify-center gap-3 md:gap-6 -mt-10 sm:-mt-14 md:-mt-20">
          {displayOrder.map((originalIndex, displayPos) => {
            const angle = angles[originalIndex];
            const isCenter = displayPos === 2;
            const distance = Math.abs(displayPos - 2);

            /* TIP: On mobile, hide items that are 2+ positions from
               center (the far left/right items). On desktop, show all. */
            if (distance >= 2) {
              return (
                <div
                  key={`angle-${originalIndex}`}
                  className="hidden md:block"
                />
              );
            }

            return (
              <motion.div
                key={`angle-${originalIndex}`}
                layout
                role="button"
                tabIndex={0}
                onClick={() => setCenterIndex(originalIndex)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setCenterIndex(originalIndex);
                  }
                }}
                aria-label={`View angle ${originalIndex + 1} of ${product.name}`}
                aria-current={isCenter}
                className="relative cursor-pointer focus-visible:outline-none"
                initial={false}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                  mass: 0.8,
                }}
              >
                {/* Ground shadow under the center item */}
                {isCenter && (
                  <motion.div
                    layoutId="ground-shadow"
                    className="absolute left-1/2 -translate-x-1/2 bottom-1 w-3/4 h-3 bg-black/20 blur-md rounded-full -z-10"
                  />
                )}

                <motion.img
                  src={angle.src}
                  alt={isCenter ? `${product.name}, front view` : `${product.name}, alternate angle`}
                  className={`relative z-10 h-auto pointer-events-none ${
                    isCenter ? 'w-40 sm:w-48 md:w-56' : 'w-32 md:w-40'
                  }`}
                  style={{
                    scaleX: angle.flip ? -1 : 1,
                  }}
                  animate={{
                    opacity: isCenter ? 1 : 0.4,
                    scale: isCenter ? 1 : 0.95,
                  }}
                  transition={{
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />

                {/* Action buttons — only show on center item */}
                {isCenter && (
                  <div className="absolute -right-6 sm:-right-7 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                    <button
                      aria-label="Toggle wishlist"
                      aria-pressed={isInWishlist(product.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      className="hover:text-[var(--maroon)]"
                    >
                      <Heart
                        size={17}
                        strokeWidth={1.5}
                        fill={
                          isInWishlist(product.id) ? 'currentColor' : 'none'
                        }
                      />
                    </button>
                    <ShareButton product={product} className="hover:text-[var(--maroon)]" />
                    <MoreOptionsMenu product={product} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Dot indicators */}
        <div className="relative z-10 flex justify-center gap-1.5 mt-4">
          {angles.map((_, i) => (
            <button
              key={i}
              onClick={() => setCenterIndex(i)}
              aria-label={`Go to angle ${i + 1}`}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === centerIndex ? 'bg-[var(--ink)]' : 'bg-[var(--line)]'
              }`}
            />
          ))}
        </div>

        {/* Product name + price */}
        <div className="relative z-10 w-40 sm:w-48 md:w-56 mx-auto flex items-center justify-between mt-3 text-sm">
          <span className="uppercase tracking-wide">{product.name}</span>
          <span className="font-semibold">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </section>
  );
}
