import buzoUadeImg from "../assets/buzouade.jpg";
import remeraUadeImg from "../assets/remerauade.jpg";
import logouadeImg from "../assets/logouade.jpg";
import tiendaExteriorImg from "../assets/exterioruade.jpg";

export const CATEGORY_SLUGS = {
  "NUESTROS BASICOS": "nuestros-basicos",
  "BESTSELLERS": "bestsellers",
  "ACCESORIO": "accesorios",
  "LIBRERIA": "libreria",
  "ROPA": "ropa", // Add if ROPA is a distinct category from the API
};

// Map slugs AND lowercase API values back to canonical names
const SLUG_OR_API_TO_CANONICAL = {
  // Slugs
  "nuestros-basicos": "NUESTROS BASICOS",
  "bestsellers": "BESTSELLERS",
  "accesorios": "ACCESORIO",
  "libreria": "LIBRERIA",
  "ropa": "ROPA",
  // Lowercase API values (might overlap with slugs)
  "nuestros basicos": "NUESTROS BASICOS", // Handle potential spaces from API
  "accesorio": "ACCESORIO",
  // Add other potential lowercase variants if needed
};  

export const resolveCategory = (value) => {
  if (!value) return null;
  const normalized = value.toString().trim().toLowerCase().replace(/_/g, "-"); // Normalize spaces/underscores
  return SLUG_OR_API_TO_CANONICAL[normalized] ?? value.toString().trim().toUpperCase(); // Fallback to uppercase
};

// Takes a canonical name (e.g., "ACCESORIO") and returns its slug
export const categoryToSlug = (value) => {
  if (!value) return "";
  const canonicalName = resolveCategory(value); // Ensure we have the canonical name
  return CATEGORY_SLUGS[canonicalName] ?? canonicalName.toLowerCase().replace(/\s+/g, "-"); // Fallback slug
};

const hoodieDetails = [
  "Material: Confección en frisa de algodón premium de 410 g.",
  "Corte unisex, fit relajado para un uso cómodo y urbano.",
  "Detalle de capucha forrada, cordones redondeados y ojales metálicos grabados.",
  "Logo bordado a tono en el frente.",
  "Bolsillo canguro reforzado con tapa interna para llaves, ingreso o pase estudiantil.",
  "Cuidados: Pre-lavado especial para mantener su forma lavado tras lavado.",
];

export const products =[
  {
    id: "buzo-uade",
    name: "Buzo UADE",
    category: "Bestsellers",
    price: 54.9,
    inStock: true,
    size: "M",
    color: "Gris",
    image: buzoUadeImg,
    images: [buzoUadeImg, buzoUadeImg, buzoUadeImg, buzoUadeImg],
    colorOptions: [
      { id: "gris", label: "Gris", hex: "#D8D0C7" },
      { id: "rojo", label: "Rojo", hex: "#C0392B" },
      { id: "amarillo", label: "Amarillo", hex: "#E6B91E" },
      { id: "azul", label: "Azul", hex: "#1E3A5F" },
    ],
    sizeOptions: [
      { label: "XS", available: true },
      { label: "S", available: true },
      { label: "M", available: true },
      { label: "L", available: true },
      { label: "XL", available: false },
    ],
    summary:
      "Redefinimos el concepto de básico. Nuestro buzo \"Origen\" es esa prenda ideal para quienes sueñan en grande.",
    details: hoodieDetails,
    recommended: ["buzo-uade-azul", "remera-uade", "gorra-uade", "taza-uade"],
  },
  {
    id: "buzo-uade-azul",
    name: "Buzo UADE Azul",
    category: "Bestsellers",
    price: 54.9,
    inStock: true,
    size: "L",
    color: "Azul",
    image: buzoUadeImg,
    images: [buzoUadeImg],
    colorOptions: [
      { id: "azul", label: "Azul", hex: "#1E3A5F" },
      { id: "gris", label: "Gris", hex: "#D8D0C7" },
    ],
    sizeOptions: [
      { label: "S", available: true },
      { label: "M", available: true },
      { label: "L", available: true },
      { label: "XL", available: true },
    ],
    summary: "Version azul profundo del clásico buzo UADE.",
    details: hoodieDetails,
    recommended: ["buzo-uade", "remera-uade", "accesorio-botella"],
  },
  {
    id: "remera-uade",
    name: "Remera UADE",
    category: "Nuestros Basicos",
    price: 39,
    inStock: true,
    size: "M",
    color: "Blanco",
    image: remeraUadeImg,
    images: [remeraUadeImg],
    colorOptions: [
      { id: "blanco", label: "Blanco", hex: "#F6F6F6" },
      { id: "negro", label: "Negro", hex: "#1D1D1D" },
      { id: "azul", label: "Azul", hex: "#1E3A5F" },
    ],
    sizeOptions: [
      { label: "S", available: true },
      { label: "M", available: true },
      { label: "L", available: true },
      { label: "XL", available: true },
    ],
    summary: "Remera premium 100% algodón con print UADE al frente.",
    details: [
      "Algodón peinado de 24/1 para una textura suave.",
      "Costuras reforzadas en hombros y cuello.",
      "Estampa al agua libre de ftalatos.",
    ],
    recommended: ["buzo-uade", "taza-uade", "cuaderno-rayado"],
  },
  {
    id: "gorra-uade",
    name: "Gorra UADE",
    category: "Accesorios",
    price: 18,
    inStock: true,
    size: null,
    color: "Azul",
    image: logouadeImg,
    images: [logouadeImg],
    colorOptions: [
      { id: "azul", label: "Azul", hex: "#1E3A5F" },
      { id: "gris", label: "Gris", hex: "#D8D0C7" },
    ],
    sizeOptions: [],
    summary: "Gorra snapback con frente estructurado y bordado UADE.",
    details: [
      "Visera curva con interior contrastado.",
      "Sistema snapback regulable.",
      "Paneles frontales con espuma y logo bordado.",
    ],
    recommended: ["buzo-uade", "remera-uade", "accesorio-botella"],
  },
  {
    id: "taza-uade",
    name: "Taza UADE",
    category: "Accesorios",
    price: 15,
    inStock: true,
    size: null,
    color: "Blanco",
    image: tiendaExteriorImg,
    images: [tiendaExteriorImg],
    colorOptions: [
      { id: "blanco", label: "Blanco", hex: "#F6F6F6" },
      { id: "azul", label: "Azul", hex: "#1E3A5F" },
    ],
    sizeOptions: [],
    summary: "Taza cerámica de 12 oz con impresión perimetral UADE.",
    details: [
      "Apta microondas y lavavajillas.",
      "Impresión full color resistente a rayos UV.",
      "Base antideslizante de silicona.",
    ],
    recommended: ["remera-uade", "cuaderno-rayado"],
  },
  {
    id: "cuaderno-rayado",
    name: "Cuaderno Rayado",
    category: "Libreria",
    price: 12,
    inStock: true,
    size: null,
    color: "Azul",
    image: logouadeImg,
    images: [logouadeImg],
    colorOptions: [
      { id: "azul", label: "Azul", hex: "#1E3A5F" },
      { id: "gris", label: "Gris", hex: "#D8D0C7" },
    ],
    sizeOptions: [],
    summary: "Cuaderno A5 con espiral metálica y hojas rayadas premium.",
    details: [
      "Portada plastificada de alta durabilidad.",
      "Hojas de 90 g libres de ácido.",
      "Incluye separadores temáticos UADE.",
    ],
    recommended: ["taza-uade", "remera-uade"],
  },
  {
    id: "botella-uade",
    name: "Botella UADE",
    category: "Accesorios",
    price: 25,
    inStock: false,
    size: null,
    color: "Acero",
    image: logouadeImg,
    images: [logouadeImg],
    colorOptions: [
      { id: "acero", label: "Acero", hex: "#BCC0C5" },
      { id: "azul", label: "Azul", hex: "#1E3A5F" },
    ],
    sizeOptions: [],
    summary: "Botella térmica de acero inoxidable con doble pared.",
    details: [
      "Capacidad 650 ml.",
      "Mantiene bebidas frías por 12 h y calientes por 8 h.",
      "Interior electropulido libre de BPA.",
    ],
    recommended: ["gorra-uade", "cuaderno-rayado"],
  },
  {
    id: "buzo-uade-negro",
    name: "Buzo UADE Negro",
    category: "Bestsellers",
    price: 54.9,
    inStock: false,
    size: "S",
    color: "Negro",
    image: buzoUadeImg,
    images: [buzoUadeImg],
    colorOptions: [
      { id: "negro", label: "Negro", hex: "#1D1D1D" },
      { id: "gris", label: "Gris", hex: "#D8D0C7" },
    ],
    sizeOptions: [
      { label: "S", available: true },
      { label: "M", available: true },
      { label: "L", available: false },
      { label: "XL", available: false },
    ],
    summary: "Edición limitada en negro con logo bordado tonal.",
    details: hoodieDetails,
    recommended: ["buzo-uade", "buzo-uade-azul", "gorra-uade"],
  },
];

export const findProductById = (id) =>
  products.find((product) => product.id === id);
