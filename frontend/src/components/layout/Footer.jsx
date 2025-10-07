
//         sube a /src -> entra a /assets
//         ^
// sube a /components
// ^
// sube a /layout
// ^
import Logo from "../../../src/assets/logouadestore.png";
const FacebookIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const InstagramIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const TiktokIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-linkedin-icon lucide-linkedin">
  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
  </svg>
);


const Footer = () => {
    return (
    <>
        <footer >
          {/* Sección AZUL */}
          <div className="bg-[#1E3A5F]">
          {/* Sección LOGO */}
          <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-[50%] mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="w-1/4">
                <img className="w-full h-auto" src={Logo} alt="Store Merch Logo" />
              </div>
              {/* 2. Columna de Redes Sociales */}
            <div className="flex flex-col text-white gap-6">
              <a href="#" className="hover:opacity-75 transition-opacity">
                <FacebookIcon className="h-6 w-6" />
              </a>
              <a href="#" className="hover:opacity-75 transition-opacity">
                <InstagramIcon className="h-6 w-6" />
              </a>
              <a href="#" className="hover:opacity-75 transition-opacity">
                <TiktokIcon className="h-6 w-6" />
              </a>
            </div>

            {/* Línea divisora vertical (solo visible en pantallas grandes) */}
            <div className="hidden md:block w-px h-24 bg-white"></div>

            {/* 3. Columna de Links de Soporte */}
            <nav className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
              <h3 className="font-bold text-white text-lg mb-2">Soporte al Cliente</h3>
              <a href="#" className="text-white hover:underline">Preguntas Frecuentes</a>
              <a href="#" className="text-white hover:underline">Contáctanos</a>
              <a href="#" className="text-white hover:underline">Política de Privacidad</a>
              <a href="#" className="text-white hover:underline">Política de Reembolso</a>
            </nav>
              </div>
              </div>
          </div>


            {/* Sección de Copyright */}
            <div >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <p className="text-center text-sm text-black">
                    © 2025 Store Merch por UADE, Todos los derechos reservados.
                </p>
                </div>
            </div>
        </footer>
    </>
     );
};

export default Footer;