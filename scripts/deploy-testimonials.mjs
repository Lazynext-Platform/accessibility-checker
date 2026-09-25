import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testimonialsPath = path.join(__dirname, '../marketing/testimonials');
const indexHtmlPath = path.join(__dirname, '../index.html');

const deployTestimonials = async () => {
  try {
    const testimonials = await fs.promises.readdir(testimonialsPath);
    const testimonialHtml = testimonials.map((testimonial) => {
      const testimonialContent = fs.readFileSync(path.join(testimonialsPath, testimonial), 'utf8');
      return `<blockquote>${testimonialContent}</blockquote>`;
    }).join('');

    const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
    const updatedIndexHtmlContent = indexHtmlContent.replace('<!-- TESTIMONIALS -->', testimonialHtml);

    await fs.promises.writeFile(indexHtmlPath, updatedIndexHtmlContent);
    console.log('Testimonials deployed successfully');
  } catch (error) {
    console.error('Error deploying testimonials:', error);
  }
};

deployTestimonials();