import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/common/Layout'
import axiosInstance from '../api/axiosInstance'

const HealthBadge = ({ score }) => {
  const color = score >= 80 ? 'bg-green-100 text-green-700'
              : score >= 40 ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
  return <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>{score}/100</span>
}

const StatusBadge = ({ status }) => {
  const colors = {
    AVAILABLE:    'bg-green-100 text-green-700',
    ASSIGNED:     'bg-blue-100 text-blue-700',
    UNDER_REPAIR: 'bg-yellow-100 text-yellow-700',
    WRITTEN_OFF:  'bg-gray-100 text-gray-700',
    UNRETURNED:   'bg-red-100 text-red-700',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status] || 'bg-gray-100'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  )
}

export default function AssetDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const [asset,      setAsset]      = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [showQR,     setShowQR]     = useState(false)
  const [showIPForm, setShowIPForm] = useState(false)
  const [ipForm,     setIpForm]     = useState({ ipAddress: '', macAddress: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchAsset = () => {
    axiosInstance.get(`/assets/${id}`)
      .then(res => setAsset(res.data.data))
      .catch(() => navigate('/assets'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAsset() }, [id])

  const handleIPLog = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await axiosInstance.post('/ip-logs', { ...ipForm, assetId: id })
      setShowIPForm(false)
      setIpForm({ ipAddress: '', macAddress: '' })
      fetchAsset()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to log IP')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    </Layout>
  )

  if (!asset) return null

  const currentAssignment = asset.assignments?.find(a => a.isActive)

  return (
    <Layout>
      <div className="p-8 max-w-6xl">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/assets')}
            className="text-gray-500 hover:text-gray-700 text-sm">
            ← Back
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{asset.name}</h1>
            <p className="text-gray-500 text-sm">{asset.assetCode} • {asset.serialNumber}</p>
          </div>
          <StatusBadge status={asset.status} />
          <HealthBadge score={asset.healthScore} />
          <button onClick={() => setShowQR(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
            View QR
          </button>
        </div>

        {/* QR Modal */}
        {showQR && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
              <h3 className="text-lg font-bold mb-2">{asset.name}</h3>
              <p className="text-gray-500 text-sm mb-4">{asset.assetCode}</p>
              <img src={asset.qrCode} alt="QR" className="mx-auto w-48 h-48" />
              <p className="text-xs text-gray-400 mt-3">Scan to view asset details</p>
              <button onClick={() => setShowQR(false)}
                className="mt-4 bg-gray-100 w-full py-2 rounded-lg text-sm">Close</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">

          {/* Left — Asset Info */}
          <div className="col-span-2 space-y-6">

            {/* Basic Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Asset Information</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Type',          value: asset.type },
                  { label: 'Brand',         value: asset.brand },
                  { label: 'Model',         value: asset.model },
                  { label: 'Serial Number', value: asset.serialNumber },
                  { label: 'Condition',     value: asset.condition },
                  { label: 'Purchase Date', value: new Date(asset.purchaseDate).toDateString() },
                  { label: 'Warranty Expiry', value: new Date(asset.warrantyExpiry).toDateString() },
                  { label: 'Supplier',      value: asset.supplier?.name || '—' },
                ].map(item => (
                  <div key={item.label} className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</span>
                    <span className="text-sm font-medium text-gray-900 mt-0.5">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Assignment */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Current Assignment</h2>
              {currentAssignment ? (
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {currentAssignment.employee?.user?.name?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{currentAssignment.employee?.user?.name}</p>
                    <p className="text-sm text-gray-500">{currentAssignment.employee?.department} • {currentAssignment.employee?.designation}</p>
                    <p className="text-xs text-gray-400 mt-1">Since {new Date(currentAssignment.assignedDate).toDateString()}</p>
                  </div>
                  {currentAssignment.receiptUrl && (
                    <a href={`http://localhost:5000${currentAssignment.receiptUrl}`}
                      target="_blank" rel="noreferrer"
                      className="text-blue-600 text-sm hover:underline">
                      📄 Receipt
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Not assigned to anyone</p>
              )}
            </div>

            {/* Assignment History */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">
                Assignment History ({asset.assignments?.length || 0})
              </h2>
              {asset.assignments?.length === 0 ? (
                <p className="text-gray-500 text-sm">No assignment history</p>
              ) : (
                <div className="space-y-3">
                  {asset.assignments?.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{a.employee?.user?.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(a.assignedDate).toDateString()}
                          {a.returnedDate && ` → ${new Date(a.returnedDate).toDateString()}`}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        a.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {a.isActive ? 'Active' : 'Returned'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Damage Reports */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">
                Damage History ({asset.damageReports?.length || 0})
              </h2>
              {asset.damageReports?.length === 0 ? (
                <p className="text-gray-500 text-sm">No damage reports</p>
              ) : (
                <div className="space-y-3">
                  {asset.damageReports?.map(d => (
                    <div key={d.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{d.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          d.status === 'RESOLVED'     ? 'bg-green-100 text-green-700' :
                          d.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>{d.status?.replace('_',' ')}</span>
                        {d.repairCost && <span className="text-xs text-gray-500">₹{d.repairCost}</span>}
                        <span className="text-xs text-gray-400">{new Date(d.createdAt).toDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — IP Logs + Stats */}
          <div className="space-y-6">

            {/* Health Score */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
              <h2 className="text-sm font-medium text-gray-500 mb-3">Health Score</h2>
              <div className={`text-5xl font-bold mb-2 ${
                asset.healthScore >= 80 ? 'text-green-600' :
                asset.healthScore >= 40 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {asset.healthScore}
              </div>
              <p className="text-gray-400 text-sm">out of 100</p>
              <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${
                  asset.healthScore >= 80 ? 'bg-green-500' :
                  asset.healthScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`} style={{ width: `${asset.healthScore}%` }} />
              </div>
            </div>

            {/* IP Logs */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">IP Logs</h2>
                <button onClick={() => setShowIPForm(!showIPForm)}
                  className="text-sm text-blue-600 hover:text-blue-800">
                  + Log IP
                </button>
              </div>

              {showIPForm && (
                <form onSubmit={handleIPLog} className="mb-4 space-y-2">
                  <input
                    type="text"
                    placeholder="IP Address (e.g. 192.168.1.10)"
                    value={ipForm.ipAddress}
                    onChange={e => setIpForm({...ipForm, ipAddress: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="MAC Address (optional)"
                    value={ipForm.macAddress}
                    onChange={e => setIpForm({...ipForm, macAddress: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button type="submit" disabled={submitting}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm disabled:opacity-50">
                    {submitting ? 'Saving...' : 'Save IP Log'}
                  </button>
                </form>
              )}

              {asset.ipLogs?.length === 0 ? (
                <p className="text-gray-500 text-sm">No IP logs yet</p>
              ) : (
                <div className="space-y-2">
                  {asset.ipLogs?.slice(0, 5).map(log => (
                    <div key={log.id} className="p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono text-gray-800">{log.ipAddress}</span>
                        {log.isDuplicate && (
                          <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Duplicate</span>
                        )}
                      </div>
                      {log.macAddress && (
                        <p className="text-xs text-gray-500 mt-0.5">{log.macAddress}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(log.lastSeen).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </Layout>
  )
}