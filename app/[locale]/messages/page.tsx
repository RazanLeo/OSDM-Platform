"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send, Search, MessageCircle } from "lucide-react"
import { useParams } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { ar, enUS } from "date-fns/locale"

function MessagesPageContent() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const params = useParams<{ locale: string }>()
  const searchParams = useSearchParams()
  const locale = params?.locale || "ar"
  const isArabic = locale === "ar"

  const [loading, setLoading] = useState(true)
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [messageText, setMessageText] = useState("")
  const [sending, setSending] = useState(false)

  // Redirect if not authenticated
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push(`/${locale}/auth/login?callbackUrl=/${locale}/messages`)
    return null
  }

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/messages/conversations")
        const data = await response.json()

        if (data.success) {
          setConversations(data.data)

          // Auto-select first conversation or from query param
          const sellerParam = searchParams.get("seller")
          const clientParam = searchParams.get("client")

          if (sellerParam || clientParam) {
            // Find or create conversation with this user
            const targetUser = sellerParam || clientParam
            const existingConv = data.data.find(
              (conv: any) =>
                conv.otherUser.username === targetUser
            )

            if (existingConv) {
              setSelectedConversation(existingConv)
              fetchMessages(existingConv.otherUser.id)
            }
          } else if (data.data.length > 0) {
            setSelectedConversation(data.data[0])
            fetchMessages(data.data[0].otherUser.id)
          }
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error)
      } finally {
        setLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchConversations()
    }
  }, [status, searchParams])

  const fetchMessages = async (userId: string) => {
    try {
      const response = await fetch(`/api/messages/${userId}`)
      const data = await response.json()

      if (data.success) {
        setMessages(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    }
  }

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return

    setSending(true)
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId: selectedConversation.otherUser.id,
          content: messageText,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessages([...messages, data.data])
        setMessageText("")
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setSending(false)
    }
  }

  const handleConversationSelect = (conversation: any) => {
    setSelectedConversation(conversation)
    fetchMessages(conversation.otherUser.id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isArabic ? "الرسائل" : "Messages"}
        </h1>
        <p className="text-muted-foreground">
          {isArabic ? "تواصل مع البائعين والعملاء" : "Communicate with sellers and clients"}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{isArabic ? "المحادثات" : "Conversations"}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={isArabic ? "بحث..." : "Search..."}
                  className="pl-10"
                />
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-350px)]">
              {conversations.length > 0 ? (
                <div className="space-y-1">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.otherUser.id}
                      onClick={() => handleConversationSelect(conversation)}
                      className={`w-full text-left p-4 hover:bg-muted transition-colors ${
                        selectedConversation?.otherUser.id === conversation.otherUser.id
                          ? "bg-muted"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={conversation.otherUser.avatar || undefined} />
                          <AvatarFallback>
                            {conversation.otherUser.fullName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold truncate">
                              {conversation.otherUser.fullName}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage?.content || (isArabic ? "لا توجد رسائل" : "No messages")}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {conversation.lastMessage &&
                              formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                                addSuffix: true,
                                locale: isArabic ? ar : enUS,
                              })}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {isArabic ? "لا توجد محادثات بعد" : "No conversations yet"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {isArabic
                      ? "ابدأ بالتواصل مع البائعين من صفحات المنتجات"
                      : "Start communicating with sellers from product pages"}
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Messages Area */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedConversation.otherUser.avatar || undefined} />
                    <AvatarFallback>
                      {selectedConversation.otherUser.fullName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {selectedConversation.otherUser.fullName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      @{selectedConversation.otherUser.username}
                    </p>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-[calc(100vh-450px)] p-4">
                  <div className="space-y-4">
                    {messages.length > 0 ? (
                      messages.map((message) => {
                        const isOwnMessage = message.senderId === session?.user?.id
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isOwnMessage
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {formatDistanceToNow(new Date(message.createdAt), {
                                  addSuffix: true,
                                  locale: isArabic ? ar : enUS,
                                })}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="flex items-center justify-center h-64 text-center">
                        <p className="text-muted-foreground">
                          {isArabic ? "لا توجد رسائل" : "No messages"}
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Message Input */}
              <Separator />
              <div className="p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    sendMessage()
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={isArabic ? "اكتب رسالتك..." : "Type your message..."}
                    disabled={sending}
                  />
                  <Button type="submit" disabled={sending || !messageText.trim()}>
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {isArabic ? "اختر محادثة للبدء" : "Select a conversation to start"}
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}


export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <MessagesPageContent />
    </Suspense>
  )
}
