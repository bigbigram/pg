<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>CheckOut Page</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f6f8;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 900px;
      margin: 40px auto;
      background: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      padding: 30px;
      display: flex;
      gap: 30px;
    }

    .form-section, .summary-section {
      flex: 1;
    }

    h2 {
      border-bottom: 1px solid #ccc;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin: 10px 0 5px;
    }

    input, select {
      width: 100%;
      padding: 10px;
      margin-bottom: 15px;
      border: 1px solid #ccc;
      border-radius: 6px;
    }

    .summary-section {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .summary-item.total {
      font-weight: bold;
      border-top: 1px solid #ccc;
      padding-top: 10px;
    }

    button {
      width: 100%;
      padding: 15px;
      background-color: #4CAF50;
      color: white;
      border: none;
      font-size: 16px;
      border-radius: 8px;
      cursor: pointer;
    }

    button:hover {
      background-color: #45a049;
    }

    .button-loading {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .error-message {
      background-color: #fee2e2;
      border: 1px solid #ef4444;
      color: #991b1b;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 16px;
      display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="form-section">
      <h2>Billing Details</h2>
      <form id="checkout-form">
        <label>Full Name</label>
        <input type="text"  value="Bigram" name="fullname" required />

        <label>Email</label>
        <input type="email" value="Bigram@gmail.com" name="email" required />

        <label>Address</label>
        <input type="text" value="Thimphu" name="address" required />

        <label>City</label>
        <input type="text" value="Thimphu" name="city" required />

        <label>Payment Method</label>
        <select name="payment">
          <option value="online">RMA PAYMENT</option>
          <option value="cod">Cash on Delivery</option>
        </select>
      </form>
    </div>

    <div class="summary-section">
      <div id="error-message" class="error-message"></div>
      <h2>Order Summary</h2>
      <div class="summary-item">
        <span>Product 1</span>
        <span>Nu. 25.00</span>
      </div>
      <div class="summary-item">
        <span>Product 2</span>
        <span>Nu. 15.00</span>
      </div>
      <div class="summary-item">
        <span>Shipping</span>
        <span>Nu. 5.00</span>
      </div>
      <div class="summary-item total">
        <span>Total</span>
        <span>Nu. 45.00</span>
      </div>

      <button onclick="submitCheckout()">Place Order</button>
    </div>
  </div>

  <!-- Update RMA payment form to post through our app -->
  <form id="rma-payment-form" method="POST" action="http://localhost:3000/api/submit-to-rma" style="display:none;">
  </form>

<script>
  async function submitCheckout() {
    const form = document.getElementById('checkout-form');
    const button = document.querySelector('button');
    const errorDiv = document.getElementById('error-message');
    
    if (form.checkValidity()) {
      try {
        button.disabled = true;
        button.classList.add('button-loading');
        button.textContent = 'Processing...';
        errorDiv.style.display = 'none';
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        if (data.payment === 'online') {
          const response = await fetch('http://localhost:3000/api/makePayment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Client-ID': 'a53f45fe-ac47-43db-9aca-b20ffb205b2e',
              'X-API-Key': 'pk_1747392772791',
              'X-Domain': window.location.hostname // Use actual hostname
            },
            body: JSON.stringify({
              bfs_msgType: 'PAY',
              bfs_benfId: 'MERCHANT123',
              bfs_orderNo: 'ORD' + Date.now(),
              bfs_benfTxnTime: new Date().toISOString(),
              bfs_benfBankCode: 'BNB',
              bfs_txnCurrency: 'BTN',
              bfs_txnAmount: Number('45.00').toFixed(2), // Force 2 decimal places
              bfs_remitterEmail: data.email,
              bfs_paymentDesc: 'Order payment',
              bfs_version: '1.0',
              successUrl: `${window.location.origin}/success.php`,
              failureUrl: `${window.location.origin}/failure.php`
            })
          });
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Payment initialization failed');
          }

          if (result.success && result.paymentParams) {
            const rmaForm = document.getElementById('rma-payment-form');
            rmaForm.innerHTML = '';

            Object.entries(result.paymentParams).forEach(([key, value]) => {
              if (value) { // Only add non-null values
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = String(value);
                rmaForm.appendChild(input);
              }
            });

            // Submit the form
            rmaForm.submit();
          } else {
            throw new Error('Payment parameters not received');
          }
        } else {
          // Handle COD
          alert("Order placed successfully for Cash on Delivery!\n\n" + JSON.stringify(data, null, 2));
        }
      } catch (error) {
        console.error('Payment error:', error);
        errorDiv.textContent = error.message || 'Payment processing failed. Please try again.';
        errorDiv.style.display = 'block';
      } finally {
        button.disabled = false;
        button.classList.remove('button-loading');
        button.textContent = 'Place Order';
      }
    } else {
      form.reportValidity();
    }
  }
</script>

</body>
</html>
