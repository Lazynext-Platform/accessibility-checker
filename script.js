<!-- File: index.html -->
<!-- A/B testing for key UI components -->
<div class="ab-testing-container">
  <h2>Call to Action (CTA) A/B Testing</h2>
  <button id="cta-button-a" class="cta-button">Sign up for free</button>
  <button id="cta-button-b" class="cta-button" style="background-color: #4CAF50; color: #fff;">Start your free trial</button>
</div>

<script>
  // File: script.js
  // A/B testing for key UI components
  const ctaButtonA = document.getElementById('cta-button-a');
  const ctaButtonB = document.getElementById('cta-button-b');

  // Set up A/B testing
  const abTesting = {
    versionA: ctaButtonA,
    versionB: ctaButtonB,
    audience: [], // Split audience into two groups
  };

  // Split audience into two groups
  function splitAudience() {
    const audienceSize = 100; // Example audience size
    const groupSize = audienceSize / 2;
    for (let i = 0; i < groupSize; i++) {
      abTesting.audience.push('versionA');
    }
    for (let i = groupSize; i < audienceSize; i++) {
      abTesting.audience.push('versionB');
    }
  }

  // Run A/B test
  function runAbTest() {
    splitAudience();
    const userGroup = abTesting.audience[Math.floor(Math.random() * abTesting.audience.length)];
    if (userGroup === 'versionA') {
      ctaButtonA.style.display = 'block';
      ctaButtonB.style.display = 'none';
    } else {
      ctaButtonA.style.display = 'none';
      ctaButtonB.style.display = 'block';
    }
  }

  // Collect data on performance of each version
  function collectData() {
    const conversionRates = {
      versionA: 0,
      versionB: 0,
    };

    // Example data collection
    ctaButtonA.addEventListener('click', () => {
      conversionRates.versionA++;
    });

    ctaButtonB.addEventListener('click', () => {
      conversionRates.versionB++;
    });

    return conversionRates;
  }

  // Analyze results
  function analyzeResults(conversionRates) {
    if (conversionRates.versionA > conversionRates.versionB) {
      console.log('Version A performs better');
    } else {
      console.log('Version B performs better');
    }
  }

  // Initialize A/B testing
  function initAbTesting() {
    runAbTest();
    const conversionRates = collectData();
    analyzeResults(conversionRates);
  }

  initAbTesting();
</script>