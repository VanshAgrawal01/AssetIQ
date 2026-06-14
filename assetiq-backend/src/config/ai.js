const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const callClaude = async (systemPrompt, userMessage) => {
  try {
    const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash'
})

    const fullPrompt = `${systemPrompt}\n\nUser Question: ${userMessage}`

    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()

    console.log('Gemini response received')
    return text

  } catch (err) {
    console.error('Gemini error:', err.message)
    throw err
  }
}

module.exports = { callClaude }