// Vercel Blob Storage Integration
// https://vercel.com/docs/storage/vercel-blob

import { put, del, list, head } from '@vercel/blob'

export interface UploadOptions {
  access?: 'public' | 'private'
  contentType?: string
  addRandomSuffix?: boolean
  cacheControlMaxAge?: number
}

export interface UploadResult {
  url: string
  pathname: string
  contentType: string
  contentDisposition: string
}

export class VercelBlobService {
  private token: string

  constructor() {
    this.token = process.env.BLOB_READ_WRITE_TOKEN || ''

    if (!this.token) {
      console.warn('⚠️ BLOB_READ_WRITE_TOKEN is not set. File upload will not work until you add it to .env')
    }
  }

  /**
   * رفع ملف
   */
  async uploadFile(
    file: File | Buffer | Blob,
    pathname: string,
    options?: UploadOptions
  ): Promise<UploadResult> {
    if (!this.token) {
      throw new Error('Vercel Blob token is not configured')
    }

    try {
      const blob = await put(pathname, file, {
        access: options?.access || 'public',
        contentType: options?.contentType,
        addRandomSuffix: options?.addRandomSuffix ?? true,
        token: this.token,
      })

      return {
        url: blob.url,
        pathname: blob.pathname,
        contentType: blob.contentType || '',
        contentDisposition: blob.contentDisposition || '',
      }
    } catch (error: any) {
      console.error('Vercel Blob upload error:', error)
      throw error
    }
  }

  /**
   * حذف ملف
   */
  async deleteFile(url: string): Promise<void> {
    if (!this.token) {
      throw new Error('Vercel Blob token is not configured')
    }

    try {
      await del(url, { token: this.token })
    } catch (error: any) {
      console.error('Vercel Blob delete error:', error)
      throw error
    }
  }

  /**
   * حذف عدة ملفات
   */
  async deleteFiles(urls: string[]): Promise<void> {
    if (!this.token) {
      throw new Error('Vercel Blob token is not configured')
    }

    try {
      await del(urls, { token: this.token })
    } catch (error: any) {
      console.error('Vercel Blob delete multiple error:', error)
      throw error
    }
  }

  /**
   * قائمة الملفات
   */
  async listFiles(prefix?: string, limit?: number): Promise<any> {
    if (!this.token) {
      throw new Error('Vercel Blob token is not configured')
    }

    try {
      const result = await list({
        prefix,
        limit,
        token: this.token,
      })

      return result
    } catch (error: any) {
      console.error('Vercel Blob list error:', error)
      throw error
    }
  }

  /**
   * معلومات ملف
   */
  async getFileInfo(url: string): Promise<any> {
    if (!this.token) {
      throw new Error('Vercel Blob token is not configured')
    }

    try {
      const info = await head(url, { token: this.token })
      return info
    } catch (error: any) {
      console.error('Vercel Blob head error:', error)
      throw error
    }
  }

  /**
   * التحقق من نوع الملف
   */
  isValidFileType(filename: string, allowedTypes: string[]): boolean {
    const extension = filename.split('.').pop()?.toLowerCase()
    return allowedTypes.includes(extension || '')
  }

  /**
   * التحقق من حجم الملف
   */
  isValidFileSize(size: number, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    return size <= maxSizeBytes
  }

  /**
   * توليد اسم ملف فريد
   */
  generateUniqueFilename(originalName: string, userId: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const extension = originalName.split('.').pop()
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '')

    return `${userId}/${timestamp}-${random}-${nameWithoutExt}.${extension}`
  }
}

// مثيل واحد من الخدمة
export const blobService = new VercelBlobService()

// أنواع الملفات المسموحة
export const ALLOWED_FILE_TYPES = {
  images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  documents: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
  archives: ['zip', 'rar', '7z', 'tar', 'gz'],
  audio: ['mp3', 'wav', 'ogg', 'flac'],
  video: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
  code: ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs'],
  design: ['psd', 'ai', 'sketch', 'fig', 'xd'],
  fonts: ['ttf', 'otf', 'woff', 'woff2'],
  all: [] as string[],
}

// دمج جميع الأنواع
ALLOWED_FILE_TYPES.all = [
  ...ALLOWED_FILE_TYPES.images,
  ...ALLOWED_FILE_TYPES.documents,
  ...ALLOWED_FILE_TYPES.archives,
  ...ALLOWED_FILE_TYPES.audio,
  ...ALLOWED_FILE_TYPES.video,
  ...ALLOWED_FILE_TYPES.code,
  ...ALLOWED_FILE_TYPES.design,
  ...ALLOWED_FILE_TYPES.fonts,
]

// الحد الأقصى لحجم الملفات (MB)
export const MAX_FILE_SIZES = {
  image: 10, // 10 MB
  document: 50, // 50 MB
  archive: 100, // 100 MB
  audio: 50, // 50 MB
  video: 500, // 500 MB
  other: 100, // 100 MB
}
