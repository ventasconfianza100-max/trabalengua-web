import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { Header, Footer } from "./components/Layout";
import { CartDrawer } from "./components/CartDrawer";
import { WhatsAppFloat } from "./components/WhatsAppFloat";
import { WelcomeSplash } from "./components/WelcomeSplash";
import { Toaster } from "sonner";
import Home from "./pages/Home";
import SchoolPage from "./pages/SchoolPage";
import ProductPage from "./pages/ProductPage";
import CheckoutPage from "./pages/CheckoutPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import BordadosPage from "./pages/BordadosPage";
import ContactPage from "./pages/ContactPage";

// Hide preview-platform "Made with Emergent" badge (not part of app code)
const hideEmergentBadge = () => {
  const scan = (root) => {
    root.querySelectorAll("a, div, button").forEach((el) => {
      const txt = (el.textContent || "").trim().toLowerCase();
      if (txt === "made with emergent") {
        const pos = window.getComputedStyle(el).position;
        const host = el.closest("[data-testid]");
        if ((pos === "fixed" || pos === "absolute") && !host) {
          el.style.setProperty("display", "none", "important");
          let p = el.parentElement;
          for (let i = 0; i < 3 && p; i++) {
            const pPos = window.getComputedStyle(p).position;
            if (pPos === "fixed" || pPos === "absolute") {
              p.style.setProperty("display", "none", "important");
            }
            p = p.parentElement;
          }
        }
      }
    });
  };
  scan(document);
};

const EmergentBadgeHider = () => {
  useEffect(() => {
    hideEmergentBadge();
    const interval = setInterval(hideEmergentBadge, 800);
    const obs = new MutationObserver(() => hideEmergentBadge());
    obs.observe(document.body, { childList: true, subtree: true });
    return () => {
      clearInterval(interval);
      obs.disconnect();
    };
  }, []);
  return null;
};

const Shell = () => {
  const location = useLocation();
  const hideChrome = location.pathname.startsWith("/admin");
  return (
    <>
      <EmergentBadgeHider />
      {!hideChrome && <Header />}
      <main className="min-h-[60vh]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/colegio/:slug" element={<SchoolPage />} />
          <Route path="/producto/:id" element={<ProductPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/bordados" element={<BordadosPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
      {!hideChrome && <Footer />}
      <CartDrawer />
      {!hideChrome && <WhatsAppFloat />}
      <Toaster position="top-right" richColors />
    </>
  );
};

function App() {
  return (
    <div className="App">
      <WelcomeSplash />
      <CartProvider>
        <BrowserRouter>
          <Shell />
        </BrowserRouter>
      </CartProvider>
    </div>
  );
}

export default App;
