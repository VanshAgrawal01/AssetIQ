import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'

const HealthBadge = ({ score }) => {
  const color = score >= 80 ? 'bg-green-100 text-green-700'
              : score >= 40 ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
  return <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>{score}/100</span>
}

export default function AssetScan() {
  const { code } = useParams()
  const [asset,   setAsset]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    axiosInstance.get(`/assets/scan/${code}`)
      .then(res => setAsset(res.data.data))
      .catch(() => setError('Asset not found'))
      .finally(() => setLoading(false))
  }, [code])

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Loading asset details...</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 text-center">
        <div className="text-4xl mb-4">❌</div>
        <p className="text-gray-700 font-medium">{error}</p>
      </div>
    </div>
  )

  const currentAssignment = asset?.assignments?.[0]

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900">AssetIQ</h1>
              <p className="text-gray-500 text-sm">Asset Details</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-1">{asset.name}</h2>
          <p className="text-gray-500 text-sm">{asset.assetCode}</p>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <h3 className="font-semibold text-gray-900 mb-4">Asset Information</h3>
          <div className="space-y-3">
            {[
              { label: 'Type',          value: asset.type },
              { label: 'Brand',         value: asset.brand },
              { label: 'Model',         value: asset.model },
              { label: 'Serial Number', value: asset.serialNumber },
              { label: 'Condition',     value: asset.condition },
              { label: 'Warranty',      value: new Date(asset.warrantyExpiry).toDateString() },
            ].map(item => (
              <div key={item.label} className="flex justify-between">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Health Score</span>
              <HealthBadge score={asset.healthScore} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Status</span>
              <span className="text-sm font-medium text-blue-600">{asset.status?.replace('_',' ')}</span>
            </div>
          </div>
        </div>

        {/* Current Assignment */}
        {currentAssignment && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
            <h3 className="font-semibold text-gray-900 mb-4">Currently Assigned To</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Employee</span>
                <span className="text-sm font-medium text-gray-900">
                  {currentAssignment.employee?.user?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Department</span>
                <span className="text-sm font-medium text-gray-900">
                  {currentAssignment.employee?.department}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Since</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(currentAssignment.assignedDate).toDateString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Damage History */}
        {asset.damageReports?.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">
              Damage History ({asset.damageReports.length})
            </h3>
            <div className="space-y-3">
              {asset.damageReports.map(d => (
                <div key={d.id} className="border border-gray-100 rounded-lg p-3">
                  <p className="text-sm text-gray-700">{d.description}</p>
                  <div className="flex justify-between mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      d.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                      d.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>{d.status}</span>
                    {d.repairCost && <span className="text-xs text-gray-500">₹{d.repairCost}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-4">Powered by AssetIQ</p>
      </div>
    </div>
  )
}