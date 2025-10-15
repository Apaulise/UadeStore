import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Admin from "./pages/Admin";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import { findProductById } from "./data/products";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    handle: {
      crumb: () => ({ label: "Inicio", to: "/" }),
    },
    children: [
      { index: true, element: <Home /> },
      {
        path: "catalogo",
        element: <Catalog />,
        handle: {
          crumb: () => ({ label: "Catalogo", to: "/catalogo" }),
        },
      },
      {
        path: "producto/:productId",
        element: <ProductDetail />,
        handle: {
          crumb: (match) => {
            const product = findProductById(match.params.productId);
            return [
              { label: "Catalogo", to: "/catalogo" },
              {
                label: product?.name ?? "Producto",
                to: `/producto/${match.params.productId}`,
              },
            ];
          },
        },
      },
      {
        path: "checkout",
        element: <Checkout />,
        handle: {
          crumb: () => ({ label: "Checkout", to: "/checkout" }),
        },
      },
      {
        path: "admin",
        element: <Admin />,
        handle: {
          crumb: () => ({ label: "Admin", to: "/admin" }),
        },
      },
    ],
  },
]);
