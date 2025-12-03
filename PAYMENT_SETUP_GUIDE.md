# SSLCommerz Payment Setup - Quick Start

## What Was Fixed

### ✅ Issues Resolved

1. **Payment Status Staying PENDING**
   - **Problem**: Payments weren't updating to SUCCESS/FAILED after completion
   - **Root Cause**: IPN callback handler was missing, redirect callbacks weren't updating status
   - **Solution**: Added dedicated IPN handler that processes real-time updates from SSLCommerz

2. **Real-Time Status Updates**
   - **Problem**: No mechanism for SSLCommerz to notify backend immediately
   - **Solution**: Implemented IPN endpoint (`POST /api/payments/ipn`) that handles real-time callbacks

3. **Consistent User ID Extraction**
   - **Problem**: Mixed `userId` and `_id` extraction causing authentication issues
   - **Solution**: Unified all user ID extraction to use `req.user.userId`

4. **Route Order Issues**
   - **Problem**: Generic `/:paymentId` route was catching specific routes like `/subscription/status`
   - **Solution**: Reordered routes to put specific routes before generic ones

## Production-Ready Features Now Implemented

✅ **Real-Time Payment Status Updates** via IPN
✅ **Atomic Transactions** for payment + subscription updates
✅ **Proper Status State Machine** (PENDING → SUCCESS/FAILED/CANCELLED)
✅ **Idempotent Operations** (safe to retry)
✅ **Comprehensive Error Handling**
✅ **User Isolation** (users access only own payments)
✅ **Database Indexes** for performance
✅ **Detailed Logging** capability

## Quick Setup (5 Minutes)

### Step 1: Add Environment Variables

Create/update your `.env` file:

```env
# SSLCommerz Credentials
SSL_STORE_ID=your_store_id_here
SSL_STORE_PASS=your_store_password_here
SSL_PAYMENT_API=https://securepay.sslcommerz.com/gwprocess/v4/api.php
SSL_VALIDATION_API=https://securepay.sslcommerz.com/validator/api/validationAPI.php

# Frontend Callback URLs (user redirects)
SSL_SUCCESS_FRONTEND_URL=https://yourdomain.com/payment/success
SSL_FAIL_FRONTEND_URL=https://yourdomain.com/payment/failed
SSL_CANCEL_FRONTEND_URL=https://yourdomain.com/payment/cancelled

# Backend Callback URLs (what SSLCommerz calls)
SSL_SUCCESS_BACKEND_URL=https://api.yourdomain.com/api/payments/success
SSL_FAIL_BACKEND_URL=https://api.yourdomain.com/api/payments/fail
SSL_CANCEL_BACKEND_URL=https://api.yourdomain.com/api/payments/cancel
SSL_IPN_URL=https://api.yourdomain.com/api/payments/ipn

# Subscription Prices (BDT)
MONTHLY_SUBSCRIPTION_PRICE=299
YEARLY_SUBSCRIPTION_PRICE=2999
```

### Step 2: Configure SSLCommerz Merchant Panel

1. Log in to [SSLCommerz Merchant Panel](https://merchant.sslcommerz.com)
2. Go to **Settings** → **Integration**
3. Set these URLs:
   - **IPN URL**: `https://api.yourdomain.com/api/payments/ipn`
   - **Success URL**: `https://api.yourdomain.com/api/payments/success`
   - **Fail URL**: `https://api.yourdomain.com/api/payments/fail`
   - **Cancel URL**: `https://api.yourdomain.com/api/payments/cancel`

### Step 3: Test Payment Flow

**Using Sandbox (Test Mode):**

```bash
# 1. Get test credentials from SSLCommerz
SSL_STORE_ID=test_store_123
SSL_STORE_PASS=test_password

# 2. Initialize payment
curl -X POST http://localhost:5000/api/payments/init \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"subscriptionType": "monthly"}'

# 3. Open returned paymentUrl in browser
# 4. Complete payment on sandbox gateway
# 5. You'll be redirected to success page
# 6. Check database: Payment status should be "success"
```

### Step 4: Deploy to Production

1. **Switch to live credentials** in `.env`
2. **Ensure HTTPS** on both frontend and backend
3. **Update URLs** to production domain
4. **Test end-to-end** with real payment

## Testing Checklist

- [ ] Payment initialization returns valid gateway URL
- [ ] User redirected to SSLCommerz payment page
- [ ] Payment completion redirects user back
- [ ] Payment status updated to "success" in database
- [ ] User subscription activated (isPremium = true)
- [ ] Subscription details show correct expiry date
- [ ] Payment history shows the transaction
- [ ] Multiple payments work correctly
- [ ] Cancellation updates status to "cancelled"
- [ ] Failed payments update status to "failed"

## API Endpoints Reference

```bash
# 1. Initialize Payment (Protected)
POST /api/payments/init
Authorization: Bearer JWT_TOKEN
{"subscriptionType": "monthly"}
→ Returns: {paymentUrl, transactionId}

# 2. After Payment (Frontend Callback)
GET /api/payments/success?transactionId=...&val_id=...
→ Backend verifies and updates status

# 3. Check Subscription (Protected)
GET /api/payments/subscription/details
Authorization: Bearer JWT_TOKEN
→ Returns: {hasActiveSubscription, daysRemaining}

# 4. SSLCommerz IPN Callback (Automatic)
POST /api/payments/ipn
(SSLCommerz sends this automatically)
→ Real-time status update
```

## Debugging Payment Issues

### 1. Payment Stuck in PENDING

```bash
# Check payment record
db.payments.findOne({ transactionId: "TXN-..." })

# If status is PENDING but shouldn't be:
# - Check SSLCommerz merchant panel for transaction
# - Check backend logs for errors
# - Verify IPN endpoint is accessible
```

### 2. Subscription Not Activated

```bash
# Check user subscription
db.users.findOne({ _id: userId }, { subscription: 1 })

# If isPremium is false:
# - Check if payment status is SUCCESS
# - Verify payment record has correct user ID
# - Check for transaction rollback errors in logs
```

### 3. IPN Not Working

```bash
# Test IPN endpoint with Postman:
POST http://localhost:5000/api/payments/ipn
Content-Type: application/x-www-form-urlencoded

tran_id=TXN-...&status=VALID&val_id=...
```

## File Changes Summary

### payment.service.ts
- ✅ Added `handleIPNCallback()` function for real-time updates
- ✅ Fixed `handlePaymentCancellation()` and `handlePaymentFailure()` to properly update status
- ✅ Atomic transactions for user subscription updates

### payment.controller.ts
- ✅ Added `handleIPN` endpoint for real-time callbacks
- ✅ Fixed user ID extraction (consistent `userId` usage)
- ✅ All endpoints properly typed

### payment.routes.ts
- ✅ Added IPN route at top (priority)
- ✅ Reordered specific routes before generic `/paymentId`
- ✅ Proper route organization

## Next Steps

1. **Get SSLCommerz Credentials**:
   - Sign up at: https://www.sslcommerz.com
   - Get store ID and password from merchant panel

2. **Test with Sandbox**:
   - Use test credentials for development
   - Test all payment flows

3. **Go Live**:
   - Switch to production credentials
   - Update callback URLs
   - Monitor for issues

4. **Frontend Integration**:
   - Implement payment initialization button
   - Handle callback pages (success/fail/cancel)
   - Show subscription status to users

## Support

- **SSLCommerz Docs**: https://www.sslcommerz.com/developer/
- **Test Store**: https://sandbox.sslcommerz.com/
- **API Reference**: Check PAYMENT_PRODUCTION_GUIDE.md

---

**Your payment system is now production-ready with real-time status updates! 🚀**
