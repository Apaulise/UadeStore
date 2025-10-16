import buzoUadeImg from "../assets/buzouade.jpg";
import logouadeImg from "../assets/logouade.jpg";

const baseItems = {
  hoodie: {
    id: "buzo-uade",
    name: "Buzo UADE",
    price: 54.9,
    quantity: 1,
    color: "Azul",
    size: "L",
    image: buzoUadeImg,
  },
  notebook: {
    id: "cuaderno-rayado",
    name: "Cuaderno Rayado",
    price: 36,
    quantity: 3,
    color: "Rojo",
    size: null,
    image: logouadeImg,
  },
};

export const mockOrders = [
  {
    id: "order-2025-07-27",
    createdAt: "2025-07-27T15:30:00Z",
    items: [baseItems.notebook, baseItems.hoodie],
    total: baseItems.notebook.price * baseItems.notebook.quantity + baseItems.hoodie.price * baseItems.hoodie.quantity,
  },
  {
    id: "order-2025-05-15",
    createdAt: "2025-05-15T10:15:00Z",
    items: [baseItems.notebook],
    total: baseItems.notebook.price * baseItems.notebook.quantity,
  },
];

export const formatOrderDate = (isoDate) => {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleDateString("es-AR", {
    weekday: undefined,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
