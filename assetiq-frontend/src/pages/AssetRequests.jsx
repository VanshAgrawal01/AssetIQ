import { useState, useEffect } from 'react'
import Layout from '../components/common/Layout'
import axiosInstance from '../api/axiosInstance'

export default function AssetRequests() {
  const [requests,   setRequests]   = useState([])
  const [assets,     setAssets]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [success,    setSuccess]    = useState('')
  const [error,      setError]      = useState('')
  const [approving,  setApproving]  = useState(null)
  const [selectedAsset, setSelectedAsset] = useState('')

  const fetchRequests = () => {
    setLoading(true)
    Promise.all([
      axiosInstance.get('/asset-requests'),
      axiosInstance.get('/assets?status=AVAILABLE')
    ]).then(([r, a]) => {
      setRequests(r.data.data)
      setAssets(a.data.data)
    }).catch(console.error)
    .finally(() => setLoading(false))
  }

  useEffect(() => { fetchRequests() }, [])

  const handleApprove = async (requestId) => {
    if (!selectedAsset) {
      setError('Please select an asset to assign')
      return
    }
    try {
      await axiosInstance.put(`/asset-requests/${requestId}/approve`, {
        assetId: selectedAsset
      })
      
      // Email notification
      await axiosInstance.post('/notifications', {
      title:      '✅ Asset Request Approved',
      message:    `Your asset request has been approved and assigned.`,
      type:       'INFO',
      targetRole: 'EMPLOYEE',
      sendMail:   true
      })

      setSuccess('Request approved! Asset assigned.')
      setApproving(null)
      setSelectedAsset('')
      fetchRequests()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleReject = async (requestId, reason) => {
    try {
      await axiosInstance.put(`/asset-requests/${requestId}/reject`, { reason })
      setSuccess('Request rejected.')
      fetchRequests()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject')
      setTimeout(() => setError(''), 3000)
    }
  }

  const statusColors = {
    PENDING:  'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
  }

  const pendingCount  = requests.filter(r => r.status === 'PENDING').length
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length
  const rejectedCount = requests.filter(r => r.status === 'REJECTED').length

  return (
    <Layout>
      <div className="p-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Asset Requests</h1>
          <p className="text-gray-500 text-sm mt-1">
            Review and approve asset allocation requests
          </p>
        </div>

        {/* Success / Error */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            ✅ {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            ❌ {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-sm text-yellow-700 mt-1">Pending</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
            <p className="text-sm text-green-700 mt-1">Approved</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
            <p className="text-sm text-red-700 mt-1">Rejected</p>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-gray-500">No asset requests found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Employee','Asset Type','Status','Requested On','Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {req.employee?.user?.name?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {req.employee?.user?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {req.employee?.employeeCode} • {req.employee?.department}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">
                        {req.assetType === 'LAPTOP'   ? '💻' :
                         req.assetType === 'PHONE'    ? '📱' :
                         req.assetType === 'MONITOR'  ? '🖥️' :
                         req.assetType === 'KEYBOARD' ? '⌨️' : '📦'} {req.assetType}
                      </span>
                      {req.reason && (
                        <p className="text-xs text-gray-500 mt-0.5">{req.reason}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[req.status]}`}>
                        {req.status}
                      </span>
                      {req.rejectedNote && (
                        <p className="text-xs text-red-500 mt-1">{req.rejectedNote}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(req.createdAt).toDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {req.status === 'PENDING' && (
                        <div>
                          {approving?.id === req.id ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={selectedAsset}
                                onChange={e => setSelectedAsset(e.target.value)}
                                className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select asset</option>
                                {assets
                                  .filter(a => a.type === req.assetType)
                                  .map(a => (
                                    <option key={a.id} value={a.id}>
                                      {a.name} — {a.assetCode}
                                    </option>
                                  ))
                                }
                              </select>
                              <button
                                onClick={() => handleApprove(req.id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => { setApproving(null); setSelectedAsset('') }}
                                className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => setApproving(req)}
                                className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg text-xs font-medium"
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Rejection reason:')
                                  if (reason) handleReject(req.id, reason)
                                }}
                                className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-medium"
                              >
                                ✗ Reject
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      {req.status === 'APPROVED' && (
                        <span className="text-xs text-green-600">✅ Approved</span>
                      )}
                      {req.status === 'REJECTED' && (
                        <span className="text-xs text-red-600">❌ Rejected</span>
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