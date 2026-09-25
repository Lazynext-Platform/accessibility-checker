import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const indexHtmlPath = join(__dirname, '../index.html');

async function addTestimonial(testimonial) {
  try {
    const htmlContent = await fs.readFile(indexHtmlPath, 'utf8');
    const testimonialHtml = `
      <div class="testimonial">
        <p>${testimonial.quote}</p>
        <p>— ${testimonial.customerName}</p>
      </div>
    `;
    const updatedHtmlContent = htmlContent.replace('</body>', `${testimonialHtml}</body>`);
    await fs.writeFile(indexHtmlPath, updatedHtmlContent);
    console.log('Testimonial added successfully!');
  } catch (error) {
    console.error('Error adding testimonial:', error);
  }
}

async function main() {
  const newTestimonial = {
    quote: 'Accessibility Checker has been a game-changer for our small business!',
    customerName: 'John Doe, Owner of Example Inc.',
  };
  await addTestimonial(newTestimonial);
}

main();