// formHandler.js
// Generic form submission handler for Tradedly static pages
//
// This script attaches submit handlers to both quick‑quote and full enquiry
// forms across the static pages. When a user submits a form the data is
// assembled into a JSON object, enriched with the current page URL, and
// posted to a Zapier webhook. If the submission succeeds the user is
// thanked and the form is reset; if it fails an error alert is shown.

document.addEventListener('DOMContentLoaded', function () {
  // Helper to serialise a form into a plain object
  function serialiseForm(form) {
    const data = {};
    const formData = new FormData(form);
    formData.forEach((value, key) => {
      data[key] = value;
    });
    data.page_url = window.location.href;
    return data;
  }

  // Post the data to Zapier (placeholder URL)
  function postToZapier(data) {
    // Send form submissions to the configured Zapier catch hook.  This URL
    // was provided by the user and should not be modified without updating
    // the Zapier integration. See README or docs for details.
    const url = 'https://hooks.zapier.com/hooks/catch/18199278/u2joewm/';
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      mode: 'no-cors',
    });
  }

  // Attach handlers to quick quote forms
  document.querySelectorAll('form.quote-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const data = serialiseForm(form);
      postToZapier(data)
        .then(() => {
          alert('Thanks! We will be in touch shortly.');
          form.reset();
        })
        .catch(() => {
          alert('Sorry, there was a problem submitting your request. Please try again later.');
        });
    });
  });

  // Attach handlers to enquiry forms
  document.querySelectorAll('form.enquiry-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const data = serialiseForm(form);
      postToZapier(data)
        .then(() => {
          alert('Thank you! Your enquiry has been received.');
          form.reset();
          // Close the modal if present
          const modal = form.closest('.modal');
          if (modal) {
            modal.style.display = 'none';
          }
        })
        .catch(() => {
          alert('Sorry, there was a problem submitting your enquiry. Please try again later.');
        });
    });
  });
});