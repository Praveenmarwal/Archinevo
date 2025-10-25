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
    const alertEl = document.getElementById('contactAlert');
    const showAlert = (type, msg) => {
      if (!alertEl) {
        // fallback to native alert
        alert(msg);
        return;
      }
      alertEl.innerHTML = `<div class="alert alert-${type} alert-dismissible" role="alert">` +
        `${msg}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
    };

    if (submitBtn) submitBtn.disabled = true;

    try {
      // Use the form's action so the same code works locally or on any host
      const action = (form.action || '').trim();

      // If the action points to Formsubmit, use Formsubmit's AJAX endpoint and send FormData
      const isFormsubmit = action.includes('formsubmit.co');

      let res;
      if (isFormsubmit) {
        // build AJAX endpoint: https://formsubmit.co/ajax/youremail@example.com
        // action is expected like https://formsubmit.co/youremail@example.com
        const emailPart = action.replace(/https?:\/\//i, '').replace(/formsubmit\.co\//i, '');
        const ajaxEndpoint = 'https://formsubmit.co/ajax/' + emailPart;

        const formData = new FormData(form);
        // Formsubmit expects FormData (do not set Content-Type header)
        res = await fetch(ajaxEndpoint, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData
        });
      } else {
        // default: send JSON to server-side endpoint (e.g., contact.php)
        const endpoint = action || '/contact.php';
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      let json = {};
      try { json = await res.json(); } catch (e) { /* ignore parse errors */ }

      if (res.ok && (json.success || res.status === 200)) {
        showAlert('success', 'Message sent — thank you!');
        form.reset();
      } else {
        console.error('Server error:', json);
        const errMsg = json.error || json.message || 'Failed to send message';
        showAlert('danger', errMsg);
      }
    } catch (err) {
      console.error(err);
      showAlert('danger', 'Network or server error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});
