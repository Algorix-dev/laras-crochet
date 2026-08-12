/*
  TIP: This is the main routing file. We use react-router-dom's
  <Routes> and <Route> to define which component renders at each URL.

  - "/"         → HomePage (Hero + CategoryIntro + ProductGrid + CustomOrderBanner + Footer)
  - "/product/:id" → ProductDetail (the detail page for any product)
  - "*"         → HomePage (catch-all for unknown routes, so you never see a blank page)

  The Navbar renders outside <Routes> so it appears on every page.
*/
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CategoryIntro from './components/CategoryIntro';
import ProductGrid from './components/ProductGrid';
import CustomOrderBanner from './components/CustomOrderBanner';
import Footer from './components/Footer';
import ProductDetail from './pages/ProductDetail';
import ShopPage from './pages/ShopPage';
import AboutPage from './pages/AboutPage';
import CheckoutPage from './pages/CheckoutPage';
import ContactPage from './pages/ContactPage';
import SignInPage from './pages/SignInPage';
import AccountPage from './pages/AccountPage';
import WishlistPage from './pages/WishlistPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import AddressesPage from './pages/AddressesPage';
import MyBagPage from './pages/MyBagPage';
import ComingSoon from './pages/ComingSoon';
import { AuthProvider } from './context/AuthContext';
import { useEffect, useState } from 'react';
import { products, heroProduct } from './data/products';

/*
  TIP: Toast component — listens for a custom 'lara-toast' event
  dispatched anywhere in the app (wishlist toggle, share, add to
  bag, etc.). When it fires, the message appears at the bottom
  center for 2.5 seconds, then disappears. This is a pub/sub
  pattern so any component can show a toast without importing
  a toast library.
*/
function Toast() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleToast = (e) => {
      setMessage(e.detail);
      window.setTimeout(() => setMessage(''), 2500);
    };
    window.addEventListener('lara-toast', handleToast);
    return () => window.removeEventListener('lara-toast', handleToast);
  }, []);

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed bottom-5 left-1/2 z-[100] -translate-x-1/2 bg-[var(--ink)] px-4 py-3 text-sm text-white shadow-lg"
    >
      {message}
    </div>
  );
}

/* Home page is its own component so the route stays clean */
function HomePage() {
  return (
    <>
      <Hero product={heroProduct} />
      <CategoryIntro />
      <ProductGrid products={products} />
      {/* TIP: id="custom-orders" lets the nav link /#custom-orders
          scroll directly to this section */}
      <div id="custom-orders">
        <CustomOrderBanner />
      </div>
      {/* Contact section — the nav link /#contact scrolls here */}
      <section id="contact" className="px-5 py-16 text-center">
        <h2 className="font-display text-4xl mb-3">Get in Touch</h2>
        <p className="text-sm text-[var(--muted)] max-w-md mx-auto mb-6">
          Have an enquiry or want to request a custom made-to-order crochet piece? Lara is here to help.
        </p>
        <Link
          to="/contact"
          className="inline-block bg-[var(--ink)] text-white text-xs uppercase tracking-widest px-8 py-3.5 hover:bg-[var(--maroon)] transition-colors font-bold"
        >
          Open Contact Form
        </Link>
      </section>
      <Footer />
    </>
  );
}

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Navbar />
      <Toast />
      <Routes>
        {/* ===== ROUTES VISIBLE TO CLIENT ===== */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/account/addresses" element={<AddressesPage />} />

        {/* ===== ROUTES HIDDEN (Coming Soon until you unlock them) ===== */}
        {/* TIP: To unlock a page, replace <ComingSoon /> with the real
            component. For example, to unlock the shop:
            <Route path="/shop" element={<ShopPage />} /> */}
        <Route path="/shop" element={<ComingSoon />} />
        <Route path="/product/:id" element={<ComingSoon />} />
        <Route path="/checkout" element={<ComingSoon />} />
        <Route path="/account/orders" element={<ComingSoon />} />
        <Route path="/wishlist" element={<ComingSoon />} />
        <Route path="/bag" element={<ComingSoon />} />

        {/* Catch-all: unknown routes go to home so the user never sees a blank page */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </AuthProvider>
  );
}