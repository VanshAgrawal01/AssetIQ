import { useState, useEffect } from 'react'
import Layout from '../components/common/Layout'
import axiosInstance from '../api/axiosInstance'
import { useAuth } from '../context/AuthContext'

export default function DamageReports() {
  const { user } = useAuth()
  const [reports,    setReports]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [assets,     setAssets]     = useState([])
  const [form,       setForm]       = useState({ assetId: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')
  const [success,    setSuccess]    = useState('')

  const fetchReports = () => {
    setLoading(true)
    axiosInstance.get('/damage')
      .then(res => setReports(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchReports()
    axiosInstance.get('/assets?status=ASSIGNED')
      .then(res => setAssets(res.data.data))
      .catch(console.error)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await axiosInstance.post('/damage', form)

      // Email notification bhi bhejo
      await axiosInstance.post('/notifications', {
      title:      '🔧 New Damage Report',
      message:    `A damage report has been submitted for asset ID: ${form.assetId}`,
      type:       'DAMAGE',
      targetRole: 'IT_MANAGER',
      sendMail:   true
      })
      
      setSuccess('Damage report submitted successfully!')
      setShowForm(false)
      setForm({ assetId: '', description: '' })
      fetchReports()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReview = async (id, status, repairCost) => {
    try {
      await axiosInstance.put(`/damage/${id}`, { status, repairCost: parseFloat(repairCost) || 0 })
      fetchReports()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update')
    }
  }

  const statusColors = {
    OPEN:         'bg-red-100 text-red-700',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
    RESOLVED:     'bg-green-100 text-green-700',
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Damage Reports</h1>
            <p className="text-gray-500 text-sm mt-1">{reports.length} total reports</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Report Damage
          </button>
        </div>

        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">✅ {success}</div>}

        {showForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-semibold mb-4">Report Damage</h2>
            {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset</label>
                <select value={form.assetId} onChange={e => setForm({...form, assetId: e.target.value})} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Asset</option>
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>{asset.name} — {asset.assetCode}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required rows={3}
                  placeholder="Describe the damage..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={submitting}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No damage reports found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Asset','Employee','Description','Status','Repair Cost','Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reports.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{r.asset?.name}</div>
                      <div className="text-xs text-gray-500">{r.asset?.assetCode}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.employee?.user?.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{r.description}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                        {r.status?.replace('_',' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {r.repairCost ? `₹${r.repairCost}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {(user?.role === 'ADMIN' || user?.role === 'IT_MANAGER') && r.status !== 'RESOLVED' && (
                        <select
                          onChange={e => {
                            if (e.target.value) {
                              const cost = r.status === 'OPEN' ? prompt('Enter repair cost (₹):') || 0 : r.repairCost
                              handleReview(r.id, e.target.value, cost)
                            }
                          }}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none"
                          defaultValue=""
                        >
                          <option value="">Update</option>
                          <option value="UNDER_REVIEW">Under Review</option>
                          <option value="RESOLVED">Resolved</option>
                        </select>
                      )}
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