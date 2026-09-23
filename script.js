<!-- File: index.html -->
<section id="whats-new" class="section">
  <h2>What's New</h2>
  <ul>
    <!-- List of updates will be populated dynamically -->
  </ul>
</section>

<script>
  // File: script.js
  const whatsNewSection = document.getElementById('whats-new');
  const updatesList = whatsNewSection.querySelector('ul');

  // Fetch updates from API
  fetch('/api/updates')
    .then(response => response.json())
    .then(data => {
      data.forEach(update => {
        const listItem = document.createElement('LI');
        listItem.textContent = update.description;
        updatesList.appendChild(listItem);
      });
    })
    .catch(error => console.error('Error fetching updates:', error));
</script>