import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Admin from "./pages/Admin";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "catalogo", element: <Catalog /> },
      { path: "producto/:productId", element: <ProductDetail /> },
      { path: "checkout", element: <Checkout /> },
      { path: "admin", element: <Admin /> },
    ],
  },
]);
