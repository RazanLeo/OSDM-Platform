// PayPal Payment Gateway Integration
// https://developer.paypal.com/docs/api/overview/

export interface PayPalOrderData {
  intent: 'CAPTURE' | 'AUTHORIZE'
  purchase_units: Array<{
    reference_id?: string
    amount: {
      currency_code: string // 'USD', 'SAR', etc.
      value: string
    }
    description?: string
    custom_id?: string
    invoice_id?: string
  }>
  application_context?: {
    brand_name?: string
    locale?: string
    landing_page?: 'LOGIN' | 'BILLING' | 'NO_PREFERENCE'
    shipping_preference?: 'GET_FROM_FILE' | 'NO_SHIPPING' | 'SET_PROVIDED_ADDRESS'
    user_action?: 'CONTINUE' | 'PAY_NOW'
    return_url?: string
    cancel_url?: string
  }
}

export interface PayPalOrderResponse {
  id: string
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED' | 'PAYER_ACTION_REQUIRED'
  links: Array<{
    href: string
    rel: string
    method: string
  }>
  purchase_units?: Array<{
    reference_id: string
    amount: {
      currency_code: string
      value: string
    }
    payee?: {
      email_address: string
      merchant_id: string
    }
    payments?: {
      captures?: Array<{
        id: string
        status: string
        amount: {
          currency_code: string
          value: string
        }
      }>
    }
  }>
  payer?: {
    name: {
      given_name: string
      surname: string
    }
    email_address: string
    payer_id: string
  }
}

export class PayPalPaymentService {
  private clientId: string
  private clientSecret: string
  private baseUrl: string
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID || ''
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || ''

    // Sandbox or Live
    const mode = process.env.PAYPAL_MODE || 'sandbox'
    this.baseUrl = mode === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com'

    if (!this.clientId || !this.clientSecret) {
      console.warn('⚠️ PayPal credentials not set. Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to .env')
    }
  }

  /**
   * الحصول على Access Token
   */
  private async getAccessToken(): Promise<string> {
    // التحقق من وجود token صالح
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error('PayPal credentials are not configured')
    }

    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')

      const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      })

      if (!response.ok) {
        throw new Error('Failed to get PayPal access token')
      }

      const data = await response.json()
      this.accessToken = data.access_token
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000 // قبل الانتهاء بدقيقة

      return this.accessToken
    } catch (error: any) {
      console.error('PayPal auth error:', error)
      throw error
    }
  }

  /**
   * إنشاء طلب دفع
   */
  async createOrder(data: PayPalOrderData): Promise<PayPalOrderResponse> {
    try {
      const accessToken = await this.getAccessToken()

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create PayPal order')
      }

      const order: PayPalOrderResponse = await response.json()
      return order
    } catch (error: any) {
      console.error('PayPal create order error:', error)
      throw error
    }
  }

  /**
   * جلب تفاصيل الطلب
   */
  async getOrder(orderId: string): Promise<PayPalOrderResponse> {
    try {
      const accessToken = await this.getAccessToken()

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to get PayPal order')
      }

      const order: PayPalOrderResponse = await response.json()
      return order
    } catch (error: any) {
      console.error('PayPal get order error:', error)
      throw error
    }
  }

  /**
   * التقاط الدفعة (Capture)
   */
  async captureOrder(orderId: string): Promise<PayPalOrderResponse> {
    try {
      const accessToken = await this.getAccessToken()

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to capture PayPal order')
      }

      const order: PayPalOrderResponse = await response.json()
      return order
    } catch (error: any) {
      console.error('PayPal capture error:', error)
      throw error
    }
  }

  /**
   * استرداد الدفعة (Refund)
   */
  async refundCapture(captureId: string, amount?: { currency_code: string; value: string }): Promise<any> {
    try {
      const accessToken = await this.getAccessToken()

      const body: any = {}
      if (amount) {
        body.amount = amount
      }

      const response = await fetch(`${this.baseUrl}/v2/payments/captures/${captureId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to refund PayPal payment')
      }

      const refund = await response.json()
      return refund
    } catch (error: any) {
      console.error('PayPal refund error:', error)
      throw error
    }
  }

  /**
   * التفويض (Authorize)
   */
  async authorizeOrder(orderId: string): Promise<PayPalOrderResponse> {
    try {
      const accessToken = await this.getAccessToken()

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}/authorize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to authorize PayPal order')
      }

      const order: PayPalOrderResponse = await response.json()
      return order
    } catch (error: any) {
      console.error('PayPal authorize error:', error)
      throw error
    }
  }

  /**
   * إلغاء التفويض (Void)
   */
  async voidAuthorization(authorizationId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken()

      const response = await fetch(`${this.baseUrl}/v2/payments/authorizations/${authorizationId}/void`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to void PayPal authorization')
      }

      return response.status === 204 ? { success: true } : await response.json()
    } catch (error: any) {
      console.error('PayPal void error:', error)
      throw error
    }
  }
}

// مثيل واحد من الخدمة
export const paypalService = new PayPalPaymentService()
