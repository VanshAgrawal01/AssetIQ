import { useState, useEffect } from 'react'
import Layout from '../components/common/Layout'
import axiosInstance from '../api/axiosInstance'

export default function Assignments() {
  const [assignments, setAssignments] = useState([])
  const [employees,   setEmployees]   = useState([])
  const [assets,      setAssets]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [showForm,    setShowForm]    = useState(false)
  const [form,        setForm]        = useState({ employeeId: '', assetId: '' })
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState('')
  const [successMsg,  setSuccessMsg]  = useState('')

  const fetchAll = () => {
    setLoading(true)
    Promise.all([
      axiosInstance.get('/assignments'),
      axiosInstance.get('/employees'),
      axiosInstance.get('/assets?status=AVAILABLE')
    ]).then(([a, e, as]) => {
      setAssignments(a.data.data)
      setEmployees(e.data.data)
      setAssets(as.data.data)
    }).catch(console.error)
    .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const handleAssign = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await axiosInstance.post('/assignments/assign', form)
      setSuccessMsg('Asset assigned successfully! PDF receipt generated.')
      setShowForm(false)
      setForm({ employeeId: '', assetId: '' })
      fetchAll()
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign asset')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
            <p className="text-gray-500 text-sm mt-1">{assignments.length} total assignments</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Assign Asset
          </button>
        </div>

        {/* Success */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            ✅ {successMsg}
          </div>
        )}

        {/* Assign Form */}
        {showForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-semibold mb-4">Assign Asset to Employee</h2>
            {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>}
            <form onSubmit={handleAssign} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.user?.name} — {emp.employeeCode}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Available Asset</label>
                <select value={form.assetId} onChange={e => setForm({...form, assetId: e.target.value})} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Asset</option>
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} — {asset.assetCode}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 flex gap-3">
                <button type="submit" disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                  {submitting ? 'Assigning...' : 'Assign Asset'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : assignments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No assignments found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Employee','Asset','Assigned Date','Status','Receipt'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {assignments.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{a.employee?.user?.name}</div>
                      <div className="text-xs text-gray-500">{a.employee?.employeeCode}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{a.asset?.name}</div>
                      <div className="text-xs text-gray-500">{a.asset?.assetCode}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(a.assignedDate).toDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        a.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {a.isActive ? 'Active' : 'Returned'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {a.receiptUrl ? (
                        <a href={`http://localhost:5000${a.receiptUrl}`} target="_blank" rel="noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                          📄 Download
                        </a>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  )
}