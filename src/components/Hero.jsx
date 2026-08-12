import { useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useCurrency } from "../context/CurrencyContext";
import ShareButton from "./ShareButton";
import MoreOptionsMenu from "./MoreOptionsMenu";

export default function Hero({ product }) {
  const [centerIndex, setCenterIndex] = useState(2);
  const angles = product.angles;
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();

  return (
    <section className="pt-10 md:pt-16 pb-10 text-center px-5">
      <div className="relative max-w-5xl mx-auto">
        <h1 className="relative z-0 font-display text-[4.5rem] sm:text-[5.5rem] md:text-[7rem] leading-none text-[#d8d5cd] select-none">
          {product.name.toUpperCase()}
        </h1>

        <div className="flex items-end justify-center gap-3 md:gap-6 -mt-10 sm:-mt-14 md:-mt-20">
          {angles.map((angle, i) => {
            const isActive = i === centerIndex;
            const distance = Math.abs(i - centerIndex);
            const responsiveClass = distance >= 2 ? "hidden md:block" : "";

            return (
              <motion.div
                key={i}
                layout
                role="button"
                tabIndex={0}
                onClick={() => setCenterIndex(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setCenterIndex(i);
                  }
                }}
                aria-label={`View angle ${i + 1} of ${product.name}`}
                aria-current={isActive}
                className={`relative cursor-pointer focus-visible:outline-none ${responsiveClass}`}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 0.8,
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="ground-shadow"
                    className="absolute left-1/2 -translate-x-1/2 bottom-1 w-3/4 h-3 bg-black/20 blur-md rounded-full -z-10"
                  />
                )}

                <img
                  src={angle.src}
                  alt={
                    isActive
                      ? `${product.name}, front view`
                      : `${product.name}, alternate angle`
                  }
                  className={`relative z-10 h-auto pointer-events-none transition-all duration-500 ease-[0.22,1,0.36,1] ${
                    isActive
                      ? "w-40 sm:w-48 md:w-56 opacity-100"
                      : "w-32 md:w-40 opacity-40"
                  } ${angle.flip ? "mirror" : ""}`}
                  style={angle.flip ? { transform: "scaleX(-1)" } : {}}
                />

                {isActive && (
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
                          isInWishlist(product.id) ? "currentColor" : "none"
                        }
                      />
                    </button>
                    <ShareButton
                      product={product}
                      className="hover:text-[var(--maroon)]"
                    />
                    <MoreOptionsMenu product={product} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="relative z-10 flex justify-center gap-1.5 mt-4">
          {angles.map((_, i) => (
            <button
              key={i}
              onClick={() => setCenterIndex(i)}
              aria-label={`Go to angle ${i + 1}`}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === centerIndex ? "bg-[var(--ink)]" : "bg-[var(--line)]"
              }`}
            />
          ))}
        </div>

        <div className="relative z-10 w-40 sm:w-48 md:w-56 mx-auto flex items-center justify-between mt-3 text-sm">
          <span className="uppercase tracking-wide">{product.name}</span>
          <span className="font-semibold">{formatPrice(product.price)}</span>
        </div>
      </div>
    </section>
  );
}
