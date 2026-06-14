import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const menuItems = [
  {
    path: "/",
    label: "Dashboard",
    icon: "📊",
    roles: ["ADMIN", "IT_MANAGER", "EMPLOYEE"],
  },
  {
    path: "/employees",
    label: "Employees",
    icon: "👥",
    roles: ["ADMIN", "IT_MANAGER"],
  },
  {
    path: "/assets",
    label: "Assets",
    icon: "💻",
    roles: ["ADMIN", "IT_MANAGER", "EMPLOYEE"],
  },
  {
    path: "/assignments",
    label: "Assignments",
    icon: "📦",
    roles: ["ADMIN", "IT_MANAGER"],
  },
  {
    path: "/damage",
    label: "Damage Reports",
    icon: "🔧",
    roles: ["ADMIN", "IT_MANAGER", "EMPLOYEE"],
  },
  {
    path: "/suppliers",
    label: "Suppliers",
    icon: "🏭",
    roles: ["ADMIN"],
  },
  {
    path: "/audit",
    label: "Audit Logs",
    icon: "📋",
    roles: ["ADMIN"],
  },

  { 
    path: '/analytics',
    label: 'Analytics',
    icon: '📈',
    roles: ['ADMIN', 'IT_MANAGER']
   },
   { 
    path: '/return-checklist',
    label: 'Return Checklist',
    icon: '📋', 
    roles: ['ADMIN', 'IT_MANAGER'] 
  },
  {
   path: '/asset-requests',
   label: 'Asset Requests', 
   icon: '📥',
   roles: ['ADMIN', 'IT_MANAGER'] 
  },
  {
   path: '/reports',
   label: 'Reports',
   icon: '📊',
   roles: ['ADMIN', 'IT_MANAGER'] 
  },
  {
   path: "/ai",
   label: "AI Assistant",
   icon: "🤖",
   roles: ["ADMIN", "IT_MANAGER"],
  },

];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const filteredItems = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <aside className="w-72 min-h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm">

      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xl">A</span>
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-900">
              AssetIQ
            </h1>
            <p className="text-xs text-gray-500">
              Smart Asset Management
            </p>
          </div>
        </div>
      </div>

      {/* User Card */}
      <div className="mx-4 mt-6 mb-6 p-4 rounded-2xl bg-gray-50 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>

          <div>
            <h3 className="text-gray-900 text-sm font-semibold">
              {user?.name}
            </h3>

            <span className="text-xs text-blue-600 font-medium">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <div className="space-y-2">
          {filteredItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                  active
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                <span className="text-lg">
                  {item.icon}
                </span>

                <span className="font-medium">
                  {item.label}
                </span>

                {active && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-blue-200"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300"
        >
          <span>🚪</span>
          <span className="font-medium">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}