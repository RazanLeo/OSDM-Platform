// Moyasar Payment Gateway Integration
// https://moyasar.com/docs/api/

export interface MoyasarPaymentData {
  amount: number // بالهللة (SAR * 100)
  currency: string // 'SAR'
  description: string
  callback_url: string
  source: {
    type: 'creditcard' | 'applepay' | 'stcpay' | 'mada'
    number?: string
    name?: string
    month?: string
    year?: string
    cvc?: string
    token?: string // For Apple Pay
    mobile?: string // For STC Pay
  }
  metadata?: Record<string, any>
}

export interface MoyasarPaymentResponse {
  id: string
  status: 'initiated' | 'paid' | 'failed' | 'authorized' | 'captured' | 'refunded'
  amount: number
  fee: number
  currency: string
  refunded: number
  refunded_at: string | null
  captured: number
  captured_at: string | null
  voided_at: string | null
  description: string
  amount_format: string
  fee_format: string
  refunded_format: string
  captured_format: string
  invoice_id: string | null
  ip: string
  callback_url: string
  created_at: string
  updated_at: string
  source: {
    type: string
    company: string
    name: string
    number: string
    gateway_id: string
    reference_number: string
    token: string
    message: string
  }
  metadata: Record<string, any>
}

export class MoyasarPaymentService {
  private apiKey: string
  private baseUrl: string = 'https://api.moyasar.com/v1'

  constructor() {
    this.apiKey = process.env.MOYASAR_API_KEY || ''

    if (!this.apiKey) {
      console.warn('⚠️ MOYASAR_API_KEY is not set. Payment will not work until you add it to .env')
    }
  }

  /**
   * إنشاء دفعة جديدة
   */
  async createPayment(data: MoyasarPaymentData): Promise<MoyasarPaymentResponse> {
    if (!this.apiKey) {
      throw new Error('Moyasar API Key is not configured')
    }

    try {
      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create payment')
      }

      const payment: MoyasarPaymentResponse = await response.json()
      return payment
    } catch (error: any) {
      console.error('Moyasar payment error:', error)
      throw error
    }
  }

  /**
   * جلب معلومات دفعة
   */
  async getPayment(paymentId: string): Promise<MoyasarPaymentResponse> {
    if (!this.apiKey) {
      throw new Error('Moyasar API Key is not configured')
    }

    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to get payment')
      }

      const payment: MoyasarPaymentResponse = await response.json()
      return payment
    } catch (error: any) {
      console.error('Moyasar get payment error:', error)
      throw error
    }
  }

  /**
   * استرداد دفعة
   */
  async refundPayment(paymentId: string, amount?: number): Promise<MoyasarPaymentResponse> {
    if (!this.apiKey) {
      throw new Error('Moyasar API Key is not configured')
    }

    try {
      const body: any = {}
      if (amount) {
        body.amount = amount // بالهللة
      }

      const response = await fetch(`${this.baseUrl}/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to refund payment')
      }

      const payment: MoyasarPaymentResponse = await response.json()
      return payment
    } catch (error: any) {
      console.error('Moyasar refund error:', error)
      throw error
    }
  }

  /**
   * التقاط دفعة (Capture authorized payment)
   */
  async capturePayment(paymentId: string, amount?: number): Promise<MoyasarPaymentResponse> {
    if (!this.apiKey) {
      throw new Error('Moyasar API Key is not configured')
    }

    try {
      const body: any = {}
      if (amount) {
        body.amount = amount
      }

      const response = await fetch(`${this.baseUrl}/payments/${paymentId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to capture payment')
      }

      const payment: MoyasarPaymentResponse = await response.json()
      return payment
    } catch (error: any) {
      console.error('Moyasar capture error:', error)
      throw error
    }
  }

  /**
   * إلغاء دفعة
   */
  async voidPayment(paymentId: string): Promise<MoyasarPaymentResponse> {
    if (!this.apiKey) {
      throw new Error('Moyasar API Key is not configured')
    }

    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}/void`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to void payment')
      }

      const payment: MoyasarPaymentResponse = await response.json()
      return payment
    } catch (error: any) {
      console.error('Moyasar void error:', error)
      throw error
    }
  }
}

// مثيل واحد من الخدمة
export const moyasarService = new MoyasarPaymentService()
