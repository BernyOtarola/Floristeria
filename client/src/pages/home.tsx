import { useState } from "react";
import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import CategoriesSection from "@/components/categories-section";
import AboutSection from "@/components/about-section";
import ContactSection from "@/components/contact-section";
import ProductModal from "@/components/product-modal";
import CartSidebar from "@/components/cart-sidebar";
import CheckoutModal from "@/components/checkout-modal";
import AIAssistant from "@/components/ai-assistant";
import Footer from "@/components/footer";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@shared/schema";

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { cart } = useCart();

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseProductModal = () => {
    setSelectedProduct(null);
  };

  const handleToggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const handleCloseCart = () => {
    setIsCartOpen(false);
  };

  const handleOpenCheckout = () => {
    setIsCheckoutOpen(true);
    setIsCartOpen(false);
  };

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
  };

  const scrollToCatalog = () => {
    const catalogSection = document.getElementById("catalogo");
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        cartItemCount={cart.length} 
        onToggleCart={handleToggleCart}
      />
      
      <HeroSection onScrollToCatalog={scrollToCatalog} />
      
      <CategoriesSection onProductSelect={handleProductSelect} />
      
      <AboutSection />
      
      <ContactSection />
      
      <Footer />

      {/* Modals and Sidebars */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={handleCloseProductModal}
        />
      )}

      <CartSidebar
        isOpen={isCartOpen}
        onClose={handleCloseCart}
        onProceedToCheckout={handleOpenCheckout}
      />

      {isCheckoutOpen && (
        <CheckoutModal onClose={handleCloseCheckout} />
      )}

      <AIAssistant />
    </div>
  );
}
