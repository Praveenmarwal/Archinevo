// Submit #contactForm using Formsubmit.co so the form works on static hosts (GitHub Pages)
// To change recipient, replace the email in the endpoint below with your address.
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type=submit]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      // Use Formsubmit's AJAX endpoint. Replace contact@archinevo.in with your desired recipient.
      // Example endpoint: https://formsubmit.co/ajax/youremail@example.com
      const endpoint = 'https://formsubmit.co/ajax/contact@archinevo.in';

      // Send the form as FormData so Formsubmit accepts it.
      const formData = new FormData(form);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
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
