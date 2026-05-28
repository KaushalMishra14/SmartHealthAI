import { useState } from "react"
import { sendChatMessage } from "../services/api"

function Chatbot() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello 👋 I am your AI Health Assistant. Ask me anything."
    }
  ])
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!message.trim()) return

    const userMessage = {
      sender: "user",
      text: message
    }

    setMessages((prev) => [...prev, userMessage])
    setMessage("")
    setLoading(true)

    try {
      const data = await sendChatMessage(message)

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: data.reply
          }
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Sorry, I could not answer right now."
          }
        ])
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Backend connection failed. Please check if server is running."
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 mt-8 w-full max-w-4xl">

      <h2 className="text-2xl font-bold mb-5">
        AI Health Assistant
      </h2>

      <div className="h-80 overflow-y-auto border rounded-xl p-4 bg-gray-50">

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-md px-4 py-2 rounded-xl whitespace-pre-line ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-gray-500">
            AI is thinking...
          </div>
        )}

      </div>

      <div className="flex gap-3 mt-5">

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage()
            }
          }}
          placeholder="Ask health questions..."
          className="flex-1 border rounded-xl px-4 py-3"
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 rounded-xl"
        >
          Send
        </button>

      </div>

      <p className="text-xs text-gray-500 mt-4">
        Disclaimer: This AI assistant provides educational guidance only and is not a substitute for medical advice.
      </p>

    </div>
  )
}

export default Chatbot