// formSubmit.js
// This script submits form data to a Google Apps Script (or other API) endpoint.
// Configure the `endpointUrl` below with the URL of your Apps Script Web App or
// other serverless function. See README for instructions on deploying an Apps
// Script to collect form submissions in Google Sheets.

document.addEventListener('DOMContentLoaded', function () {
  /**
   * Convert a form element to a plain object of key/value pairs. Adds the
   * current page URL so your backend knows which page the submission came from.
   * @param {HTMLFormElement} form
   * @returns {Object} serialised form data
   */
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
   * Post data to the configured endpoint. Uses fetch with JSON body.
   * Replace the URL below with your actual endpoint.
   * @param {Object} data
   * @returns {Promise<Response>}
   */
  /**
   * Map simple form field names to the names required by the Zapier
   * automation. See the comments in formHandler.js for details on
   * why this is necessary. If you are using Google Apps Script or a
   * different endpoint, you can adjust this mapping accordingly or
   * remove it altogether.
   *
   * @param {Object} data
   * @returns {Object}
   */
  function transformForZapier(data) {
    const mapped = { ...data };
    if (data.name && !data['Data Contact Name First']) {
      mapped['Data Contact Name First'] = data.name;
    }
    if (data.email && !data['Data Contact Email']) {
      mapped['Data Contact Email'] = data.email;
    }
    if (data.phone && !data['Data Contact Phone']) {
      mapped['Data Contact Phone'] = data.phone;
    }
    const postcodeValue = data.postcode || data.city || data.postcode_city;
    if (postcodeValue && !data['Data Field Address Eeed']) {
      mapped['Data Field Address Eeed'] = postcodeValue;
    }
    if (data.service && !data['Data Field Select A Service']) {
      mapped['Data Field Select A Service'] = data.service;
    }
    if (data.date_needed && !data['Data Field When Do You Need It Removed?']) {
      mapped['Data Field When Do You Need It Removed?'] = data.date_needed;
    }
    return mapped;
  }

  function postData(data) {
    // Active Zapier webhook catch hook (u2joewm). Keep this in sync with
    // formHandler.js to ensure data is sent to the correct Zap. If you
    // switch to a Google Apps Script or another endpoint, update this URL.
    const endpointUrl = 'https://hooks.zapier.com/hooks/catch/18199278/u2joewm/';
    return fetch(endpointUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      mode: 'no-cors', // no-cors hides the response but prevents CORS errors
    });
  }

  /**
   * Attach submit handlers to all forms with class `.quote-form` or `.enquiry-form`.
   */
  document.querySelectorAll('form.quote-form, form.enquiry-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const data = serialiseForm(form);
      const payload = transformForZapier(data);
      postData(payload)
        .then(() => {
          // Display a friendly success message
          alert('Thank you! We have received your request and will be in touch soon.');
          form.reset();
          // If the form lives in a modal, close it
          const modal = form.closest('.modal');
          if (modal) {
            modal.style.display = 'none';
          }
        })
        .catch(() => {
          // Display a generic error message
          alert('Sorry, there was a problem submitting your request. Please try again later.');
        });
    });
  });
});