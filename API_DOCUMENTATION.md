# 📚 OSDM Platform - API Documentation

## 🌐 Base URL
```
Development: http://localhost:3000/api
Production: https://osdm.sa/api
```

## 🔐 Authentication
All protected endpoints require authentication via NextAuth session cookies.

---

## 1️⃣ Authentication APIs

### POST `/api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "fullName": "Full Name",
  "role": "BUYER" | "SELLER" | "FREELANCER",
  "accountType": "INDIVIDUAL" | "COMPANY",
  "phone": "+966500000000",
  "country": "السعودية",
  "city": "جدة"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم التسجيل بنجاح",
  "data": { "user": {...} }
}
```

---

## 2️⃣ Products APIs

### GET `/api/products`
Get all ready-made digital products.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 12)
- `search` (string)
- `category` (string)
- `subcategory` (string)
- `minPrice` (number, default: 0)
- `maxPrice` (number, default: 999999)
- `sortBy` (string, default: 'createdAt')
- `order` ('asc' | 'desc', default: 'desc')
- `status` ('DRAFT' | 'PUBLISHED' | 'SUSPENDED')
- `sellerId` (string)
- `featured` (boolean)
- `bestseller` (boolean)

**Response:**
```json
{
  "success": true,
  "data": [...products],
  "stats": {
    "total": 100,
    "pages": 10,
    "currentPage": 1,
    "limit": 12
  }
}
```

### POST `/api/products`
Create a new product. **Requires: Seller/Admin role**

**Request Body:**
```json
{
  "title": "Product Title",
  "description": "Product description...",
  "price": 99.99,
  "category": "category-id",
  "subcategory": "subcategory-id",
  "tags": ["tag1", "tag2"],
  "thumbnail": "https://...",
  "images": ["https://..."],
  "licenseType": "PERSONAL" | "COMMERCIAL" | "EXTENDED"
}
```

### GET `/api/products/[id]`
Get a single product by ID.

### PATCH `/api/products/[id]`
Update a product. **Requires: Owner or Admin**

### DELETE `/api/products/[id]`
Delete/suspend a product. **Requires: Owner or Admin**

### POST `/api/products/[id]/publish`
Publish a product (change status from DRAFT to PUBLISHED).

### POST `/api/products/[id]/favorite`
Add/remove product from favorites.

### GET `/api/products/[id]/favorite`
Check if product is favorited by current user.

---

## 3️⃣ Services APIs

### GET `/api/services`
Get all custom services.

**Query Parameters:**
Similar to products, plus:
- `deliveryTime` ('ONE_DAY' | 'THREE_DAYS' | 'ONE_WEEK' | 'TWO_WEEKS' | 'ONE_MONTH')
- `sellerLevel` ('Top Seller' | 'Level 2' | 'Level 1')

**Response:**
```json
{
  "success": true,
  "data": [...services],
  "stats": {...}
}
```

### POST `/api/services`
Create a new service. **Requires: Seller/Admin role**

**Request Body:**
```json
{
  "title": "Service Title",
  "description": "Service description...",
  "category": "category-id",
  "tags": ["tag1", "tag2"],
  "thumbnail": "https://...",
  "deliveryTime": "ONE_WEEK",
  "packages": [
    {
      "name": "BASIC",
      "price": 500,
      "deliveryDays": 3,
      "revisions": 2,
      "features": ["Feature 1", "Feature 2"]
    },
    {
      "name": "STANDARD",
      "price": 1000,
      "deliveryDays": 5,
      "revisions": 4,
      "features": ["All Basic features", "Feature 3"]
    },
    {
      "name": "PREMIUM",
      "price": 2000,
      "deliveryDays": 7,
      "revisions": -1,
      "features": ["All Standard features", "Feature 4"]
    }
  ]
}
```

### GET `/api/services/[id]`
Get a single service.

### PATCH `/api/services/[id]`
Update a service.

### DELETE `/api/services/[id]`
Delete a service.

### POST `/api/services/[id]/order`
Order a service.

**Request Body:**
```json
{
  "packageType": "BASIC" | "STANDARD" | "PREMIUM",
  "requirements": "Your requirements here...",
  "notes": "Additional notes..."
}
```

---

## 4️⃣ Projects APIs

### GET `/api/projects`
Get all freelance projects.

**Query Parameters:**
- `category` (string)
- `budgetType` ('FIXED' | 'HOURLY')
- `minBudget` (number)
- `maxBudget` (number)
- `experienceLevel` ('BEGINNER' | 'INTERMEDIATE' | 'EXPERT')
- `projectSize` ('SMALL' | 'MEDIUM' | 'LARGE')
- `skills` (comma-separated string)
- `status` ('OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED')

### POST `/api/projects`
Create a new project.

**Request Body:**
```json
{
  "title": "Project Title",
  "description": "Project description...",
  "category": "category-id",
  "skills": ["React", "Node.js", "TypeScript"],
  "budgetType": "FIXED" | "HOURLY",
  "fixedBudget": 5000,
  "hourlyRateMin": 50,
  "hourlyRateMax": 100,
  "duration": "1-3 months",
  "experienceLevel": "EXPERT",
  "projectSize": "LARGE",
  "milestones": [
    {
      "title": "Milestone 1",
      "description": "Description...",
      "amount": 2000,
      "dueDate": "2025-11-01"
    }
  ]
}
```

### GET `/api/projects/[id]`
Get a single project.

### PATCH `/api/projects/[id]`
Update a project.

### DELETE `/api/projects/[id]`
Cancel a project.

### GET `/api/projects/[id]/proposals`
Get all proposals for a project. **Requires: Client or Admin**

### POST `/api/projects/[id]/proposals`
Submit a proposal for a project. **Requires: Freelancer**

**Request Body:**
```json
{
  "coverLetter": "Your cover letter...",
  "proposedAmount": 4500,
  "proposedDuration": "2 months",
  "milestones": [...]
}
```

### POST `/api/projects/[id]/proposals/[proposalId]/accept`
Accept a proposal. **Requires: Client**

---

## 5️⃣ Orders APIs

### GET `/api/orders`
Get orders (buyer or seller).

**Query Parameters:**
- `type` ('buyer' | 'seller' | 'all')
- `status` ('PENDING' | 'PROCESSING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED')
- `orderType` ('PRODUCT' | 'SERVICE' | 'PROJECT')

### GET `/api/orders/[id]`
Get a single order.

### PATCH `/api/orders/[id]`
Update order status.

**Request Body:**
```json
{
  "status": "COMPLETED" | "CANCELLED" | "IN_PROGRESS",
  "deliveryFiles": ["https://..."],
  "deliveryNote": "Your order is ready!",
  "cancellationReason": "Reason..."
}
```

---

## 6️⃣ Reviews APIs

### POST `/api/reviews`
Create a review for a completed order.

**Request Body:**
```json
{
  "orderId": "order-id",
  "rating": 5,
  "comment": "Great product!",
  "communicationRating": 5,
  "serviceQualityRating": 5,
  "deliveryTimeRating": 5
}
```

### GET `/api/reviews`
Get reviews.

**Query Parameters:**
- `sellerId` (string)
- `productId` (string)
- `serviceId` (string)
- `projectId` (string)

**Response:**
```json
{
  "success": true,
  "data": [...reviews],
  "stats": {...},
  "ratingDistribution": {
    "5": 50,
    "4": 20,
    "3": 10,
    "2": 5,
    "1": 2
  },
  "averageRating": 4.5
}
```

### POST `/api/reviews/[id]/response`
Seller responds to a review.

**Request Body:**
```json
{
  "response": "Thank you for your feedback!"
}
```

---

## 7️⃣ Payments APIs

### POST `/api/payments/create`
Create a payment for an order.

**Request Body:**
```json
{
  "orderId": "order-id",
  "paymentMethod": "moyasar" | "paytabs" | "paypal",
  "paymentType": "creditcard" | "mada" | "applepay" | "stcpay",
  "returnUrl": "https://..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "transaction-id",
    "paymentUrl": "https://payment-gateway.com/...",
    "paymentGateway": "moyasar",
    "gatewayTransactionId": "gateway-id"
  }
}
```

### POST `/api/payments/callback`
Webhook for payment gateways. **Called by payment gateway**

### GET `/api/payments/callback`
Check payment status manually.

**Query Parameters:**
- `transactionId` (string)
- `gatewayId` (string)

---

## 8️⃣ Wallet & Withdrawals APIs

### GET `/api/wallet`
Get wallet information.

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 5000,
    "totalEarnings": 10000,
    "totalSpent": 2000,
    "totalWithdrawn": 3000,
    "pendingWithdrawals": 500,
    "availableForWithdrawal": 4500,
    "recentWithdrawals": [...],
    "recentTransactions": [...]
  }
}
```

### POST `/api/wallet/withdraw`
Request a withdrawal. **Requires: Seller/Freelancer**

**Request Body:**
```json
{
  "amount": 1000,
  "method": "BANK_TRANSFER" | "PAYPAL" | "WISE" | "WALLET",
  "accountDetails": {
    "accountName": "Account Name",
    "iban": "SA...",
    "bankName": "Bank Name",
    "paypalEmail": "email@example.com"
  },
  "notes": "Optional notes"
}
```

### GET `/api/wallet/withdraw`
Get withdrawal requests.

**Query Parameters:**
- `status` ('PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED')

---

## 9️⃣ Messages APIs

### GET `/api/messages/conversations`
Get all conversations.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "conversation-id",
      "otherParticipant": {...},
      "lastMessage": {...},
      "unreadCount": 5,
      "order": {...}
    }
  ]
}
```

### POST `/api/messages/conversations`
Create a new conversation.

**Request Body:**
```json
{
  "participantId": "user-id",
  "orderId": "order-id",
  "projectId": "project-id"
}
```

### GET `/api/messages/[conversationId]`
Get messages in a conversation.

### POST `/api/messages/[conversationId]`
Send a message.

**Request Body:**
```json
{
  "content": "Hello!",
  "type": "TEXT" | "IMAGE" | "FILE" | "AUDIO" | "VIDEO",
  "attachments": ["https://..."]
}
```

---

## 🔟 Notifications APIs

### GET `/api/notifications`
Get notifications.

**Query Parameters:**
- `unreadOnly` (boolean)

**Response:**
```json
{
  "success": true,
  "data": [...notifications],
  "stats": {
    "total": 50,
    "unreadCount": 10
  }
}
```

### PATCH `/api/notifications`
Mark notifications as read.

**Request Body:**
```json
{
  "notificationIds": ["id1", "id2"],
  "markAll": false
}
```

### DELETE `/api/notifications`
Delete notifications.

**Query Parameters:**
- `id` (string) - Delete specific notification
- `deleteAll` (boolean) - Delete all read notifications

---

## 1️⃣1️⃣ File Upload API

### POST `/api/upload`
Upload a file.

**Request Body:** (multipart/form-data)
- `file` (File)
- `type` ('image' | 'document' | 'archive' | 'audio' | 'video')
- `folder` ('products' | 'profiles' | 'attachments')

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://blob.vercel-storage.com/...",
    "pathname": "products/user-id/file.jpg",
    "contentType": "image/jpeg",
    "size": 1024000,
    "originalName": "file.jpg"
  }
}
```

### DELETE `/api/upload?url=https://...`
Delete a file.

---

## 📊 Error Responses

All APIs return errors in this format:

```json
{
  "success": false,
  "error": "Error message in Arabic",
  "details": [...] // Optional: Validation errors
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔑 API Rate Limiting

- **Anonymous users:** 100 requests/hour
- **Authenticated users:** 1000 requests/hour
- **Premium users:** 5000 requests/hour

---

## 📝 Notes

1. All dates are in ISO 8601 format (`2025-10-07T12:00:00.000Z`)
2. All amounts are in SAR (Saudi Riyal)
3. File uploads are limited:
   - Images: 10 MB
   - Documents: 50 MB
   - Videos: 500 MB
4. Pagination is available on all list endpoints
5. All text fields support both Arabic and English

---

**Last Updated:** 2025-10-07
**API Version:** 1.0.0
