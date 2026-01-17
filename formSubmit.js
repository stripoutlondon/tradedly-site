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
  function postData(data) {
    // Updated endpoint to use the active Zapier webhook. If you prefer to use a
    // Google Apps Script instead of Zapier, replace this URL with your Apps
    // Script web app URL. Otherwise, keep it in sync with formHandler.js.
    const endpointUrl = 'https://hooks.zapier.com/hooks/catch/18199278/uw5lr6u/';
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
      postData(data)
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