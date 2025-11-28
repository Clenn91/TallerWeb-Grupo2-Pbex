import { Link } from 'react-router-dom';
import { PRODUCT_CATEGORIES } from '../utils/constants';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const company = {
    name: 'Plásticos Básicos de Exportación S.A.C.',
    ruc: '20101607233',
    email: 'ventas@pbex.com.pe',
    phone1: '(01) 357-6464',
    phone2: '(01) 362-5355',
    address: 'Av. Colectora Industrial 191 Santa Anita, Lima Perú',
  };

  const formatCategoryName = (value: string = ''): string =>
    value
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  return (
    <footer className="footer bg-gray-900 text-white mt-auto">
      <div className="footer-top py-12">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Contacto */}
            <div className="footer-column">
              <h3 className="text-lg font-bold mb-4">CONTACTO</h3>
              <ul className="footer-links space-y-3">
                <li className="flex items-center gap-2">
                  <i className="fab fa-whatsapp text-green-400"></i>
                  <a
                    href="https://wa.me/51013576464"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Whatsapp
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-phone text-primary-400"></i>
                  <a
                    href="tel:013576464"
                    className="hover:text-primary-400 transition-colors"
                  >
                    {company.phone1}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-phone text-primary-400"></i>
                  <a
                    href="tel:013625355"
                    className="hover:text-primary-400 transition-colors"
                  >
                    {company.phone2}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-envelope text-primary-400"></i>
                  <a
                    href={`mailto:${company.email}`}
                    className="hover:text-primary-400 transition-colors"
                  >
                    {company.email}
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-map-marker-alt text-primary-400 mt-1"></i>
                  <span className="text-sm">{company.address}</span>
                </li>
              </ul>
            </div>

            {/* Enlaces rápidos */}
            <div className="footer-column">
              <h3 className="text-lg font-bold mb-4">ENLACES RÁPIDOS</h3>
              <ul className="footer-links space-y-3">
                <li>
                  <Link
                    to="/"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link
                    to="/nosotros"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Nosotros
                  </Link>
                </li>
                <li>
                  <Link
                    to="/public-products"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Productos
                  </Link>
                </li>
              </ul>
            </div>

            {/* Productos */}
            <div className="footer-column">
              <h3 className="text-lg font-bold mb-4">PRODUCTOS</h3>
              <ul className="footer-links space-y-3">
                {PRODUCT_CATEGORIES.map((category) => (
                  <li key={category.value}>
                    <Link
                      to={`/public-products?category=${category.slug}`}
                      className="hover:text-primary-400 transition-colors"
                    >
                      {formatCategoryName(category.value)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Redes Sociales */}
            <div className="footer-column">
              <h3 className="text-lg font-bold mb-4">SÍGUENOS</h3>
              <div className="social-links flex gap-4 mb-6">
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link w-10 h-10 flex items-center justify-center bg-gray-800 rounded-full hover:bg-primary-600 transition-colors"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link w-10 h-10 flex items-center justify-center bg-gray-800 rounded-full hover:bg-primary-600 transition-colors"
                >
                  <i className="fab fa-instagram"></i>
                </a>
              </div>

              <h3 className="text-lg font-bold mb-4 mt-6">MEDIOS DE PAGO</h3>
              <div className="payment-methods flex gap-4">
                <i className="fab fa-cc-visa text-3xl text-gray-400"></i>
                <i className="fab fa-cc-mastercard text-3xl text-gray-400"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom border-t border-gray-800 py-6">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>
              ©{currentYear} {company.name}. RUC {company.ruc}. Todos los derechos
              reservados.
            </p>
            <p className="flex items-center gap-1">
              Desarrollado con <i className="fas fa-heart text-red-500"></i> por PBEX
              Team
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

