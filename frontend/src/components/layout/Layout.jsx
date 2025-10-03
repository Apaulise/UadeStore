import { Outlet } from "react-router-dom";
import Header from "./Header";

const Layout = () => (
  <div className="min-h-screen bg-white text-brand-text">
    <Header />
    <main>
      <Outlet />
    </main>
  </div>
);

export default Layout;
