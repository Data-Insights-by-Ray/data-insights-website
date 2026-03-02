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
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const phone = contactForm.phone.value.trim();
      const service = contactForm.service.value;
      const message = contactForm.message.value.trim();

      const subject = encodeURIComponent(`[Booking Request] ${service || "General"} - ${name}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\n\nMessage:\n${message}`
      );

      window.location.href = `mailto:rodgersmhlongo23@gmail.com?subject=${subject}&body=${body}`;

      let status = contactForm.querySelector(".form-status");
      if (!status) {
        status = document.createElement("p");
        status.className = "form-status";
        contactForm.appendChild(status);
      }
      status.textContent = "Your email app should open now. If not, email rodgersmhlongo23@gmail.com directly.";
    });
  }
})();
