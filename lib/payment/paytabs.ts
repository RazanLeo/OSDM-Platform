// PayTabs Payment Gateway Integration
// https://site.paytabs.com/en/paytabs-api-documentation/

export interface PayTabsPaymentData {
  tran_type: 'sale' | 'auth' | 'capture' | 'void' | 'refund'
  tran_class: 'ecom' | 'moto' | 'recurring'
  cart_id: string
  cart_currency: string // 'SAR'
  cart_amount: number
  cart_description: string
  paypage_lang: 'ar' | 'en'
  customer_details: {
    name: string
    email: string
    phone: string
    street1?: string
    city?: string
    state?: string
    country: string // 'SA'
    zip?: string
    ip?: string
  }
  shipping_details?: {
    name: string
    email: string
    phone: string
    street1?: string
    city?: string
    state?: string
    country: string
    zip?: string
  }
  return_url: string
  callback?: string
  hide_shipping?: boolean
  user_defined?: Record<string, any>
}

export interface PayTabsPaymentResponse {
  tran_ref: string
  tran_type: string
  cart_id: string
  cart_description: string
  cart_currency: string
  cart_amount: string
  customer_details: {
    name: string
    email: string
    phone: string
    street1: string
    city: string
    state: string
    country: string
    zip: string
    ip: string
  }
  payment_result: {
    response_status: 'A' | 'H' | 'P' | 'V' | 'E' | 'D' // Approved, Hold, Pending, Voided, Error, Declined
    response_code: string
    response_message: string
    transaction_time: string
  }
  payment_info: {
    payment_method: string
    card_type: string
    card_scheme: string
    payment_description: string
  }
  redirect_url?: string
}

export class PayTabsPaymentService {
  private serverKey: string
  private profileId: string
  private baseUrl: string = 'https://secure.paytabs.sa'

  constructor() {
    this.serverKey = process.env.PAYTABS_SERVER_KEY || ''
    this.profileId = process.env.PAYTABS_PROFILE_ID || ''

    if (!this.serverKey || !this.profileId) {
      console.warn('⚠️ PayTabs credentials not set. Add PAYTABS_SERVER_KEY and PAYTABS_PROFILE_ID to .env')
    }
  }

  /**
   * إنشاء صفحة دفع
   */
  async createPaymentPage(data: PayTabsPaymentData): Promise<PayTabsPaymentResponse> {
    if (!this.serverKey || !this.profileId) {
      throw new Error('PayTabs credentials are not configured')
    }

    try {
      const requestData = {
        ...data,
        profile_id: this.profileId,
      }

      const response = await fetch(`${this.baseUrl}/payment/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.serverKey,
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create payment page')
      }

      const payment: PayTabsPaymentResponse = await response.json()
      return payment
    } catch (error: any) {
      console.error('PayTabs payment error:', error)
      throw error
    }
  }

  /**
   * التحقق من حالة الدفعة
   */
  async verifyPayment(tranRef: string): Promise<PayTabsPaymentResponse> {
    if (!this.serverKey || !this.profileId) {
      throw new Error('PayTabs credentials are not configured')
    }

    try {
      const response = await fetch(`${this.baseUrl}/payment/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.serverKey,
        },
        body: JSON.stringify({
          profile_id: this.profileId,
          tran_ref: tranRef,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to verify payment')
      }

      const payment: PayTabsPaymentResponse = await response.json()
      return payment
    } catch (error: any) {
      console.error('PayTabs verify error:', error)
      throw error
    }
  }

  /**
   * استرداد دفعة
   */
  async refundPayment(tranRef: string, amount: number, cartId: string): Promise<PayTabsPaymentResponse> {
    if (!this.serverKey || !this.profileId) {
      throw new Error('PayTabs credentials are not configured')
    }

    try {
      const response = await fetch(`${this.baseUrl}/payment/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.serverKey,
        },
        body: JSON.stringify({
          profile_id: this.profileId,
          tran_type: 'refund',
          tran_class: 'ecom',
          cart_id: cartId,
          cart_currency: 'SAR',
          cart_amount: amount,
          cart_description: 'Refund',
          tran_ref: tranRef,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to refund payment')
      }

      const payment: PayTabsPaymentResponse = await response.json()
      return payment
    } catch (error: any) {
      console.error('PayTabs refund error:', error)
      throw error
    }
  }

  /**
   * التقاط دفعة مفوضة
   */
  async capturePayment(tranRef: string, amount: number, cartId: string): Promise<PayTabsPaymentResponse> {
    if (!this.serverKey || !this.profileId) {
      throw new Error('PayTabs credentials are not configured')
    }

    try {
      const response = await fetch(`${this.baseUrl}/payment/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.serverKey,
        },
        body: JSON.stringify({
          profile_id: this.profileId,
          tran_type: 'capture',
          tran_class: 'ecom',
          cart_id: cartId,
          cart_currency: 'SAR',
          cart_amount: amount,
          cart_description: 'Capture',
          tran_ref: tranRef,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to capture payment')
      }

      const payment: PayTabsPaymentResponse = await response.json()
      return payment
    } catch (error: any) {
      console.error('PayTabs capture error:', error)
      throw error
    }
  }

  /**
   * إلغاء دفعة
   */
  async voidPayment(tranRef: string, amount: number, cartId: string): Promise<PayTabsPaymentResponse> {
    if (!this.serverKey || !this.profileId) {
      throw new Error('PayTabs credentials are not configured')
    }

    try {
      const response = await fetch(`${this.baseUrl}/payment/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.serverKey,
        },
        body: JSON.stringify({
          profile_id: this.profileId,
          tran_type: 'void',
          tran_class: 'ecom',
          cart_id: cartId,
          cart_currency: 'SAR',
          cart_amount: amount,
          cart_description: 'Void',
          tran_ref: tranRef,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to void payment')
      }

      const payment: PayTabsPaymentResponse = await response.json()
      return payment
    } catch (error: any) {
      console.error('PayTabs void error:', error)
      throw error
    }
  }
}

// مثيل واحد من الخدمة
export const paytabsService = new PayTabsPaymentService()
