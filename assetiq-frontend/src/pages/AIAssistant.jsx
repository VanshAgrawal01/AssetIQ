import { useState } from 'react'
import Layout from '../components/common/Layout'
import axiosInstance from '../api/axiosInstance'

const suggestions = [
  'Which assets are currently under repair?',
  'How many assets are available to assign?',
  'Who has not returned their device?',
  'Show all open damage reports',
  'Which laptops have low health score?',
]

export default function AIAssistant() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading,  setLoading]  = useState(false)

  const handleAsk = async (q) => {
    const query = q || question
    if (!query.trim()) return

    setMessages(prev => [...prev, { role: 'user', text: query }])
    setQuestion('')
    setLoading(true)

    try {
      const res = await axiosInstance.post('/ai/ask', { question: query })
      setMessages(prev => [...prev, { role: 'ai', text: res.data.data.answer }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="p-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
          <p className="text-gray-500 text-sm mt-1">Ask anything about your assets and employees</p>
        </div>

        {/* Suggestions */}
        {messages.length === 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-3">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map(s => (
                <button key={s} onClick={() => handleAsk(s)}
                  className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full transition">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 min-h-64 max-h-96 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">🤖</div>
                <p className="text-sm">Ask me anything about AssetIQ data</p>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xl px-4 py-3 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}>
                  {msg.role === 'ai' && <span className="mr-2">🤖</span>}
                  {msg.text}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-500 px-4 py-3 rounded-2xl rounded-bl-none text-sm">
                🤖 Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-3">
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAsk()}
            placeholder="Ask about assets, employees, damage reports..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={() => handleAsk()}
            disabled={loading || !question.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium disabled:opacity-50">
            Ask
          </button>
        </div>
      </div>
    </Layout>
  )
}