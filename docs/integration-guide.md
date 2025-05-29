# RMA Payment Integration Guide

## Making a Payment Request

Send a POST request to `/api/makePayment` with the following parameters:

```javascript
{
  "bfs_msgType": "AR",
  "bfs_benfId": "BE10000237",
  "bfs_orderNo": "unique_order_number",
  "bfs_benfTxnTime": "YYYY-MM-DD HH:mm:ss",
  "bfs_benfBankCode": "your_bank_code",
  "bfs_txnCurrency": "BTN",
  "bfs_txnAmount": "100.00",
  "bfs_remitterEmail": "customer@example.com",
  "bfs_paymentDesc": "Payment description",
  "bfs_version": "1.0",
  "successUrl": "https://your-domain.com/payment/success",
  "failureUrl": "https://your-domain.com/payment/failure",
  "cancelUrl": "https://your-domain.com/payment/cancel"
}
```

## Response Format

```javascript
{
  "paymentUrl": "https://rma-payment.com/payment/{transactionId}",
  "bfs_checkSum": "generated_signature",
  "clientId": "your_client_id",
  "clientName": "Your Company Name"
}
```

## Handling Payment Completion

1. Configure webhook URL in your domain settings
2. Receive payment notifications at your webhook URL
3. Verify transaction status before fulfilling orders

## Sample Implementation

```javascript
async function initiatePayment(orderDetails) {
  const response = await fetch('https://rma-payment.com/api/makePayment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      bfs_msgType: 'AR',
      bfs_orderNo: orderDetails.orderId,
      // ... other required fields
      successUrl: 'https://your-domain.com/payment/success',
      failureUrl: 'https://your-domain.com/payment/failure',
      cancelUrl: "https://your-domain.com/payment/cancel"
    })
  });

  const { paymentUrl } = await response.json();
  window.location.href = paymentUrl;
}
```

## Security Considerations

1. Always validate the checksum
2. Use HTTPS for all API calls
3. Keep your API credentials secure
4. Implement idempotency for payment requests
