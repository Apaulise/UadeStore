import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { CartDrawer } from "../cart";
import Breadcrumbs from "./Breadcrumbs";
const Layout = () => (
  <div className="min-h-screen bg-white text-brand-text">
    <Header />
    <main>
      <Breadcrumbs />
      <Outlet />
    </main>
    <Footer />
    {/* Global Cart Drawer */}
    <CartDrawer />
  </div>
);

export default Layout;
