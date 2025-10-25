// Submit #contactForm using Formsubmit.co so the form works on static hosts (GitHub Pages)
// To change recipient, replace the email in the endpoint below with your address.
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contactForm');
  if (!form) return;
  // Only attach AJAX handler when the form explicitly opts-in via data-ajax="true"
  // This lets static form submissions (normal POST) work without JS (avoids CORS/AJAX issues).
  if (form.dataset.ajax !== 'true') return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type=submit]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      // Use Formsubmit's AJAX endpoint. Replace contact@archinevo.in with your desired recipient.
      // Example endpoint: https://formsubmit.co/ajax/youremail@example.com
      const endpoint = 'https://praveenmarwal.github.io/Archinevo/contact.php'; // or 'https://example.com/contact.php'

      // Send the form as FormData so Formsubmit accepts it.
      const formData = new FormData(form);
      const { name, email, message, subject } = Object.fromEntries(formData);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, subject })
      });

      const json = await res.json();
      if (res.ok) {
        alert('Message sent — thank you!');
        form.reset();
      } else {
        console.error('Formsubmit error:', json);
        alert(json.message || 'Failed to send message');
      }
    } catch (err) {
      console.error(err);
      alert('Network or server error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});
