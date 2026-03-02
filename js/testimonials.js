(() => {
  const testimonialList = document.getElementById("testimonialsList");
  const testimonialData = window.DIB_TESTIMONIALS || [];

  if (testimonialList) {
    if (!testimonialData.length) {
      testimonialList.innerHTML = "<article class='testimonial-item'><p>No testimonials published yet.</p></article>";
    } else {
      testimonialList.innerHTML = testimonialData
        .map(
          (item) => `
            <article class="testimonial-item reveal in-view">
              <p>"${escapeHtml(item.comment)}"</p>
              <h3>${escapeHtml(item.name)}</h3>
              ${item.company ? `<span class="company">${escapeHtml(item.company)}</span>` : ""}
            </article>
          `
        )
        .join("");
    }
  }

  const openSubmissionBtn = document.getElementById("openSubmissionBtn");
  const submissionHint = document.getElementById("submissionHint");
  if (openSubmissionBtn && submissionHint) {
    openSubmissionBtn.addEventListener("click", (event) => {
      event.preventDefault();
      submissionHint.hidden = false;
    });
  }

  const blocked = document.getElementById("testimonialAccessBlocked");
  const formWrap = document.getElementById("testimonialFormWrap");
  const testimonialForm = document.getElementById("testimonialForm");

  if (testimonialForm && blocked && formWrap) {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token") || "";
    const allowed = (window.DIB_PRIVATE_TOKENS || []).includes(token);

    if (allowed) {
      blocked.hidden = true;
      formWrap.hidden = false;
      const tokenField = document.getElementById("tToken");
      if (tokenField) {
        tokenField.value = token;
      }
    }

    testimonialForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = testimonialForm.name.value.trim();
      const company = testimonialForm.company.value.trim();
      const comment = testimonialForm.comment.value.trim();
      const tokenValue = testimonialForm.token.value.trim();

      const subject = encodeURIComponent(`[Testimonial] ${name}`);
      const body = encodeURIComponent(
        `Token: ${tokenValue}\nName: ${name}\nCompany: ${company || "N/A"}\n\nComment:\n${comment}`
      );

      window.location.href = `mailto:rodgersmhlongo23@gmail.com?subject=${subject}&body=${body}`;

      let status = testimonialForm.querySelector(".form-status");
      if (!status) {
        status = document.createElement("p");
        status.className = "form-status";
        testimonialForm.appendChild(status);
      }
      status.textContent = "Your email app should open now. Thank you for the testimonial.";
    });
  }

  const tokenListEl = document.getElementById("allowedTokenList");
  const generateBtn = document.getElementById("generateToken");
  const generatedTokenEl = document.getElementById("generatedToken");
  const generatedLinkEl = document.getElementById("generatedLink");
  const copyLinkBtn = document.getElementById("copyLink");
  const adminBlocked = document.getElementById("adminBlocked");
  const adminPanel = document.getElementById("adminPanel");
  const adminSide = document.getElementById("adminSide");

  if (adminBlocked && adminPanel && adminSide) {
    const adminParam = new URLSearchParams(window.location.search).get("admin") || "";
    const adminKey = window.DIB_ADMIN_KEY || "";
    const access = adminKey && adminParam === adminKey;
    adminBlocked.hidden = access;
    adminPanel.hidden = !access;
    adminSide.hidden = !access;
  }

  if (tokenListEl) {
    const tokens = window.DIB_PRIVATE_TOKENS || [];
    tokenListEl.innerHTML = tokens.map((token) => `<li><code>${escapeHtml(token)}</code></li>`).join("") || "<li>No tokens set.</li>";
  }

  if (generateBtn && generatedTokenEl && generatedLinkEl) {
    generateBtn.addEventListener("click", () => {
      const labelInput = document.getElementById("clientName");
      const label = labelInput ? slugify(labelInput.value) : "client";
      const randomChunk = Math.random().toString(36).slice(2, 8);
      const token = `ray-${label}-${randomChunk}`;
      const url = `${window.location.origin}${window.location.pathname.replace("admin-testimonials.html", "submit-testimonial.html")}?token=${encodeURIComponent(token)}`;

      generatedTokenEl.value = token;
      generatedLinkEl.value = url;
    });
  }

  if (copyLinkBtn && generatedLinkEl) {
    copyLinkBtn.addEventListener("click", async () => {
      if (!generatedLinkEl.value) return;
      try {
        await navigator.clipboard.writeText(generatedLinkEl.value);
        copyLinkBtn.textContent = "Copied";
        setTimeout(() => {
          copyLinkBtn.textContent = "Copy Link";
        }, 1200);
      } catch (error) {
        copyLinkBtn.textContent = "Copy failed";
      }
    });
  }

  function slugify(value) {
    if (!value) return "client";
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 24) || "client";
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
