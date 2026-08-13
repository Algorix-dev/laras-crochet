/*
  TIP: The Navbar is sticky (stays at top on scroll) with a
  frosted-glass effect. It now has:
  - Search icon → opens full-screen search overlay
  - Heart icon → shows wishlist count badge, navigates to wishlist section
  - Bag icon → shows cart count badge, opens bag drawer
  - User icon → shows toast (account area coming soon)
  - Currency selector dropdown with real SVG flags
  - Mobile hamburger menu with all the same controls
*/
import { useState } from "react";
import { Heart, Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import CurrencySelector from "./CurrencySelector";
import SearchOverlay from "./SearchOverlay";

/* TIP: All nav links are visible. Shop, Custom Orders, and Contact
   show "Coming Soon" toast until their pages are ready. To unlock,
   replace the toast dispatch with navigate() in the onClick handler. */
const LINKS = [
  { label: "Shop", to: "/shop", gated: true },
  { label: "Custom Orders", to: "/contact?flow=custom", gated: true },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact", gated: true },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (to) => {
    if (to === "/")
      return location.pathname === "/" && !location.hash && !location.search;
    return location.pathname + location.search === to;
  };

  /* TIP: Bag and Wishlist are GATED behind Coming Soon. Clicking
      shows a toast instead of navigating. When you're ready to
      unlock them, replace the toast dispatch with navigate("/bag")
      and navigate("/wishlist") respectively. */

  /* Bag button — GATED: shows toast instead of navigating */
  const BagButton = () => (
    <button
      aria-label={`Bag, ${cartCount} items`}
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent('lara-toast', { detail: 'Bag is coming soon!' })
        );
      }}
      className="relative hover:text-[var(--maroon)]"
    >
      <ShoppingBag size={18} />
      {cartCount > 0 && (
        <span className="absolute -right-2 -top-2 rounded-full bg-[var(--maroon)] px-1 text-[9px] text-white">
          {cartCount}
        </span>
      )}
    </button>
  );

  /* Wishlist button — GATED: shows toast instead of navigating */
  const WishlistButton = () => (
    <button
      aria-label={`Wishlist, ${wishlistCount} items`}
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent('lara-toast', { detail: 'Wishlist is coming soon!' })
        );
      }}
      className="relative hover:text-[var(--maroon)]"
    >
      <Heart size={18} />
      {wishlistCount > 0 && (
        <span className="absolute -right-2 -top-2 rounded-full bg-[var(--maroon)] px-1 text-[9px] text-white">
          {wishlistCount}
        </span>
      )}
    </button>
  );

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--cream)]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          {/* Brand logo */}
          <Link to="/" className="font-display text-xl italic">
            Lara's Crochet
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden gap-8 text-sm uppercase md:flex">
            {LINKS.map((l) => (
              l.gated ? (
                <button
                  key={l.label}
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent('lara-toast', { detail: l.label + ' is coming soon!' })
                    );
                  }}
                  className={
                    isActive(l.to)
                      ? "font-bold text-[var(--ink)]"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }
                >
                  {l.label}
                </button>
              ) : (
                <Link
                  key={l.label}
                  to={l.to}
                  className={
                    isActive(l.to)
                      ? "font-bold text-[var(--ink)]"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }
                >
                  {l.label}
                </Link>
              )
            ))}
          </nav>

          {/* Desktop utility icons */}
          <div className="hidden items-center gap-5 md:flex">
            <button aria-label="Search" onClick={() => setSearchOpen(true)}>
              <Search size={18} />
            </button>
            <WishlistButton />
            <BagButton />
            <button
              aria-label="Account"
              onClick={() => navigate(isSignedIn ? "/account" : "/signin")}
            >
              <User size={18} />
            </button>
            <CurrencySelector />
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            aria-label="Open menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <nav className="flex flex-col gap-4 px-5 pb-6 text-sm uppercase md:hidden">
            {LINKS.map((l) => (
              l.gated ? (
                <button
                  key={l.label}
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent('lara-toast', { detail: l.label + ' is coming soon!' })
                    );
                    setMenuOpen(false);
                  }}
                  className={
                    isActive(l.to)
                      ? "font-bold text-[var(--ink)]"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }
                >
                  {l.label}
                </button>
              ) : (
                <Link
                  key={l.label}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className={
                    isActive(l.to)
                      ? "font-bold text-[var(--ink)]"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }
                >
                  {l.label}
                </Link>
              )
            ))}
            <div className="flex gap-5">
              <button
                aria-label="Search"
                onClick={() => {
                  setSearchOpen(true);
                  setMenuOpen(false);
                }}
              >
                <Search size={18} />
              </button>
              <WishlistButton />
              <BagButton />
              <button
                aria-label="Account"
                onClick={() => {
                  navigate(isSignedIn ? "/account" : "/signin");
                  setMenuOpen(false);
                }}
              >
                <User size={18} />
              </button>
            </div>
            <div className="pt-2">
              <CurrencySelector />
            </div>
          </nav>
        )}
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
