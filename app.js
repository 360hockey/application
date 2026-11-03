
(() => {
  const form = document.getElementById("applicationForm");
  const submitButton = document.getElementById("submitButton");
  const message = document.getElementById("formMessage");

  const optionalLinkFields = [
    form.elements.eliteProspectsLink,
    form.elements.videoHighlightsLink
  ];

  function addDefaultProtocol(input) {
    const value = input.value.trim();
    if (!value) return;
    // Accept www.example.com or example.com and normalize it to a valid URL.
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(value)) {
      input.value = `https://${value}`;
    }
  }

  optionalLinkFields.forEach((input) => {
    input.addEventListener("blur", () => {
      addDefaultProtocol(input);
      input.setCustomValidity("");
    });
  });

  function showMessage(text, type) {
    message.textContent = text;
    message.className = `form-message show ${type}`;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.className = "form-message";
    optionalLinkFields.forEach(addDefaultProtocol);
    if (!form.reportValidity()) return;

    const endpoint = window.SPRING_HOCKEY_CONFIG?.GOOGLE_SCRIPT_URL || "";
    if (!endpoint || endpoint.includes("PASTE_YOUR")) {
      showMessage("The application form is not connected yet. Please contact the program administrator.", "error");
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    if (data.companyWebsite) return;
    delete data.companyWebsite;

    submitButton.disabled = true;
    submitButton.querySelector("span").textContent = "SUBMITTING...";
    try {
      // Apps Script ContentService redirects; no-cors allows the browser to hand off the POST.
      // The browser cannot inspect Google's response body, so verify the first test row in Sheets.
      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data)
      });
      form.reset();
      showMessage("Thank you! Your application submission was sent. The hockey program will follow up using the contact information provided.", "success");
    } catch (error) {
      showMessage("We couldn't send your application. Please check your internet connection and try again, or contact the hockey program.", "error");
    } finally {
      submitButton.disabled = false;
      submitButton.querySelector("span").textContent = "SUBMIT APPLICATION";
    }
  });
})();
