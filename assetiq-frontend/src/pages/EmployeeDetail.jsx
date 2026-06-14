import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/common/Layout'
import axiosInstance from '../api/axiosInstance'
import { useAuth } from '../context/AuthContext'

export default function EmployeeDetail() {
  const { id }          = useParams()
  const navigate        = useNavigate()
  const { user }        = useAuth()
  const [employee,      setEmployee]      = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [showExitForm,  setShowExitForm]  = useState(false)
  const [showReturnForm,setShowReturnForm]= useState(false)
  const [exitDate,      setExitDate]      = useState('')
  const [returning,     setReturning]     = useState(null)
  const [submitting,    setSubmitting]    = useState(false)
  const [success,       setSuccess]       = useState('')
  const [error,         setError]         = useState('')

  const fetchEmployee = () => {
    axiosInstance.get(`/employees/${id}`)
      .then(res => setEmployee(res.data.data))
      .catch(() => navigate('/employees'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchEmployee() }, [id])

  const handleExitDate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await axiosInstance.put(`/employees/${id}`, { exitDate })
      setSuccess('Exit date set! Return checklist generated.')
      setShowExitForm(false)
      fetchEmployee()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set exit date')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReturn = async (assignmentId) => {
    setSubmitting(true)
    setError('')
    try {
      const res = await axiosInstance.post('/assignments/return', {
        assignmentId,
        condition: 'GOOD'
      })
      const data = res.data.data
      if (data.clearanceGenerated) {
        setSuccess('✅ All assets returned! Clearance certificate generated.')
      } else {
        setSuccess('Asset returned successfully!')
      }
      fetchEmployee()
      setReturning(null)
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to return asset')
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

  if (!employee) return null

  const activeAssignments = employee.assignments?.filter(a => a.isActive) || []
  const pastAssignments   = employee.assignments?.filter(a => !a.isActive) || []
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'IT_MANAGER'

  return (
    <Layout>
      <div className="p-8 max-w-6xl">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/employees')}
            className="text-gray-500 hover:text-gray-700 text-sm">
            ← Back
          </button>
          <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            {employee.user?.name?.[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{employee.user?.name}</h1>
            <p className="text-gray-500 text-sm">{employee.employeeCode} • {employee.department} • {employee.designation}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            employee.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {employee.isActive ? 'Active' : 'Exited'}
          </span>
        </div>

        {/* Success / Error */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">

          {/* Left */}
          <div className="col-span-2 space-y-6">

            {/* Employee Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Employee Information</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Full Name',    value: employee.user?.name },
                  { label: 'Email',        value: employee.user?.email },
                  { label: 'Department',   value: employee.department },
                  { label: 'Designation',  value: employee.designation },
                  { label: 'Phone',        value: employee.phone || '—' },
                  { label: 'Join Date',    value: new Date(employee.joinDate).toDateString() },
                  { label: 'Exit Date',    value: employee.exitDate ? new Date(employee.exitDate).toDateString() : 'Not set' },
                  { label: 'Role',         value: employee.user?.role },
                ].map(item => (
                  <div key={item.label}>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</span>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Assignments */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Current Assets ({activeAssignments.length})
                </h2>
                {isAdmin && employee.isActive && !employee.exitDate && (
                  <button
                    onClick={() => setShowExitForm(!showExitForm)}
                    className="text-sm bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg"
                  >
                    Set Exit Date
                  </button>
                )}
              </div>

              {/* Exit Date Form */}
              {showExitForm && (
                <form onSubmit={handleExitDate} className="mb-4 p-4 bg-red-50 rounded-xl">
                  <p className="text-sm text-red-700 mb-3 font-medium">
                    ⚠️ Setting exit date will generate return checklist
                  </p>
                  <div className="flex gap-3">
                    <input
                      type="date"
                      value={exitDate}
                      onChange={e => setExitDate(e.target.value)}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="flex-1 px-3 py-2 border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <button type="submit" disabled={submitting}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">
                      {submitting ? 'Setting...' : 'Confirm'}
                    </button>
                    <button type="button" onClick={() => setShowExitForm(false)}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {activeAssignments.length === 0 ? (
                <p className="text-gray-500 text-sm">No assets currently assigned</p>
              ) : (
                <div className="space-y-3">
                  {activeAssignments.map(a => (
                    <div key={a.id} className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{a.asset?.name}</p>
                        <p className="text-sm text-gray-500">
                          {a.asset?.assetCode} • {a.asset?.type}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Assigned: {new Date(a.assignedDate).toDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                       {a.receiptUrl && (
                     <a
                    href={`http://localhost:5000${a.receiptUrl}`}
                     target="_blank"
                     rel="noreferrer"
                    className="text-blue-600 text-xs hover:underline"
                       >
                     📄 Receipt
                     </a>
                       )}
                        {isAdmin && (
                          <button
                            onClick={() => setReturning(a)}
                            className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-medium"
                          >
                            Return
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/assets/${a.asset?.id}`)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Return Confirm Modal */}
            {returning && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
                  <h3 className="text-lg font-bold mb-2">Confirm Return</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Are you sure you want to mark <b>{returning.asset?.name}</b> as returned by <b>{employee.user?.name}</b>?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReturn(returning.id)}
                      disabled={submitting}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      {submitting ? 'Processing...' : 'Confirm Return'}
                    </button>
                    <button
                      onClick={() => setReturning(null)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Past Assignments */}
            {pastAssignments.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4">
                  Past Assignments ({pastAssignments.length})
                </h2>
                <div className="space-y-2">
                  {pastAssignments.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{a.asset?.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(a.assignedDate).toDateString()}
                          {a.returnedDate && ` → ${new Date(a.returnedDate).toDateString()}`}
                        </p>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        Returned
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Damage Reports */}
            {employee.damageReports?.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4">
                  Damage Reports ({employee.damageReports.length})
                </h2>
                <div className="space-y-2">
                  {employee.damageReports.map(d => (
                    <div key={d.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{d.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          d.status === 'RESOLVED'     ? 'bg-green-100 text-green-700' :
                          d.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>{d.status}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(d.createdAt).toDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right — Quick Stats */}
          <div className="space-y-4">

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-sm font-medium text-gray-500 mb-4">Quick Stats</h2>
              <div className="space-y-3">
                {[
                  { label: 'Current Assets', value: activeAssignments.length, color: 'text-blue-600' },
                  { label: 'Past Assets',     value: pastAssignments.length,   color: 'text-gray-600' },
                  { label: 'Damage Reports',  value: employee.damageReports?.length || 0, color: 'text-red-600' },
                  { label: 'Asset Requests',  value: employee.assetRequests?.length || 0, color: 'text-purple-600' },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{stat.label}</span>
                    <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Exit Status */}
            <div className={`rounded-xl p-6 shadow-sm border ${
              employee.exitDate
                ? 'bg-red-50 border-red-100'
                : 'bg-green-50 border-green-100'
            }`}>
              <h2 className="text-sm font-medium mb-3 text-gray-700">Exit Status</h2>
              {employee.exitDate ? (
                <>
                  <p className="text-red-600 font-semibold text-sm">Exit Scheduled</p>
                  <p className="text-red-500 text-xs mt-1">
                    {new Date(employee.exitDate).toDateString()}
                  </p>
                  {activeAssignments.length > 0 && (
                    <p className="text-red-600 text-xs mt-2 font-medium">
                      ⚠️ {activeAssignments.length} asset(s) pending return
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-green-600 font-semibold text-sm">Active Employee</p>
                  <p className="text-green-500 text-xs mt-1">No exit scheduled</p>
                </>
              )}
            </div>

            {/* Asset Requests */}
            {employee.assetRequests?.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-sm font-medium text-gray-500 mb-3">Asset Requests</h2>
                <div className="space-y-2">
                  {employee.assetRequests.map(req => (
                    <div key={req.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{req.assetType}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        req.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{req.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </Layout>
  )
}