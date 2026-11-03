(() => {
  const form = document.getElementById("applicationForm");
  const yearSelect = form.elements.birthYear;
  const submitButton = document.getElementById("submitButton");
  const message = document.getElementById("formMessage");
  const currentYear = new Date().getFullYear();

  // Broad birth-year range; adjust if your spring program uses a narrower age group.
  for (let year = currentYear - 19; year <= currentYear - 8; year++) {
    const option = document.createElement("option");
    option.value = String(year);
    option.textContent = String(year);
    yearSelect.appendChild(option);
  }

  function showMessage(text, type) {
    message.textContent = text;
    message.className = `form-message show ${type}`;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.className = "form-message";
    if (!form.reportValidity()) return;

    const endpoint = window.SPRING_HOCKEY_CONFIG?.GOOGLE_SCRIPT_URL || "";
    if (!endpoint || endpoint.includes("PASTE_YOUR")) {
      showMessage("The application form is not connected yet. Please contact the program administrator.", "error");
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    if (data.companyWebsite) return; // Quietly discard bot submissions.
    delete data.companyWebsite;

    submitButton.disabled = true;
    submitButton.querySelector("span").textContent = "SUBMITTING...";
    try {
      // Apps Script accepts a text/plain POST. no-cors is used because Google's
      // ContentService response does not expose readable CORS headers to GitHub Pages.
      // The browser cannot inspect Google's response in no-cors mode.
      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data)
      });
      form.reset();
      showMessage("Thank you! Your submission request was sent. The hockey program will follow up using the contact information provided.", "success");
    } catch (error) {
      showMessage("We couldn't send your application. Please check your internet connection and try again, or contact the hockey program.", "error");
    } finally {
      submitButton.disabled = false;
      submitButton.querySelector("span").textContent = "SUBMIT APPLICATION";
    }
  });
})();
