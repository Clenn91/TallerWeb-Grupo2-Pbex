import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { USER_ROLES } from "../utils/constants";

const ROLE_LABELS: Record<string, string> = {
  [USER_ROLES.ASSISTANT]: "Asistente de Calidad",
  [USER_ROLES.SUPERVISOR]: "Supervisor",
  [USER_ROLES.ADMIN]: "Administrador",
  [USER_ROLES.MANAGEMENT]: "Gerencia",
  [USER_ROLES.VISITOR]: "Visitante",
};

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string): boolean => location.pathname === path;

  const canAccess = (roles: string[]): boolean => {
    return user?.role ? roles.includes(user.role) : false;
  };

  const menuItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: "📊",
      roles: [USER_ROLES.SUPERVISOR, USER_ROLES.ADMIN, USER_ROLES.MANAGEMENT],
    },
    {
      path: "/dashboard/quality/register",
      label: "Registro de Calidad",
      icon: "📝",
      roles: [USER_ROLES.ASSISTANT, USER_ROLES.SUPERVISOR, USER_ROLES.ADMIN],
    },
    {
      path: "/dashboard/certificates",
      label: "Certificados",
      icon: "📄",
      roles: [
        USER_ROLES.ASSISTANT,
        USER_ROLES.SUPERVISOR,
        USER_ROLES.ADMIN,
        USER_ROLES.MANAGEMENT,
      ],
    },
    {
      path: "/dashboard/alerts",
      label: "Alertas",
      icon: "🚨",
      roles: [USER_ROLES.SUPERVISOR, USER_ROLES.ADMIN, USER_ROLES.MANAGEMENT],
    },
    {
      path: "/dashboard/non-conformities",
      label: "No Conformidades",
      icon: "⚠️",
      roles: [USER_ROLES.ASSISTANT, USER_ROLES.SUPERVISOR, USER_ROLES.ADMIN],
    },
    {
      path: "/dashboard/products",
      label: "Productos",
      icon: "📦",
      roles: [
        USER_ROLES.ASSISTANT,
        USER_ROLES.SUPERVISOR,
        USER_ROLES.ADMIN,
        USER_ROLES.MANAGEMENT,
      ],
    },
    {
      path: "/dashboard/users",
      label: "Usuarios",
      icon: "👥",
      roles: [USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR],
    },
  ];

  const visibleMenuItems = menuItems.filter((item) => canAccess(item.roles));

  const getRoleLabel = (role: string | undefined): string => {
    if (!role) return '';
    return ROLE_LABELS[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-primary-600">
                  Sistema Pbex
                </h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {visibleMenuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive(item.path)
                        ? "border-primary-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-5 ml-8 sm:ml-16 pl-6 sm:pl-12 border-l border-gray-200 max-w-[12rem] sm:max-w-lg flex-shrink-0">
              <div className="hidden sm:flex flex-col text-right leading-tight">
                <span className="text-sm font-semibold text-gray-900 truncate max-w-[180px]">
                  {user?.fullName}
                </span>
                <span className="text-xs text-gray-500">
                  {getRoleLabel(user?.role)} ({user?.role})
                </span>
              </div>
              <div className="sm:hidden text-xs text-gray-600 truncate max-w-[120px]">
                {user?.fullName}
              </div>
              <button onClick={logout} className="btn btn-secondary text-sm">
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

