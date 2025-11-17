import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Nosotros = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Page Header */}
      <section className="page-header bg-primary-600 text-white py-12">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Nosotros</h1>
          <nav className="breadcrumb flex items-center gap-2 text-primary-100">
            <Link to="/" className="hover:text-white transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <span>Nosotros</span>
          </nav>
        </div>
      </section>

      {/* About Content */}
      <section className="about-content-section py-16 bg-gray-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Misión y Visión */}
          <div className="about-grid grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="about-card bg-white rounded-lg shadow-md p-8 text-center">
              <div className="about-card-icon mb-4">
                <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-bullseye text-3xl text-primary-600"></i>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Nuestra Misión</h3>
              <p className="text-gray-700 leading-relaxed">
                Proporcionar soluciones innovadoras en envases plásticos de la más alta
                calidad, satisfaciendo las necesidades de nuestros clientes con productos
                confiables y servicios excepcionales.
              </p>
            </div>

            <div className="about-card bg-white rounded-lg shadow-md p-8 text-center">
              <div className="about-card-icon mb-4">
                <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-eye text-3xl text-primary-600"></i>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Nuestra Visión</h3>
              <p className="text-gray-700 leading-relaxed">
                Ser reconocidos como la empresa líder en la fabricación y
                comercialización de envases plásticos en el Perú y Latinoamérica,
                destacando por nuestra calidad, innovación y compromiso con el medio
                ambiente.
              </p>
            </div>

            <div className="about-card bg-white rounded-lg shadow-md p-8 text-center">
              <div className="about-card-icon mb-4">
                <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-heart text-3xl text-primary-600"></i>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Nuestros Valores</h3>
              <p className="text-gray-700 leading-relaxed">
                Integridad, compromiso con la calidad, innovación constante,
                responsabilidad social y ambiental, y dedicación total al servicio de
                nuestros clientes.
              </p>
            </div>
          </div>

          {/* Historia */}
          <div className="company-history bg-white rounded-lg shadow-md p-8 mb-16">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Nuestra Historia</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Con décadas de experiencia en la industria del plástico, PBEX (Plásticos
                Básicos de Exportación S.A.C.) se ha consolidado como pionera en la
                fabricación de bidones, botellas, botellones y diversos envases plásticos
                en el Perú.
              </p>
              <p>
                Nuestra trayectoria está marcada por la constante búsqueda de la
                excelencia, implementando tecnología de punta y procesos que garantizan
                productos de la más alta calidad. Hemos crecido junto a nuestros
                clientes, adaptándonos a sus necesidades y superando sus expectativas.
              </p>
            </div>
          </div>

          {/* Certificaciones */}
          <div className="certifications bg-white rounded-lg shadow-md p-8 mb-16">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">
              Certificaciones y Calidad
            </h2>
            <p className="text-gray-700 leading-relaxed mb-8">
              Contamos con las certificaciones necesarias que garantizan la calidad de
              nuestros procesos y productos. Nuestro compromiso con la excelencia nos ha
              llevado a implementar sistemas de gestión de calidad que aseguran la
              satisfacción total de nuestros clientes.
            </p>
            <div className="certification-badges flex flex-wrap gap-6 justify-center">
              <div className="badge flex flex-col items-center gap-2 p-4 bg-primary-50 rounded-lg">
                <i className="fas fa-certificate text-4xl text-primary-600"></i>
                <span className="font-semibold text-gray-800">ISO 9001</span>
              </div>
              <div className="badge flex flex-col items-center gap-2 p-4 bg-green-50 rounded-lg">
                <i className="fas fa-leaf text-4xl text-green-600"></i>
                <span className="font-semibold text-gray-800">Gestión Ambiental</span>
              </div>
              <div className="badge flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-lg">
                <i className="fas fa-shield-alt text-4xl text-blue-600"></i>
                <span className="font-semibold text-gray-800">Seguridad Industrial</span>
              </div>
            </div>
          </div>

          {/* Por qué elegirnos */}
          <div className="why-choose-us bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">
              ¿Por Qué Elegirnos?
            </h2>
            <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="feature text-center p-6 bg-gray-50 rounded-lg">
                <i className="fas fa-industry text-4xl text-primary-600 mb-4"></i>
                <h4 className="text-xl font-semibold mb-2 text-gray-900">
                  Tecnología de Punta
                </h4>
                <p className="text-gray-700">Maquinaria y procesos de última generación</p>
              </div>
              <div className="feature text-center p-6 bg-gray-50 rounded-lg">
                <i className="fas fa-medal text-4xl text-primary-600 mb-4"></i>
                <h4 className="text-xl font-semibold mb-2 text-gray-900">
                  Calidad Garantizada
                </h4>
                <p className="text-gray-700">Productos certificados y controlados</p>
              </div>
              <div className="feature text-center p-6 bg-gray-50 rounded-lg">
                <i className="fas fa-users text-4xl text-primary-600 mb-4"></i>
                <h4 className="text-xl font-semibold mb-2 text-gray-900">
                  Equipo Profesional
                </h4>
                <p className="text-gray-700">Personal altamente capacitado</p>
              </div>
              <div className="feature text-center p-6 bg-gray-50 rounded-lg">
                <i className="fas fa-truck text-4xl text-primary-600 mb-4"></i>
                <h4 className="text-xl font-semibold mb-2 text-gray-900">
                  Entrega Oportuna
                </h4>
                <p className="text-gray-700">Cumplimiento en tiempos de entrega</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Nosotros;

