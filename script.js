<!-- File: index.html -->
<!-- Upgrade to Pro license section -->
<section id="upgrade-to-pro" class="section">
  <h2>Upgrade to Pro License</h2>
  <p>Get more features and support with our Pro license.</p>
  <button id="upgrade-button" class="button">Upgrade Now</button>
  <div id="upgrade-form" class="modal" style="display:none;">
    <div class="modal-content">
      <h3>Upgrade to Pro License</h3>
      <form id="upgrade-form-submit">
        <label for="license-key">License Key:</label>
        <input type="text" id="license-key" name="license-key"><br><br>
        <label for="payment-method">Payment Method:</label>
        <select id="payment-method" name="payment-method">
          <option value="credit-card">Credit Card</option>
          <option value="paypal">PayPal</option>
        </select><br><br>
        <button id="submit-upgrade" class="button">Submit</button>
      </form>
    </div>
  </div>
</section>

<script>
  // File: script.js
  const upgradeButton = document.getElementById('upgrade-button');
  const upgradeForm = document.getElementById('upgrade-form');
  const submitUpgrade = document.getElementById('submit-upgrade');

  upgradeButton.addEventListener('click', () => {
    upgradeForm.style.display = 'block';
  });

  submitUpgrade.addEventListener('click', (e) => {
    e.preventDefault();
    const licenseKey = document.getElementById('license-key').value;
    const paymentMethod = document.getElementById('payment-method').value;

    // Call API to upgrade to Pro license
    fetch('/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        licenseKey: licenseKey,
        paymentMethod: paymentMethod
      })
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Show success message
        alert('Upgrade to Pro license successful!');
      } else {
        // Show error message
        alert('Error upgrading to Pro license: ' + data.error);
      }
    })
    .catch((error) => {
      console.error('Error upgrading to Pro license:', error);
    });
  });
</script>