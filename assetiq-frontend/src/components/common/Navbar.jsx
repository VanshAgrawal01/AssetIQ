import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import axiosInstance from '../../api/axiosInstance'

export default function Navbar() {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const searchRef   = useRef(null)

  const [notifications, setNotifications] = useState([])
  const [showDrop,      setShowDrop]      = useState(false)
  const [unreadCount,   setUnreadCount]   = useState(0)
  const [query,         setQuery]         = useState('')
  const [results,       setResults]       = useState(null)
  const [searching,     setSearching]     = useState(false)
  const [showResults,   setShowResults]   = useState(false)

  // Notifications
  const fetchNotifications = () => {
    axiosInstance.get('/notifications?isRead=false')
      .then(res => {
        setNotifications(res.data.data)
        setUnreadCount(res.data.data.length)
      })
      .catch(console.error)
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Global Search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults(null)
      setShowResults(false)
      return
    }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const [empRes, assetRes] = await Promise.all([
          axiosInstance.get(`/employees?search=${query}`),
          axiosInstance.get(`/assets?search=${query}`)
        ])
        setResults({
          employees: empRes.data.data.slice(0, 4),
          assets:    assetRes.data.data.slice(0, 4)
        })
        setShowResults(true)
      } catch (err) {
        console.error(err)
      } finally {
        setSearching(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false)
      }
      if (!e.target.closest('.notif-dropdown')) {
        setShowDrop(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markRead = async (id) => {
    await axiosInstance.put(`/notifications/${id}/read`)
    fetchNotifications()
  }

  const markAllRead = async () => {
    await axiosInstance.put('/notifications/read-all')
    fetchNotifications()
    setShowDrop(false)
  }

  const handleSelect = (type, id) => {
    setQuery('')
    setShowResults(false)
    navigate(type === 'employee' ? `/employees/${id}` : `/assets/${id}`)
  }

  return (
    <div className="h-14 bg-white border-b border-gray-100 flex items-center px-6 gap-4">

      {/* Global Search */}
      <div className="flex-1 max-w-lg relative" ref={searchRef}>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => results && setShowResults(true)}
            placeholder="Search employees, assets, serial numbers..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && results && (
          <div className="absolute top-11 left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">

            {/* Employees */}
            {results.employees.length > 0 && (
              <div>
                <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase bg-gray-50">
                  Employees ({results.employees.length})
                </p>
                {results.employees.map(emp => (
                  <div
                    key={emp.id}
                    onClick={() => handleSelect('employee', emp.id)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {emp.user?.name?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{emp.user?.name}</p>
                      <p className="text-xs text-gray-500">
                        {emp.employeeCode} • {emp.department}
                      </p>
                    </div>
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                      emp.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {emp.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Assets */}
            {results.assets.length > 0 && (
              <div>
                <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase bg-gray-50">
                  Assets ({results.assets.length})
                </p>
                {results.assets.map(asset => (
                  <div
                    key={asset.id}
                    onClick={() => handleSelect('asset', asset.id)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                      {asset.type === 'LAPTOP'   ? '💻' :
                       asset.type === 'PHONE'    ? '📱' :
                       asset.type === 'MONITOR'  ? '🖥️' :
                       asset.type === 'KEYBOARD' ? '⌨️' : '📦'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{asset.name}</p>
                      <p className="text-xs text-gray-500">
                        {asset.assetCode} • {asset.serialNumber}
                      </p>
                    </div>
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                      asset.status === 'AVAILABLE'    ? 'bg-green-100 text-green-700' :
                      asset.status === 'ASSIGNED'     ? 'bg-blue-100 text-blue-700' :
                      asset.status === 'UNDER_REPAIR' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {asset.status?.replace(/_/g,' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* No results */}
            {results.employees.length === 0 && results.assets.length === 0 && (
              <div className="p-6 text-center text-gray-500 text-sm">
                No results found for "{query}"
              </div>
            )}

            {/* View all */}
            {(results.employees.length > 0 || results.assets.length > 0) && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex gap-4">
                {results.employees.length > 0 && (
                  <button
                    onClick={() => { navigate(`/employees`); setQuery(''); setShowResults(false) }}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    View all employees →
                  </button>
                )}
                {results.assets.length > 0 && (
                  <button
                    onClick={() => { navigate(`/assets`); setQuery(''); setShowResults(false) }}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    View all assets →
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notifications Bell */}
      <div className="relative notif-dropdown">
        <button
          onClick={() => setShowDrop(!showDrop)}
          className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {showDrop && (
          <div className="notif-dropdown absolute right-0 top-12 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">Notifications</p>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-800">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">
                  <div className="text-2xl mb-2">🔔</div>
                  No new notifications
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                    onClick={() => markRead(n.id)}
                  >
                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* User info */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {user?.name?.[0]}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.role}</p>
        </div>
      </div>

    </div>
  )
}