import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/common/Layout'
import axiosInstance from '../api/axiosInstance'

export default function Employees() {
  const navigate     = useNavigate()
  const [employees,  setEmployees]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [showForm,   setShowForm]   = useState(false)
  const [form,       setForm]       = useState({
    name: '', email: '', password: '',
    employeeCode: '', department: '',
    designation: '', phone: '', joinDate: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')
  const [success,    setSuccess]    = useState('')

  const fetchEmployees = () => {
    setLoading(true)
    axiosInstance.get(`/employees?search=${search}`)
      .then(res => setEmployees(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchEmployees() }, [search])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await axiosInstance.post('/employees', form)

       // Email notification
      await axiosInstance.post('/notifications', {
      title:      '👤 New Employee Added',
      message:    `${form.name} has joined the organization. Asset allocation required.`,
      type:       'INFO',
      targetRole: 'IT_MANAGER',
      sendMail:   true
     })

      setSuccess('Employee created successfully!')
      setShowForm(false)
      setForm({ name:'', email:'', password:'', employeeCode:'', department:'', designation:'', phone:'', joinDate:'' })
      fetchEmployees()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create employee')
    } finally {
      setSubmitting(false)
    }
  }

  const activeCount   = employees.filter(e => e.isActive).length
  const exitingCount  = employees.filter(e => e.exitDate && e.isActive).length
  const withAssets    = employees.filter(e => e.assignments?.length > 0).length

  return (
    <Layout>
      <div className="p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
            <p className="text-gray-500 text-sm mt-1">{employees.length} total employees</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + Add Employee
          </button>
        </div>

        {/* Success */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            ✅ {success}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total',          value: employees.length, color: 'text-gray-900'   },
            { label: 'Active',         value: activeCount,      color: 'text-green-600'  },
            { label: 'Exiting Soon',   value: exitingCount,     color: 'text-red-600'    },
            { label: 'With Assets',    value: withAssets,       color: 'text-blue-600'   },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-semibold mb-4">New Employee</h2>
            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              {[
                { key: 'name',         label: 'Full Name',     type: 'text',     placeholder: 'e.g. Rahul Sharma'     },
                { key: 'email',        label: 'Email',         type: 'email',    placeholder: 'rahul@company.com'     },
                { key: 'password',     label: 'Password',      type: 'password', placeholder: 'Min 6 characters'      },
                { key: 'employeeCode', label: 'Employee Code', type: 'text',     placeholder: 'e.g. EMP008'           },
                { key: 'department',   label: 'Department',    type: 'text',     placeholder: 'e.g. Engineering'      },
                { key: 'designation',  label: 'Designation',   type: 'text',     placeholder: 'e.g. Software Engineer' },
                { key: 'phone',        label: 'Phone',         type: 'text',     placeholder: 'e.g. 9876543210'       },
                { key: 'joinDate',     label: 'Join Date',     type: 'date',     placeholder: ''                      },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <input
                    type={field.type}
                    value={form[field.key]}
                    placeholder={field.placeholder}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              <div className="col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Employee'}
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

        {/* Search */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <input
            type="text"
            placeholder="Search by name, email, employee code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : employees.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No employees found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Code','Name','Department','Designation','Phone','Status','Assets','Exit'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {employees.map(emp => (
                  <tr
                    key={emp.id}
                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/employees/${emp.id}`)}
                  >
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{emp.employeeCode}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {emp.user?.name?.[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{emp.user?.name}</div>
                          <div className="text-xs text-gray-500">{emp.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emp.department}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emp.designation}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emp.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        emp.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {emp.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {emp.assignments?.length || 0} device(s)
                    </td>
                    <td className="px-4 py-3">
                      {emp.exitDate ? (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                          {new Date(emp.exitDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Click hint */}
        <p className="text-xs text-gray-400 mt-3 text-center">
          💡 Click any row to view full employee profile
        </p>

      </div>
    </Layout>
  )
}