<!-- File: index.html -->
<!-- Onboarding Wizard HTML Structure -->
<div class="onboarding-wizard" aria-label="Onboarding Wizard" role="dialog">
  <h1 class="title" id="onboarding-title">Welcome to Our Platform!</h1>
  <p class="description" id="onboarding-description">Let's get you started with our interactive accessibility guide.</p>
  <div class="steps" role="tablist" aria-label="Onboarding Steps">
    <button class="step" role="tab" aria-selected="true" aria-controls="step-1">Step 1: Introduction</button>
    <button class="step" role="tab" aria-selected="false" aria-controls="step-2">Step 2: Accessibility Features</button>
    <button class="step" role="tab" aria-selected="false" aria-controls="step-3">Step 3: Getting Started</button>
  </div>
  <div class="step-content" id="step-1" role="tabpanel" aria-labelledby="step-1-tab">
    <h2 class="step-title">Introduction</h2>
    <p class="step-description">Our platform is designed to be accessible to everyone. In this onboarding wizard, we'll guide you through our interactive accessibility guide.</p>
    <button class="next-step" aria-label="Next Step">Next</button>
  </div>
  <div class="step-content" id="step-2" role="tabpanel" aria-labelledby="step-2-tab" hidden>
    <h2 class="step-title">Accessibility Features</h2>
    <p class="step-description">Our platform includes features such as keyboard navigation, screen reader support, and high contrast mode.</p>
    <button class="next-step" aria-label="Next Step">Next</button>
  </div>
  <div class="step-content" id="step-3" role="tabpanel" aria-labelledby="step-3-tab" hidden>
    <h2 class="step-title">Getting Started</h2>
    <p class="step-description">You're now ready to start using our platform! If you need any help or have questions, don't hesitate to reach out to our support team.</p>
    <button class="finish-onboarding" aria-label="Finish Onboarding">Finish</button>
  </div>
</div>

<!-- Onboarding Wizard JavaScript Code -->
<script>
  // File: script.js
  const onboardingWizard = document.querySelector('.onboarding-wizard');
  const steps = document.querySelectorAll('.step');
  const stepContent = document.querySelectorAll('.step-content');
  const nextStepButtons = document.querySelectorAll('.next-step');
  const finishOnboardingButton = document.querySelector('.finish-onboarding');

  // Initialize onboarding wizard
  steps.forEach((step, index) => {
    step.addEventListener('click', () => {
      // Update aria-selected attribute
      steps.forEach((s) => s.setAttribute('aria-selected', 'false'));
      step.setAttribute('aria-selected', 'true');

      // Hide all step content
      stepContent.forEach((content) => content.hidden = true);

      // Show current step content
      stepContent[index].hidden = false;
    });
  });

  // Next step button click event
  nextStepButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      // Hide current step content
      stepContent[index].hidden = true;

      // Show next step content
      stepContent[index + 1].hidden = false;

      // Update aria-selected attribute
      steps.forEach((step, i) => {
        if (i === index + 1) {
          step.setAttribute('aria-selected', 'true');
        } else {
          step.setAttribute('aria-selected', 'false');
        }
      });
    });
  });

  // Finish onboarding button click event
  finishOnboardingButton.addEventListener('click', () => {
    // Hide onboarding wizard
    onboardingWizard.hidden = true;

    // Call API to complete onboarding
    fetch('/api/v1/onboarding/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error(error));
  });
</script>