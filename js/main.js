(() => {
  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      siteNav.classList.toggle("open");
    });
  }

  const revealItems = document.querySelectorAll(".reveal");
  if (revealItems.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach((item) => observer.observe(item));
  }

  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    const submitButton = contactForm.querySelector("button[type='submit']");
    const endpoint = "https://formsubmit.co/ajax/rodgersmhlongo23@gmail.com";

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const phone = contactForm.phone.value.trim();
      const service = contactForm.service.value;
      const message = contactForm.message.value.trim();

      let status = contactForm.querySelector(".form-status");
      if (!status) {
        status = document.createElement("p");
        status.className = "form-status";
        contactForm.appendChild(status);
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      status.textContent = "";
      status.classList.remove("error");

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            service,
            message,
            _subject: `[Booking Request] ${service || "General"} - ${name}`,
            _captcha: "false"
          })
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        status.textContent = "Request sent successfully. Ray will reply manually.";
        contactForm.reset();
      } catch (error) {
        status.textContent = "Could not send from the site right now. Please email rodgersmhlongo23@gmail.com directly.";
        status.classList.add("error");
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Send Email Request";
        }
      }
    });
  }
})();
