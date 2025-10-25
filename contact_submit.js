// Small helper to submit #contactForm as JSON to contact.php
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type=submit]');
    if (submitBtn) submitBtn.disabled = true;

    const data = {
      name: form.elements['name']?.value || '',
      email: form.elements['email']?.value || '',
      message: form.elements['message']?.value || ''
    };

    try {
      const res = await fetch('contact.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (res.ok && json.success) {
        // simple UI feedback — you can replace with nicer UI
        alert('Message sent — thank you!');
        form.reset();
      } else {
        alert(json.error || 'Failed to send message');
      }
    } catch (err) {
      console.error(err);
      alert('Network or server error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});
