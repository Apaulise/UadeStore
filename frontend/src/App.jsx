import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <CartProvider>
      <>
        <RouterProvider router={router} />
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      </>
    </CartProvider>
  );
};

export default App;
