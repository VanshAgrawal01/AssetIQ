import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/common/Layout";
import axiosInstance from "../api/axiosInstance";

const StatCard = ({ label, value, color, icon }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
      </div>

      <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gray-100 text-3xl">
        {icon}
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/assets/stats/dashboard")
      .then((res) => setStats(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading Dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const totalAssets = stats?.total || 0;
  const healthyAssets = stats?.available || 0;
  const healthPercentage =
    totalAssets > 0
      ? Math.round((healthyAssets / totalAssets) * 100)
      : 0;

  const actions = [
    {
      label: "Employees",
      icon: "👥",
      path: "/employees",
    },
    {
      label: "Assets",
      icon: "💻",
      path: "/assets",
    },
    {
      label: "AI Assistant",
      icon: "🤖",
      path: "/ai",
    },
    {
      label: "Audit Logs",
      icon: "📋",
      path: "/audit",
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AssetIQ Dashboard
            </h1>

            <p className="text-gray-500 mt-2">
              Monitor and manage your organization's assets efficiently.
            </p>
          </div>

          <div className="mt-4 md:mt-0 bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-100">
            📅 {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Total Assets"
            value={stats?.total || 0}
            color="text-gray-900"
            icon="💻"
          />

          <StatCard
            label="Available"
            value={stats?.available || 0}
            color="text-green-600"
            icon="✅"
          />

          <StatCard
            label="Assigned"
            value={stats?.assigned || 0}
            color="text-blue-600"
            icon="👤"
          />

          <StatCard
            label="Under Repair"
            value={stats?.underRepair || 0}
            color="text-yellow-600"
            icon="🔧"
          />

          <StatCard
            label="Unreturned"
            value={stats?.unreturned || 0}
            color="text-red-600"
            icon="🚨"
          />

          <StatCard
            label="Warranty Expiring"
            value={stats?.warrantyExpiringSoon || 0}
            color="text-orange-600"
            icon="⚠️"
          />

          <StatCard
            label="Low Health Score"
            value={stats?.lowHealth || 0}
            color="text-red-600"
            icon="❤️"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-semibold mb-5">Quick Actions</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actions.map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center justify-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-500 hover:to-indigo-600 hover:text-white transition-all duration-300"
              >
                <span className="text-3xl mb-2">{action.icon}</span>
                <span className="font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Widgets */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Asset Health */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">
              Asset Health Overview
            </h2>

            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Healthy Assets</span>
              <span className="font-bold text-green-600">
                {healthPercentage}%
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-green-500 h-4 rounded-full transition-all duration-1000"
                style={{ width: `${healthPercentage}%` }}
              ></div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between">
                <span>Total Assets</span>
                <span className="font-semibold">{stats?.total || 0}</span>
              </div>

              <div className="flex justify-between">
                <span>Available Assets</span>
                <span className="font-semibold text-green-600">
                  {stats?.available || 0}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Under Repair</span>
                <span className="font-semibold text-yellow-600">
                  {stats?.underRepair || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">
              Recent Activity
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span>✅</span>
                <p>Assets assigned to employees</p>
              </div>

              <div className="flex items-center gap-3">
                <span>🔧</span>
                <p>Assets currently under repair</p>
              </div>

              <div className="flex items-center gap-3">
                <span>⚠️</span>
                <p>Warranty expiration alerts generated</p>
              </div>

              <div className="flex items-center gap-3">
                <span>📦</span>
                <p>New assets added to inventory</p>
              </div>

              <div className="flex items-center gap-3">
                <span>🤖</span>
                <p>AI assistant available for asset insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}