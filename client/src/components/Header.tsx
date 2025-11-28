import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { PRODUCT_CATEGORIES } from "../utils/constants";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const company = {
    schedule: "Lunes - Viernes 8:00am - 5:00pm | Sábado 8:00am - 12:00pm",
    email: "ventas@pbex.com.pe",
    phone1: "(01) 357-6464",
  };

  const toggleMobileMenu = (): void => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = (): void => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  const toggleDropdown = (): void => {
    if (window.innerWidth <= 992) {
      setDropdownOpen(!dropdownOpen);
    }
  };

  useEffect(() => {
    const handleResize = (): void => {
      if (window.innerWidth > 992) {
        setMobileMenuOpen(false);
        setDropdownOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="header bg-white shadow-md sticky top-0 z-50">
      {/* Top Bar */}
      <div className="top-bar bg-primary-600 text-white py-2">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="top-bar-left">
              <span className="flex items-center gap-2">
                <i className="far fa-clock"></i>
                {company.schedule}
              </span>
            </div>
            <div className="top-bar-right">
              <a
                href={`mailto:${company.email}`}
                className="flex items-center gap-2 hover:underline"
              >
                <i className="far fa-envelope"></i>
                {company.email}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="main-header">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="logo flex-shrink-0">
              <Link to="/" className="flex items-center">
                <div className="text-2xl font-bold text-primary-600">PBEX</div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="main-nav flex-1 hidden lg:flex justify-center">
              <ul className="flex items-center space-x-8">
                <li>
                  <Link
                    to="/"
                    className={`nav-link px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === "/"
                        ? "text-primary-600 bg-primary-50"
                        : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                    }`}
                  >
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link
                    to="/nosotros"
                    className={`nav-link px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === "/nosotros"
                        ? "text-primary-600 bg-primary-50"
                        : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                    }`}
                  >
                    Nosotros
                  </Link>
                </li>
                <li className="relative group">
                  <button
                    onClick={toggleDropdown}
                    className="nav-link px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  >
                    Productos
                    <i className="fas fa-chevron-down text-xs"></i>
                  </button>
                  <ul className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <li>
                      <Link
                        to="/public-products"
                        className="block px-4 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-50 border-b border-gray-200"
                      >
                        Ver Todos los Productos
                      </Link>
                    </li>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <li key={category.value}>
                        <Link
                          to={`/public-products?category=${category.slug}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {category.value}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>

            {/* Contact Info & Login */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm">
                <i className="fas fa-phone-alt text-primary-600"></i>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">CONTÁCTANOS</span>
                  <a
                    href="tel:013576464"
                    className="text-primary-600 font-semibold hover:underline"
                  >
                    {company.phone1}
                  </a>
                </div>
              </div>

              {!isAuthenticated && (
                <Link to="/login" className="btn btn-primary text-sm px-4 py-2">
                  Iniciar Sesión
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden mobile-menu-toggle p-2 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={toggleMobileMenu}
              >
                <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
                  <span
                    className={`block h-0.5 w-full bg-current transition-all ${
                      mobileMenuOpen ? "rotate-45 translate-y-2" : ""
                    }`}
                  ></span>
                  <span
                    className={`block h-0.5 w-full bg-current transition-all ${
                      mobileMenuOpen ? "opacity-0" : ""
                    }`}
                  ></span>
                  <span
                    className={`block h-0.5 w-full bg-current transition-all ${
                      mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
                    }`}
                  ></span>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            className={`lg:hidden mobile-menu transition-all duration-300 overflow-hidden ${
              mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <ul className="py-4 space-y-2">
              <li>
                <Link
                  to="/"
                  onClick={closeMobileMenu}
                  className={`block px-4 py-2 rounded-md ${
                    location.pathname === "/"
                      ? "text-primary-600 bg-primary-50"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/nosotros"
                  onClick={closeMobileMenu}
                  className={`block px-4 py-2 rounded-md ${
                    location.pathname === "/nosotros"
                      ? "text-primary-600 bg-primary-50"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Nosotros
                </Link>
              </li>
              <li>
                <button
                  onClick={toggleDropdown}
                  className="w-full text-left px-4 py-2 rounded-md text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                >
                  Productos
                  <i
                    className={`fas fa-chevron-down text-xs transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  ></i>
                </button>
                <ul
                  className={`pl-4 space-y-1 overflow-hidden transition-all ${
                    dropdownOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <li>
                    <Link
                      to="/public-products"
                      onClick={closeMobileMenu}
                      className="block px-4 py-2 rounded-md text-sm font-semibold text-primary-600 hover:bg-primary-50 border-b border-gray-200"
                    >
                      Ver Todos los Productos
                    </Link>
                  </li>
                  {PRODUCT_CATEGORIES.map((category) => (
                    <li key={category.value}>
                      <Link
                        to={`/public-products?category=${category.slug}`}
                        onClick={closeMobileMenu}
                        className="block px-4 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                      >
                        {category.value}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

