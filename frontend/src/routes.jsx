import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Catalog from "./pages/Catalog";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Catalog /> },
      { path: "producto/:id", element: <Product /> },
      { path: "carrito", element: <Cart /> },
      { path: "checkout", element: <Checkout /> },
      { path: "mis-compras", element: <Orders /> },
      { path: "perfil", element: <Profile /> },
    ],
  },
]);
