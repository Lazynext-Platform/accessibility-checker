// File: script.js
// Add JavaScript code to make the testimonial section interactive
const testimonials = document.querySelectorAll('.testimonial');

testimonials.forEach((testimonial) => {
  testimonial.addEventListener('click', () => {
    // Add a class to highlight the selected testimonial
    testimonial.classList.toggle('active');
  });
});