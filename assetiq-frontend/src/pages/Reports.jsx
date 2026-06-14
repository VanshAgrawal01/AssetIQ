import { useState, useEffect } from 'react'
import Layout from '../components/common/Layout'
import axiosInstance from '../api/axiosInstance'

export default function Reports() {
  const [assets,     setAssets]     = useState([])
  const [employees,  setEmployees]  = useState([])
  const [damage,     setDamage]     = useState([])
  const [assignments,setAssignments]= useState([])
  const [loading,    setLoading]    = useState(true)
  const [generating, setGenerating] = useState('')

  useEffect(() => {
    Promise.all([
      axiosInstance.get('/assets'),
      axiosInstance.get('/employees'),
      axiosInstance.get('/damage'),
      axiosInstance.get('/assignments')
    ]).then(([a, e, d, asgn]) => {
      setAssets(a.data.data)
      setEmployees(e.data.data)
      setDamage(d.data.data)
      setAssignments(asgn.data.data)
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  const generateAssetReport = async () => {
    setGenerating('assets')
    try {
      const res = await axiosInstance.get('/reports/assets', {
        responseType: 'blob'
      })
      const url  = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href  = url
      link.setAttribute('download', `AssetIQ_Assets_${new Date().toLocaleDateString()}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      alert('Failed to generate report')
    } finally {
      setGenerating('')
    }
  }

  const generateEmployeeReport = async () => {
    setGenerating('employees')
    try {
      const res = await axiosInstance.get('/reports/employees', {
        responseType: 'blob'
      })
      const url  = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href  = url
      link.setAttribute('download', `AssetIQ_Employees_${new Date().toLocaleDateString()}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      alert('Failed to generate report')
    } finally {
      setGenerating('')
    }
  }

  const generateDamageReport = async () => {
    setGenerating('damage')
    try {
      const res = await axiosInstance.get('/reports/damage', {
        responseType: 'blob'
      })
      const url  = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href  = url
      link.setAttribute('download', `AssetIQ_Damage_${new Date().toLocaleDateString()}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      alert('Failed to generate report')
    } finally {
      setGenerating('')
    }
  }

  const generateFullReport = async () => {
    setGenerating('full')
    try {
      const res = await axiosInstance.get('/reports/full', {
        responseType: 'blob'
      })
      const url  = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href  = url
      link.setAttribute('download', `AssetIQ_Full_Report_${new Date().toLocaleDateString()}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      alert('Failed to generate report')
    } finally {
      setGenerating('')
    }
  }

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 text-sm mt-1">
            Generate and download PDF reports
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Assets',    value: assets.length,     color: 'bg-blue-600'   },
            { label: 'Total Employees', value: employees.length,  color: 'bg-green-600'  },
            { label: 'Assignments',     value: assignments.length, color: 'bg-purple-600' },
            { label: 'Damage Reports',  value: damage.length,     color: 'bg-red-600'    },
          ].map(stat => (
            <div key={stat.label} className={`${stat.color} rounded-xl p-5 text-white`}>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm opacity-80 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-2 gap-6">

          {/* Asset Report */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                💻
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">Asset Inventory Report</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Complete list of all assets with status, health score, warranty, and assignment details.
                </p>
                <div className="mt-3 flex gap-4 text-xs text-gray-500">
                  <span>📊 {assets.length} assets</span>
                  <span>✅ {assets.filter(a => a.status === 'AVAILABLE').length} available</span>
                  <span>👤 {assets.filter(a => a.status === 'ASSIGNED').length} assigned</span>
                </div>
              </div>
            </div>
            <button
              onClick={generateAssetReport}
              disabled={generating === 'assets'}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {generating === 'assets' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>📥 Download Asset Report</>
              )}
            </button>
          </div>

          {/* Employee Report */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                👥
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">Employee Report</h2>
                <p className="text-sm text-gray-500 mt-1">
                  All employees with department, designation, assigned assets, and exit status.
                </p>
                <div className="mt-3 flex gap-4 text-xs text-gray-500">
                  <span>👥 {employees.length} employees</span>
                  <span>✅ {employees.filter(e => e.isActive).length} active</span>
                  <span>🚪 {employees.filter(e => e.exitDate).length} exiting</span>
                </div>
              </div>
            </div>
            <button
              onClick={generateEmployeeReport}
              disabled={generating === 'employees'}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {generating === 'employees' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>📥 Download Employee Report</>
              )}
            </button>
          </div>

          {/* Damage Report */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                🔧
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">Damage Report Summary</h2>
                <p className="text-sm text-gray-500 mt-1">
                  All damage reports with repair costs, status, and resolution details.
                </p>
                <div className="mt-3 flex gap-4 text-xs text-gray-500">
                  <span>🔴 {damage.filter(d => d.status === 'OPEN').length} open</span>
                  <span>🟡 {damage.filter(d => d.status === 'UNDER_REVIEW').length} under review</span>
                  <span>✅ {damage.filter(d => d.status === 'RESOLVED').length} resolved</span>
                </div>
              </div>
            </div>
            <button
              onClick={generateDamageReport}
              disabled={generating === 'damage'}
              className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {generating === 'damage' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>📥 Download Damage Report</>
              )}
            </button>
          </div>

          {/* Full Report */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                📊
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">Full System Report</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Complete report including assets, employees, assignments, and damage summary.
                </p>
                <div className="mt-3 flex gap-4 text-xs text-gray-500">
                  <span>📦 All modules</span>
                  <span>📅 {new Date().toDateString()}</span>
                </div>
              </div>
            </div>
            <button
              onClick={generateFullReport}
              disabled={generating === 'full'}
              className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {generating === 'full' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>📥 Download Full Report</>
              )}
            </button>
          </div>

        </div>
      </div>
    </Layout>
  )
}