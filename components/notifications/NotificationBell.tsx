"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, Check, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface NotificationBellProps {
  locale: "ar" | "en"
}

export function NotificationBell({ locale }: NotificationBellProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isRTL = locale === "ar"

  const t = {
    notifications: isRTL ? "الإشعارات" : "Notifications",
    noNotifications: isRTL ? "لا توجد إشعارات" : "No notifications",
    markAllRead: isRTL ? "تعليم الكل كمقروء" : "Mark all as read",
    deleteAll: isRTL ? "حذف الكل" : "Delete all",
    viewAll: isRTL ? "عرض الكل" : "View all",
  }

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications?limit=10")
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.data || data.notifications || [])
        setUnreadCount(data.stats?.unreadCount || data.unreadCount || 0)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  useEffect(() => {
    fetchNotifications()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)

    return () => clearInterval(interval)
  }, [])

  // Mark as read
  const markAsRead = async (notificationId: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      })

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true, read: true } : n
          )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Error marking as read:", error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      })

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true, read: true }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications?id=${notificationId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
        const wasUnread = notifications.find((n) => n.id === notificationId)?.isRead === false ||
                          notifications.find((n) => n.id === notificationId)?.read === false
        if (wasUnread) {
          setUnreadCount((prev) => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  // Delete all read
  const deleteAllRead = async () => {
    try {
      const res = await fetch("/api/notifications?deleteAll=true", {
        method: "DELETE",
      })

      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => !n.isRead && !n.read))
      }
    } catch (error) {
      console.error("Error deleting all:", error)
    }
  }

  // Handle notification click
  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead && !notification.read) {
      markAsRead(notification.id)
    }

    if (notification.link) {
      router.push(notification.link)
      setIsOpen(false)
    }
  }

  // Format date
  const formatDate = (date: string) => {
    const notificationDate = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - notificationDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return isRTL ? "الآن" : "Now"
    if (diffMins < 60)
      return isRTL ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`
    if (diffHours < 24)
      return isRTL ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`
    if (diffDays < 7)
      return isRTL ? `منذ ${diffDays} يوم` : `${diffDays}d ago`

    return notificationDate.toLocaleDateString(isRTL ? "ar-SA" : "en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0"
        align={isRTL ? "start" : "end"}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">{t.notifications}</h3>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-8 text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                {t.markAllRead}
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2" />
              <p className="text-sm">{t.noNotifications}</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const isUnread = !notification.isRead && !notification.read
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer group ${
                      isUnread ? "bg-blue-50 dark:bg-blue-950/20" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {isUnread && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                          )}
                          <p className="font-medium text-sm truncate">
                            {isRTL
                              ? notification.titleAr
                              : notification.titleEn}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {isRTL
                            ? notification.messageAr
                            : notification.messageEn}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => {
                  router.push(`/${locale}/notifications`)
                  setIsOpen(false)
                }}
              >
                {t.viewAll}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-red-500"
                onClick={deleteAllRead}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {t.deleteAll}
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
