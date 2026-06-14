import { useState, useEffect } from 'react'
import Layout from '../components/common/Layout'
import axiosInstance from '../api/axiosInstance'

const actionColors = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  ASSIGN: 'bg-purple-100 text-purple-700',
  RETURN: 'bg-yellow-100 text-yellow-700',
  REVIEW: 'bg-orange-100 text-orange-700',
}

export default function AuditLogs() {
  const [logs,    setLogs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('')

  useEffect(() => {
    setLoading(true)
    axiosInstance.get(`/audit?entity=${filter}&limit=100`)
      .then(res => setLogs(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [filter])

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-500 text-sm mt-1">Complete action history</p>
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Entities</option>
            {['Employee','Asset','Assignment','DamageReport','Supplier'].map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No logs found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Action','Entity','Details','Performed By','Time'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${actionColors[log.action] || 'bg-gray-100 text-gray-700'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{log.entity}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs">
                      {log.newValue ? (
                        <code className="bg-gray-50 px-1 py-0.5 rounded text-xs">
                          {Object.entries(log.newValue).slice(0,2).map(([k,v]) => `${k}: ${v}`).join(', ')}
                        </code>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{log.user?.name}</div>
                      <div className="text-xs text-gray-500">{log.user?.role}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
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