// File: script.js
// Load testimonials from the API and display them on the page
async function loadTestimonials() {
  try {
    const response = await fetch('/api/testimonials');
    const testimonials = await response.json();
    const testimonialContainer = document.querySelector('.testimonial-container');
    testimonialContainer.innerHTML = '';
    testimonials.forEach((testimonial) => {
      const testimonialHTML = `
        <div class="testimonial">
          <p>${testimonial.testimonial}</p>
          <p>- ${testimonial.name}</p>
        </div>
      `;
      testimonialContainer.insertAdjacentHTML('beforeend', testimonialHTML);
    });
  } catch (error) {
    console.error('Error loading testimonials:', error);
  }
}

// Load more testimonials when the button is clicked
document.getElementById('load-more-testimonials').addEventListener('click', loadTestimonials);

// Submit a new testimonial when the form is submitted
document.getElementById('testimonial-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const name = document.getElementById('name').value;
    const testimonial = document.getElementById('testimonial').value;
    const response = await fetch('/api/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, testimonial }),
    });
    const newTestimonial = await response.json();
    loadTestimonials(); // Reload the testimonials to include the new one
  } catch (error) {
    console.error('Error submitting testimonial:', error);
  }
});

// Initialize the testimonials section
loadTestimonials();