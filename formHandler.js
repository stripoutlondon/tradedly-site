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

  /**
   * Transform generic form field names into the names expected by the Zapier
   * automation. The quote forms on this site use simple names such as
   * "name", "email", "phone", "postcode", "service" and
   * "date_needed". However, the Zap that records leads into the Google
   * Sheet expects fields with longer labels like "Data Contact Name First"
   * and "Data Field When Do You Need It Removed?". This helper maps our
   * simple keys onto the Zap's expected keys. Keys that are already in
   * Zapier's format are left untouched, so the function is idempotent.
   *
   * @param {Object} data A plain object containing form data
   * @returns {Object} A new object with the original keys plus the mapped keys
   */
  function transformForZapier(data) {
    const mapped = { ...data };
    // Map contact name
    if (data.name && !data['Data Contact Name First']) {
      mapped['Data Contact Name First'] = data.name;
    }
    // Map email address
    if (data.email && !data['Data Contact Email']) {
      mapped['Data Contact Email'] = data.email;
    }
    // Map phone number (optional)
    if (data.phone && !data['Data Contact Phone']) {
      mapped['Data Contact Phone'] = data.phone;
    }
    // Map postcode/city to the address field used in the Zap
    const postcodeValue = data.postcode || data.city || data.postcode_city;
    if (postcodeValue && !data['Data Field Address Eeed']) {
      mapped['Data Field Address Eeed'] = postcodeValue;
    }
    // Map selected service
    if (data.service && !data['Data Field Select A Service']) {
      mapped['Data Field Select A Service'] = data.service;
    }
    // Map date needed (the date picker) to the corresponding question
    if (data.date_needed && !data['Data Field When Do You Need It Removed?']) {
      mapped['Data Field When Do You Need It Removed?'] = data.date_needed;
    }
    return mapped;
  }

  // Post the data to Zapier
  function postToZapier(data) {
    // Replace the placeholder URL with the active Zapier catch hook for your
    // "Tradedly.com – Website Form Completed" Zap. This should match the
    // catch hook shown in Zapier (u2joewm as of Jan 2026). If you create a
    // new Zap or update the existing one, update this URL accordingly.
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
      // Map our generic field names to those expected by the Zap
      const payload = transformForZapier(data);
      postToZapier(payload)
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
      // Transform field names before submitting to Zapier
      const payload = transformForZapier(data);
      postToZapier(payload)
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