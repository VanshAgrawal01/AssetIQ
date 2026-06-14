import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/common/Layout'
import axiosInstance from '../api/axiosInstance'

const HealthBadge = ({ score }) => {
  const color = score >= 80 ? 'bg-green-100 text-green-700'
              : score >= 40 ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {score}/100
    </span>
  )
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
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  )
}

export default function Assets() {
  const navigate     = useNavigate()
  const [assets,     setAssets]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [showQR,     setShowQR]     = useState(null)
  const [filter,     setFilter]     = useState({ status: '', type: '', search: '' })
  const [form,       setForm]       = useState({
    name: '', type: 'LAPTOP', brand: '', model: '',
    serialNumber: '', purchaseDate: '', warrantyExpiry: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')
  const [success,    setSuccess]    = useState('')

  const fetchAssets = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter.status) params.append('status', filter.status)
    if (filter.type)   params.append('type',   filter.type)
    if (filter.search) params.append('search', filter.search)
    axiosInstance.get(`/assets?${params}`)
      .then(res => setAssets(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAssets() }, [filter])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await axiosInstance.post('/assets', form)
      setSuccess('Asset created successfully!')
      setShowForm(false)
      setForm({ name:'', type:'LAPTOP', brand:'', model:'', serialNumber:'', purchaseDate:'', warrantyExpiry:'' })
      fetchAssets()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create asset')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRowClick = (e, assetId) => {
    if (e.target.closest('button')) return
    navigate(`/assets/${assetId}`)
  }

  return (
    <Layout>
      <div className="p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assets</h1>
            <p className="text-gray-500 text-sm mt-1">{assets.length} total assets</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + Add Asset
          </button>
        </div>

        {/* Success */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            ✅ {success}
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-semibold mb-4">New Asset</h2>
            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  required
                  placeholder="e.g. Dell Latitude 7420"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm({...form, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {['LAPTOP','MONITOR','KEYBOARD','MOUSE','HEADSET','PHONE','TABLET','OTHER'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={e => setForm({...form, brand: e.target.value})}
                  required
                  placeholder="e.g. Dell"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input
                  type="text"
                  value={form.model}
                  onChange={e => setForm({...form, model: e.target.value})}
                  required
                  placeholder="e.g. Latitude 7420"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                <input
                  type="text"
                  value={form.serialNumber}
                  onChange={e => setForm({...form, serialNumber: e.target.value})}
                  required
                  placeholder="e.g. DL7420001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={form.purchaseDate}
                  onChange={e => setForm({...form, purchaseDate: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Expiry</label>
                <input
                  type="date"
                  value={form.warrantyExpiry}
                  onChange={e => setForm({...form, warrantyExpiry: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Asset'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError('') }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4 flex gap-3">
          <input
            type="text"
            placeholder="Search by name, serial, code..."
            value={filter.search}
            onChange={e => setFilter({...filter, search: e.target.value})}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filter.status}
            onChange={e => setFilter({...filter, status: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            {['AVAILABLE','ASSIGNED','UNDER_REPAIR','WRITTEN_OFF','UNRETURNED'].map(s => (
              <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
            ))}
          </select>
          <select
            value={filter.type}
            onChange={e => setFilter({...filter, type: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {['LAPTOP','MONITOR','KEYBOARD','MOUSE','HEADSET','PHONE','TABLET','OTHER'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* QR Modal */}
        {showQR && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
              <h3 className="text-lg font-bold mb-2">{showQR.name}</h3>
              <p className="text-gray-500 text-sm mb-1">{showQR.assetCode}</p>
              <p className="text-gray-400 text-xs mb-4">{showQR.serialNumber}</p>
              <img src={showQR.qrCode} alt="QR Code" className="mx-auto w-48 h-48" />
              <p className="text-xs text-gray-400 mt-3">Scan with phone to view asset details</p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => navigate(`/assets/${showQR.id}`)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium"
                >
                  View Detail
                </button>
                <button
                  onClick={() => setShowQR(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-5 gap-3 mb-4">
          {[
            { label: 'Total',        value: assets.length,                                                       color: 'text-gray-900'   },
            { label: 'Available',    value: assets.filter(a => a.status === 'AVAILABLE').length,                 color: 'text-green-600'  },
            { label: 'Assigned',     value: assets.filter(a => a.status === 'ASSIGNED').length,                  color: 'text-blue-600'   },
            { label: 'Under Repair', value: assets.filter(a => a.status === 'UNDER_REPAIR').length,              color: 'text-yellow-600' },
            { label: 'Unreturned',   value: assets.filter(a => a.status === 'UNRETURNED').length,                color: 'text-red-600'    },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : assets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No assets found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Code','Name','Type','Brand','Status','Health','Assigned To','Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {assets.map(asset => (
                  <tr
                    key={asset.id}
                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={(e) => handleRowClick(e, asset.id)}
                  >
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{asset.assetCode}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                      <div className="text-xs text-gray-500">{asset.serialNumber}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{asset.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{asset.brand}</td>
                    <td className="px-4 py-3"><StatusBadge status={asset.status} /></td>
                    <td className="px-4 py-3"><HealthBadge score={asset.healthScore} /></td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {asset.assignments?.find(a => a.isActive)?.employee?.user?.name || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowQR(asset)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium bg-blue-50 px-2 py-1 rounded"
                        >
                          QR
                        </button>
                        <button
                          onClick={() => navigate(`/assets/${asset.id}`)}
                          className="text-gray-600 hover:text-gray-800 text-xs font-medium bg-gray-50 px-2 py-1 rounded"
                        >
                          Detail
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Click hint */}
        <p className="text-xs text-gray-400 mt-3 text-center">
          💡 Click any row to view full asset details
        </p>

      </div>
    </Layout>
  )
}