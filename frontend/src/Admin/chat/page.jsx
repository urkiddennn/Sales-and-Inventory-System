"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Send } from "lucide-react"

export default function ChatPage() {
  const [message, setMessage] = useState("")

  // This would be fetched from an API in a real application
  const conversations = [
    { id: 1, name: "John Doe", avatar: "/placeholder.svg?height=40&width=40", unread: 3 },
    { id: 2, name: "Jane Smith", avatar: "/placeholder.svg?height=40&width=40", unread: 0 },
    { id: 3, name: "Robert Johnson", avatar: "/placeholder.svg?height=40&width=40", unread: 1 },
    { id: 4, name: "Emily Davis", avatar: "/placeholder.svg?height=40&width=40", unread: 0 },
    { id: 5, name: "Michael Brown", avatar: "/placeholder.svg?height=40&width=40", unread: 0 },
  ]

  const messages = [
    {
      id: 1,
      sender: "John Doe",
      content: "Hello, I have a question about my order #ORD-001",
      time: "10:30 AM",
      isMe: false,
    },
    {
      id: 2,
      sender: "Me",
      content: "Hi John, I'd be happy to help. What's your question?",
      time: "10:32 AM",
      isMe: true,
    },
    { id: 3, sender: "John Doe", content: "I was wondering when it will be shipped?", time: "10:33 AM", isMe: false },
    {
      id: 4,
      sender: "Me",
      content: "Let me check that for you. Your order has been processed and will be shipped tomorrow.",
      time: "10:35 AM",
      isMe: true,
    },
    { id: 5, sender: "John Doe", content: "Great, thank you for the quick response!", time: "10:36 AM", isMe: false },
  ]

  const handleSendMessage = (e) => {
    e.preventDefault()
    // In a real app, this would send the message to an API
    console.log("Sending message:", message)
    setMessage("")
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Chat</h1>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Conversation List */}
        <Card className="w-64 flex-shrink-0">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <div key={conversation.id} className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer">
                  <Avatar>
                    <img src={conversation.avatar || "/placeholder.svg"} alt={conversation.name} />
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{conversation.name}</p>
                      {conversation.unread > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center bg-blue-600 text-xs text-white">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Avatar>
                <img src="/placeholder.svg?height=40&width=40" alt="John Doe" />
              </Avatar>
              <CardTitle>John Doe</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-4 py-2 ${
                    msg.isMe ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div className="flex flex-col">
                    <p>{msg.content}</p>
                    <span className={`text-xs mt-1 ${msg.isMe ? "text-blue-100" : "text-gray-500"}`}>{msg.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
