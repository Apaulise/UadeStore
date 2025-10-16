import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { CartProvider } from "./context/CartContext";
import { PendingOrderProvider } from "./context/PendingOrderContext";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <PendingOrderProvider>
      <CartProvider>
        <>
          <RouterProvider router={router} />
          <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        </>
      </CartProvider>
    </PendingOrderProvider>
  );
};

export default App;
