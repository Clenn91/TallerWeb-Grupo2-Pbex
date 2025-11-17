import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { PRODUCT_CATEGORIES } from '../utils/constants';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'PIONEROS EN LA FABRICACIÓN DE BIDONES EN EL PERÚ',
      subtitle: 'Amplia Línea',
      link: '/public-products',
      buttonText: 'Ver productos',
    },
    {
      title: 'EXPERIENCIA, TECNOLOGÍA Y CALIDAD',
      subtitle: 'Empresa certificada',
      link: '/nosotros',
      buttonText: 'Ver CERTIFICADOS',
    },
  ];

  const formatCategoryName = (value = '') =>
    value
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  useEffect(() => {
    if (slides.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="hero relative bg-gradient-to-r from-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="relative h-[500px] md:h-[600px]">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                <div className="hero-content max-w-3xl">
                  <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="hero-subtitle text-xl md:text-2xl mb-8 text-primary-100">
                    {slide.subtitle}
                  </p>
                  <Link
                    to={slide.link}
                    className={`btn btn-primary bg-white text-primary-600 hover:bg-primary-50 inline-flex items-center gap-2 text-lg px-8 py-3 ${
                      currentSlide === index ? '' : 'pointer-events-none'
                    }`}
                  >
                    {slide.buttonText} <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Slider Controls */}
          {slides.length > 1 && (
            <>
              <button
                className="slider-control prev absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
                onClick={prevSlide}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <button
                className="slider-control next absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
                onClick={nextSlide}
              >
                <i className="fas fa-chevron-right"></i>
              </button>

              {/* Slider Indicators */}
              <div className="slider-indicators absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    className={`indicator w-3 h-3 rounded-full transition-all ${
                      currentSlide === index
                        ? 'bg-white w-8'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    onClick={() => goToSlide(index)}
                  ></button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section className="products-section py-16 bg-gray-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Nuestros Productos
          </h2>

          <div className="products-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {PRODUCT_CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                to={`/public-products?category=${category.slug}`}
                className="product-card bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow group"
              >
                <div className="product-image mb-4">
                  <div className="w-20 h-20 mx-auto bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <i className="fas fa-box text-3xl text-primary-600"></i>
                  </div>
                </div>
                <h3 className="product-name font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                  {formatCategoryName(category.value)}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section py-16 bg-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            TRAYECTORIA, REPUTACIÓN Y CONFIABILIDAD
          </h2>
          <p className="section-subtitle text-xl text-center text-gray-600 mb-8">
            Somos la empresa líder en soluciones de envases plásticos en Perú
          </p>

          <div className="about-content max-w-3xl mx-auto text-center">
            <p className="text-lg text-gray-700 mb-8">
              Somos líderes en la industria del plástico, con valores arraigados,
              tecnología punta y una larga experiencia. Fabricamos productos de alta
              calidad que impulsan el éxito de nuestros clientes.
            </p>
            <Link
              to="/nosotros"
              className="btn btn-secondary inline-flex items-center gap-2 text-lg px-8 py-3"
            >
              Conoce más <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;

