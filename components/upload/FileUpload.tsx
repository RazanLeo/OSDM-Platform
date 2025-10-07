"use client"

import { useState, useRef } from "react"
import { Upload, X, File, Image as ImageIcon, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  accept?: string
  maxSize?: number // in MB
  maxFiles?: number
  onFilesSelected?: (files: File[]) => void
  onUploadComplete?: (urls: string[]) => void
  locale: "ar" | "en"
  type?: "image" | "file" | "both"
}

export function FileUpload({
  accept = "*",
  maxSize = 10,
  maxFiles = 1,
  onFilesSelected,
  onUploadComplete,
  locale,
  type = "both",
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isRTL = locale === "ar"

  const t = {
    uploadFiles: isRTL ? "رفع الملفات" : "Upload Files",
    uploadImages: isRTL ? "رفع الصور" : "Upload Images",
    dragDrop: isRTL ? "اسحب الملفات هنا أو" : "Drag & drop files here, or",
    browse: isRTL ? "تصفح" : "browse",
    maxSize: isRTL ? "الحجم الأقصى" : "Max size",
    maxFiles: isRTL ? "عدد الملفات الأقصى" : "Max files",
    uploading: isRTL ? "جاري الرفع..." : "Uploading...",
    uploaded: isRTL ? "تم الرفع" : "Uploaded",
    remove: isRTL ? "إزالة" : "Remove",
    mb: isRTL ? "م.ب" : "MB",
  }

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const fileArray = Array.from(selectedFiles)

    // Validate file size
    const validFiles = fileArray.filter((file) => {
      const fileSizeMB = file.size / (1024 * 1024)
      if (fileSizeMB > maxSize) {
        alert(`${file.name} ${isRTL ? "أكبر من" : "exceeds"} ${maxSize}${t.mb}`)
        return false
      }
      return true
    })

    // Limit number of files
    const limitedFiles = validFiles.slice(0, maxFiles - files.length)

    setFiles((prev) => [...prev, ...limitedFiles])

    if (onFilesSelected) {
      onFilesSelected([...files, ...limitedFiles])
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    // TODO: Replace with actual Vercel Blob upload
    // For now, simulate upload
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    setTimeout(() => {
      // Simulate uploaded URLs (replace with actual upload)
      const urls = files.map((file) => URL.createObjectURL(file))
      setUploadedUrls(urls)
      setUploading(false)

      if (onUploadComplete) {
        onUploadComplete(urls)
      }
    }, 2000)
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const getAcceptedTypes = () => {
    if (type === "image") return "image/*"
    if (type === "file") return ".pdf,.doc,.docx,.zip,.rar"
    return accept
  }

  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          "hover:border-primary hover:bg-muted/50 cursor-pointer",
          uploading && "pointer-events-none opacity-50"
        )}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleFileSelect(e.dataTransfer.files)
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptedTypes()}
          multiple={maxFiles > 1}
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />

        <div className="flex flex-col items-center gap-2">
          {type === "image" ? (
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
          ) : (
            <Upload className="h-12 w-12 text-muted-foreground" />
          )}

          <div>
            <p className="text-sm font-medium">
              {t.dragDrop}{" "}
              <span className="text-primary underline">{t.browse}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t.maxSize}: {maxSize}{t.mb} • {t.maxFiles}: {maxFiles}
            </p>
          </div>
        </div>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 border rounded-lg"
            >
              {file.type.startsWith("image/") ? (
                <ImageIcon className="h-8 w-8 text-muted-foreground flex-shrink-0" />
              ) : (
                <File className="h-8 w-8 text-muted-foreground flex-shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(2)} {t.mb}
                </p>
              </div>

              {uploadedUrls[index] ? (
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{t.uploading}</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && !uploading && uploadedUrls.length === 0 && (
        <Button onClick={handleUpload} className="w-full">
          <Upload className="h-4 w-4 mr-2" />
          {type === "image" ? t.uploadImages : t.uploadFiles}
        </Button>
      )}

      {uploadedUrls.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-lg">
          <Check className="h-5 w-5" />
          <span className="text-sm font-medium">{t.uploaded}</span>
        </div>
      )}

      {/* Note about Vercel Blob */}
      <p className="text-xs text-muted-foreground text-center">
        {isRTL
          ? "ملاحظة: نظام رفع الملفات يحتاج تفعيل Vercel Blob"
          : "Note: File upload requires Vercel Blob activation"}
      </p>
    </div>
  )
}
