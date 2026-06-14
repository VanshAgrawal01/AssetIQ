import { useState, useEffect } from 'react'
import Layout from '../components/common/Layout'
import axiosInstance from '../api/axiosInstance'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function Analytics() {
  const [assets,    setAssets]    = useState([])
  const [employees, setEmployees] = useState([])
  const [damage,    setDamage]    = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      axiosInstance.get('/assets'),
      axiosInstance.get('/employees'),
      axiosInstance.get('/damage')
    ]).then(([a, e, d]) => {
      setAssets(a.data.data)
      setEmployees(e.data.data)
      setDamage(d.data.data)
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  // Asset type distribution
  const assetTypeData = Object.entries(
    assets.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value }))

  // Asset status distribution
  const assetStatusData = Object.entries(
    assets.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1
      return acc
    }, {})
  ).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))

  // Department wise employees
  const deptData = Object.entries(
    employees.reduce((acc, e) => {
      acc[e.department] = (acc[e.department] || 0) + 1
      return acc
    }, {})
  ).map(([dept, count]) => ({ dept, count }))

  // Health score distribution
  const healthData = [
    { range: 'Excellent (80-100)', count: assets.filter(a => a.healthScore >= 80).length, color: '#10B981' },
    { range: 'Good (40-79)',       count: assets.filter(a => a.healthScore >= 40 && a.healthScore < 80).length, color: '#F59E0B' },
    { range: 'Critical (0-39)',    count: assets.filter(a => a.healthScore < 40).length, color: '#EF4444' },
  ]

  // Damage status
  const damageStatusData = Object.entries(
    damage.reduce((acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1
      return acc
    }, {})
  ).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))

  // Department wise assets
  const deptAssetData = employees.map(emp => ({
    dept: emp.department,
    assets: emp.assignments?.length || 0
  })).reduce((acc, item) => {
    const existing = acc.find(a => a.dept === item.dept)
    if (existing) existing.assets += item.assets
    else acc.push({ ...item })
    return acc
  }, [])

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Visual overview of your IT assets</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Assets',    value: assets.length,                                          color: 'bg-blue-600'   },
            { label: 'Total Employees', value: employees.length,                                       color: 'bg-green-600'  },
            { label: 'Damage Reports',  value: damage.length,                                          color: 'bg-red-600'    },
            { label: 'Avg Health',      value: assets.length ? Math.round(assets.reduce((s,a) => s + a.healthScore, 0) / assets.length) + '%' : '0%', color: 'bg-purple-600' },
          ].map(card => (
            <div key={card.label} className={`${card.color} rounded-xl p-6 text-white`}>
              <p className="text-3xl font-bold">{card.value}</p>
              <p className="text-sm opacity-80 mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Row 1 — Asset Type + Status */}
        <div className="grid grid-cols-2 gap-6 mb-6">

          {/* Asset Type Pie */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Asset Type Distribution</h2>
            {assetTypeData.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={assetTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {assetTypeData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Asset Status Bar */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Asset Status Overview</h2>
            {assetStatusData.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={assetStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4,4,0,0]}>
                    {assetStatusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Row 2 — Health Score + Damage */}
        <div className="grid grid-cols-2 gap-6 mb-6">

          {/* Health Score Bar */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Asset Health Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={healthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4,4,0,0]}>
                  {healthData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Damage Status Pie */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Damage Report Status</h2>
            {damageStatusData.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No damage reports</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={damageStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {damageStatusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Row 3 — Department */}
        <div className="grid grid-cols-2 gap-6">

          {/* Department Employees */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Employees by Department</h2>
            {deptData.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={deptData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="dept" type="category" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Department Assets */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Assets by Department</h2>
            {deptAssetData.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={deptAssetData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="dept" type="category" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="assets" fill="#10B981" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </Layout>
  )
}