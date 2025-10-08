import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { CartDrawer } from "../cart";
const Layout = () => (
  <div className="min-h-screen bg-white text-brand-text">
    <Header />
    <main>
      <Outlet />
    </main>
    <Footer />
    {/* Global Cart Drawer */}
    <CartDrawer />
  </div>
);

export default Layout;
