"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Upload, Send, CheckCircle, XCircle, FileText, Download, Clock } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface Delivery {
  id: string
  message: string
  files: string[]
  deliveredAt: string
  isAccepted: boolean | null
  feedback: string | null
  respondedAt: string | null
  revisionNumber: number
  User: {
    id: string
    username: string
    fullName: string
    avatar: string | null
  }
}

interface OrderDeliverySystemProps {
  orderId: string
  orderStatus: string
  isSeller: boolean
  isBuyer: boolean
  isArabic: boolean
  revisionsRemaining: number
  onDeliveryComplete?: () => void
}

export function OrderDeliverySystem({
  orderId,
  orderStatus,
  isSeller,
  isBuyer,
  isArabic,
  revisionsRemaining,
  onDeliveryComplete
}: OrderDeliverySystemProps) {
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [deliveries, setDeliveries] = useState<Delivery[]>([])

  // Delivery form state
  const [deliveryMessage, setDeliveryMessage] = useState("")
  const [deliveryFiles, setDeliveryFiles] = useState<string[]>([])
  const [newFileUrl, setNewFileUrl] = useState("")

  // Response form state
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null)
  const [responseFeedback, setResponseFeedback] = useState("")

  useEffect(() => {
    loadDeliveries()
  }, [orderId])

  const loadDeliveries = async () => {
    setLoadingData(true)
    try {
      const response = await fetch(`/api/service-orders/${orderId}/deliver`)
      const data = await response.json()

      if (response.ok) {
        setDeliveries(data.deliveries || [])
      }
    } catch (error) {
      console.error("Error loading deliveries:", error)
    } finally {
      setLoadingData(false)
    }
  }

  const addFileUrl = () => {
    if (!newFileUrl.trim()) return
    setDeliveryFiles([...deliveryFiles, newFileUrl.trim()])
    setNewFileUrl("")
  }

  const removeFile = (index: number) => {
    setDeliveryFiles(deliveryFiles.filter((_, i) => i !== index))
  }

  const submitDelivery = async () => {
    if (!deliveryMessage.trim()) {
      toast.error(isArabic ? "رسالة التسليم مطلوبة" : "Delivery message required")
      return
    }

    if (deliveryFiles.length === 0) {
      toast.error(isArabic ? "يجب إرفاق ملف واحد على الأقل" : "At least one file required")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/service-orders/${orderId}/deliver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: deliveryMessage,
          files: deliveryFiles,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit delivery")
      }

      toast.success(isArabic ? "تم تسليم العمل بنجاح" : "Work delivered successfully")
      setDeliveryMessage("")
      setDeliveryFiles([])
      await loadDeliveries()
      if (onDeliveryComplete) onDeliveryComplete()
    } catch (error: any) {
      toast.error(error.message || (isArabic ? "فشل التسليم" : "Delivery failed"))
    } finally {
      setLoading(false)
    }
  }

  const respondToDelivery = async (deliveryId: string, isAccepted: boolean) => {
    if (!responseFeedback.trim()) {
      toast.error(isArabic ? "الملاحظات مطلوبة" : "Feedback required")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/service-orders/${orderId}/deliver/${deliveryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isAccepted,
          feedback: responseFeedback,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to respond")
      }

      toast.success(
        isArabic
          ? isAccepted
            ? "تم قبول التسليم"
            : "تم طلب تعديل"
          : isAccepted
          ? "Delivery accepted"
          : "Revision requested"
      )
      setResponseFeedback("")
      setSelectedDelivery(null)
      await loadDeliveries()
      if (onDeliveryComplete) onDeliveryComplete()
    } catch (error: any) {
      toast.error(error.message || (isArabic ? "فشل الرد" : "Response failed"))
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">{isArabic ? "جاري التحميل..." : "Loading..."}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Seller: Submit Delivery */}
      {isSeller && (orderStatus === "IN_PROGRESS" || orderStatus === "REVISION_REQUESTED") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-purple-600" />
              {isArabic ? "تسليم العمل - Fiverr Delivery System" : "Submit Delivery - Fiverr Style"}
            </CardTitle>
            <CardDescription>
              {isArabic
                ? "قم بتحميل الملفات النهائية وكتابة رسالة للعميل"
                : "Upload final files and write a message to the client"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{isArabic ? "رسالة التسليم" : "Delivery Message"}</Label>
              <Textarea
                value={deliveryMessage}
                onChange={(e) => setDeliveryMessage(e.target.value)}
                placeholder={
                  isArabic
                    ? "اشرح ما تم إنجازه في هذا التسليم..."
                    : "Explain what has been completed in this delivery..."
                }
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>{isArabic ? "ملفات التسليم" : "Delivery Files"}</Label>
              <div className="flex gap-2">
                <Input
                  value={newFileUrl}
                  onChange={(e) => setNewFileUrl(e.target.value)}
                  placeholder={isArabic ? "رابط الملف (Google Drive, Dropbox...)" : "File URL (Google Drive, Dropbox...)"}
                />
                <Button onClick={addFileUrl} type="button" variant="outline">
                  {isArabic ? "إضافة" : "Add"}
                </Button>
              </div>

              {deliveryFiles.length > 0 && (
                <div className="space-y-2 mt-3">
                  {deliveryFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="flex-1 text-sm truncate">{file}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                        <XCircle className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={submitDelivery} disabled={loading} className="w-full gap-2">
              <Send className="h-4 w-4" />
              {isArabic ? "تسليم العمل" : "Submit Delivery"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Deliveries History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            {isArabic ? "سجل التسليمات والمراجعات" : "Delivery & Revision History"}
          </CardTitle>
          <CardDescription>
            {isArabic ? `التعديلات المتبقية: ${revisionsRemaining}` : `Revisions remaining: ${revisionsRemaining}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deliveries.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              {isArabic ? "لا توجد تسليمات بعد" : "No deliveries yet"}
            </p>
          ) : (
            <div className="space-y-4">
              {deliveries.map((delivery) => (
                <div key={delivery.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-purple-600 font-bold">
                          {delivery.User.fullName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{delivery.User.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {isArabic ? "التسليم رقم" : "Delivery"} #{delivery.revisionNumber + 1} •{" "}
                          {format(new Date(delivery.deliveredAt), "PPp")}
                        </p>
                      </div>
                    </div>

                    {delivery.isAccepted === true && (
                      <Badge className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {isArabic ? "مقبول" : "Accepted"}
                      </Badge>
                    )}
                    {delivery.isAccepted === false && (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        {isArabic ? "مرفوض - تعديل مطلوب" : "Revision Requested"}
                      </Badge>
                    )}
                    {delivery.isAccepted === null && (
                      <Badge variant="outline" className="text-yellow-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {isArabic ? "بانتظار المراجعة" : "Pending Review"}
                      </Badge>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {isArabic ? "رسالة التسليم:" : "Delivery Message:"}
                    </p>
                    <p className="text-sm">{delivery.message}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {isArabic ? "الملفات:" : "Files:"}
                    </p>
                    <div className="space-y-1">
                      {delivery.files.map((file, index) => (
                        <a
                          key={index}
                          href={file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                        >
                          <Download className="h-3 w-3" />
                          {isArabic ? `ملف ${index + 1}` : `File ${index + 1}`}
                        </a>
                      ))}
                    </div>
                  </div>

                  {delivery.feedback && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {isArabic ? "ملاحظات المشتري:" : "Buyer Feedback:"}
                        </p>
                        <p className="text-sm bg-muted p-3 rounded">{delivery.feedback}</p>
                      </div>
                    </>
                  )}

                  {/* Buyer Response Section */}
                  {isBuyer && delivery.isAccepted === null && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <Label>{isArabic ? "ملاحظاتك" : "Your Feedback"}</Label>
                        <Textarea
                          value={selectedDelivery === delivery.id ? responseFeedback : ""}
                          onChange={(e) => {
                            setSelectedDelivery(delivery.id)
                            setResponseFeedback(e.target.value)
                          }}
                          placeholder={
                            isArabic
                              ? "اكتب ملاحظاتك هنا..."
                              : "Write your feedback here..."
                          }
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => respondToDelivery(delivery.id, true)}
                            disabled={loading || !responseFeedback.trim()}
                            className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            {isArabic ? "قبول التسليم" : "Accept Delivery"}
                          </Button>
                          <Button
                            onClick={() => respondToDelivery(delivery.id, false)}
                            disabled={loading || !responseFeedback.trim() || revisionsRemaining <= 0}
                            variant="outline"
                            className="flex-1 gap-2"
                          >
                            <XCircle className="h-4 w-4" />
                            {isArabic ? "طلب تعديل" : "Request Revision"}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
