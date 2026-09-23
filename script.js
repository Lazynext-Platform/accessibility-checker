<!-- File: index.html -->
<!-- Add Pro license upsell to checkout page -->
<section id="checkout">
  <h2>Checkout</h2>
  <form id="checkout-form">
    <label for="license-type">License Type:</label>
    <select id="license-type" name="license-type">
      <option value="free">Free</option>
      <option value="pro">Pro ($9.99/month)</option>
    </select>
    <button type="submit">Checkout</button>
  </form>
  <div id="pro-features">
    <h3>Pro Features:</h3>
    <ul>
      <li>Advanced scanning capabilities</li>
      <li>Prioritized support</li>
      <li>Additional storage for reports</li>
    </ul>
  </div>
</section>

<script>
  // File: script.js
  const checkoutForm = document.getElementById('checkout-form');
  const licenseTypeSelect = document.getElementById('license-type');

  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const licenseType = licenseTypeSelect.value;
    const response = await fetch('/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ licenseType })
    });
    const data = await response.json();
    if (data.success) {
      // Handle successful checkout
      console.log('Checkout successful');
    } else {
      // Handle failed checkout
      console.error('Checkout failed');
    }
  });
</script>