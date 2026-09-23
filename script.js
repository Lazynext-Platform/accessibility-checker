<!-- File: index.html -->
<!-- Trial License Features and Limitations UI -->
<section id="trial-license" class="section">
  <h2>Trial License Features and Limitations</h2>
  <p>Try out our accessibility checker with a trial license, limited to 30 days and 100 scans.</p>
  <ul>
    <li><strong>Features:</strong>
      <ul>
        <li>Scan up to 100 web pages</li>
        <li>Access to basic accessibility reporting</li>
        <li>Limited support via email</li>
      </ul>
    </li>
    <li><strong>Limitations:</strong>
      <ul>
        <li>30-day time limit</li>
        <li>100 scan limit</li>
        <li>No access to advanced features or priority support</li>
      </ul>
    </li>
  </ul>
  <button id="start-trial" class="btn">Start Trial</button>
  <div id="trial-license-modal" class="modal">
    <div class="modal-content">
      <h3>Trial License Agreement</h3>
      <p>By starting your trial, you agree to our terms and conditions.</p>
      <button id="accept-trial" class="btn">Accept and Start Trial</button>
      <button id="decline-trial" class="btn">Decline</button>
    </div>
  </div>
</section>

<script>
  // File: script.js
  const startTrialButton = document.getElementById('start-trial');
  const trialLicenseModal = document.getElementById('trial-license-modal');
  const acceptTrialButton = document.getElementById('accept-trial');
  const declineTrialButton = document.getElementById('decline-trial');

  startTrialButton.addEventListener('click', () => {
    trialLicenseModal.style.display = 'block';
  });

  declineTrialButton.addEventListener('click', () => {
    trialLicenseModal.style.display = 'none';
  });

  acceptTrialButton.addEventListener('click', () => {
    // Call API to start trial license
    fetch('/api/v1/billing/start-trial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      // Update UI to reflect trial license status
      trialLicenseModal.style.display = 'none';
    })
    .catch(error => {
      console.error(error);
    });
  });
</script>