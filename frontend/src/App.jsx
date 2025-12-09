import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { CartProvider } from "./context/CartContext";
import { PendingOrderProvider } from "./context/PendingOrderContext";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <PendingOrderProvider>
        <CartProvider>
          <>
            <RouterProvider router={router} />
            <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
          </>
        </CartProvider>
      </PendingOrderProvider>
    </AuthProvider>
  );
};

export default App;
