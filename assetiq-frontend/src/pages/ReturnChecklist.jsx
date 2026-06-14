import { useState, useEffect } from 'react'
import Layout from '../components/common/Layout'
import axiosInstance from '../api/axiosInstance'

export default function ReturnChecklist() {
  const [employees, setEmployees] = useState([])
  const [selected,  setSelected]  = useState(null)
  const [checklist, setChecklist] = useState([])
  const [loading,   setLoading]   = useState(false)
  const [success,   setSuccess]   = useState('')
  const [error,     setError]     = useState('')

  useEffect(() => {
    // Fetch employees with exit date set
    axiosInstance.get('/employees?isActive=true')
      .then(res => {
        const exiting = res.data.data.filter(e => e.exitDate)
        setEmployees(exiting)
      })
      .catch(console.error)
  }, [])

  const loadChecklist = async (emp) => {
    setSelected(emp)
    setLoading(true)
    try {
      const res = await axiosInstance.get(`/employees/${emp.id}`)
      const activeAssignments = res.data.data.assignments?.filter(a => a.isActive) || []
      setChecklist(activeAssignments)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleReturn = async (assignmentId, assetName) => {
    try {
      await axiosInstance.post('/assignments/return', {
        assignmentId,
        condition: 'GOOD'
      })

      // Email notification
      await axiosInstance.post('/notifications', {
      title:      '✅ Asset Returned',
      message:    `${assetName} has been returned by ${selected?.user?.name}`,
      type:       'INFO',
      targetRole: 'ADMIN',
      sendMail:   true
      })
      
      setSuccess(`${assetName} returned successfully!`)
      setTimeout(() => setSuccess(''), 3000)
      loadChecklist(selected)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to return')
      setTimeout(() => setError(''), 3000)
    }
  }

  const getDaysLeft = (exitDate) => {
    const diff = new Date(exitDate) - new Date()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <Layout>
      <div className="p-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Return Checklist</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage asset returns for exiting employees
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

        <div className="grid grid-cols-3 gap-6">

          {/* Left — Exiting Employees */}
          <div className="col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700">
                  Exiting Employees ({employees.length})
                </p>
              </div>
              {employees.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">
                  <div className="text-3xl mb-2">✅</div>
                  No employees with exit date set
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {employees.map(emp => {
                    const daysLeft = getDaysLeft(emp.exitDate)
                    return (
                      <div
                        key={emp.id}
                        onClick={() => loadChecklist(emp)}
                        className={`p-4 cursor-pointer hover:bg-blue-50 transition ${
                          selected?.id === emp.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {emp.user?.name?.[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {emp.user?.name}
                            </p>
                            <p className="text-xs text-gray-500">{emp.employeeCode}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Exit: {new Date(emp.exitDate).toDateString()}
                          </span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            daysLeft <= 1 ? 'bg-red-100 text-red-700' :
                            daysLeft <= 3 ? 'bg-orange-100 text-orange-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {daysLeft <= 0 ? 'Overdue!' : `${daysLeft}d left`}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right — Checklist */}
          <div className="col-span-2">
            {!selected ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="text-5xl mb-4">📋</div>
                <p className="text-gray-500">Select an employee to view their return checklist</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Employee Header */}
                <div className="px-6 py-4 bg-red-50 border-b border-red-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{selected.user?.name}</p>
                      <p className="text-sm text-gray-500">
                        {selected.department} • Exit: {new Date(selected.exitDate).toDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">
                        {checklist.length} asset(s) pending
                      </p>
                      {checklist.length === 0 && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          All returned ✅
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Checklist Items */}
                <div className="p-6">
                  {loading ? (
                    <p className="text-center text-gray-500 py-8">Loading...</p>
                  ) : checklist.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-4">🎉</div>
                      <p className="text-green-600 font-semibold">All assets returned!</p>
                      <p className="text-gray-500 text-sm mt-1">
                        Clearance certificate can be generated
                      </p>
                      <button
                        onClick={() => window.location.href = `/employees/${selected.id}`}
                        className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium"
                      >
                        View Employee Profile
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500 mb-4">
                        Check off each asset as it is returned:
                      </p>
                      {checklist.map(assignment => (
                        <div
                          key={assignment.id}
                          className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition"
                        >
                          {/* Asset Icon */}
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-xl">
                              {assignment.asset?.type === 'LAPTOP'   ? '💻' :
                               assignment.asset?.type === 'PHONE'    ? '📱' :
                               assignment.asset?.type === 'MONITOR'  ? '🖥️' :
                               assignment.asset?.type === 'KEYBOARD' ? '⌨️' :
                               assignment.asset?.type === 'MOUSE'    ? '🖱️' : '📦'}
                            </span>
                          </div>

                          {/* Asset Info */}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{assignment.asset?.name}</p>
                            <p className="text-sm text-gray-500">
                              {assignment.asset?.assetCode} • {assignment.asset?.type}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Serial: {assignment.asset?.serialNumber}
                            </p>
                            <p className="text-xs text-gray-400">
                              Assigned: {new Date(assignment.assignedDate).toDateString()}
                            </p>
                          </div>

                          {/* Status + Action */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                              Pending
                            </span>
                            <button
                              onClick={() => handleReturn(assignment.id, assignment.asset?.name)}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                            >
                              ✓ Mark Returned
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Progress */}
                      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Return Progress</span>
                          <span className="text-sm font-medium text-gray-900">
                            {checklist.length} remaining
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{ width: '0%' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}