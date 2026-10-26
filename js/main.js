document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav');
  const menuButton = document.querySelector('.menu-button');
  const navLinks = document.querySelector('.nav-links');

  if (nav && menuButton && navLinks) {
    menuButton.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.textContent = isOpen ? 'Close' : 'Menu';
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.textContent = 'Menu';
      });
    });
  }

  document.querySelectorAll('[data-event]').forEach((element) => {
    element.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('portfolio:interaction', {
        detail: { event: element.dataset.event, href: element.getAttribute('href') || null }
      }));
    });
  });

  const form = document.querySelector('#contactForm');
  if (!form) return;

  const success = document.querySelector('#cfSuccess');
  const error = document.querySelector('#cfError');
  const button = form.querySelector('button[type="submit"]');
  const buttonText = button?.querySelector('.cf-btn-text');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!button || !success || !error) return;

    const originalText = buttonText?.textContent || 'Send message';
    button.disabled = true;
    if (buttonText) buttonText.textContent = 'Sending…';
    success.textContent = '';
    error.textContent = '';

    const formData = new FormData(form);
    formData.append('access_key', '288907e9-dc2d-4c34-8070-b2f6e14af91b');
    formData.append('from_name', 'Lyubo Voynov portfolio');
    formData.append('subject', 'New role conversation enquiry');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData))
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Unable to send');

      success.textContent = 'Thanks — your message has been sent.';
      form.reset();
      window.dispatchEvent(new CustomEvent('portfolio:interaction', {
        detail: { event: 'contact_form_success' }
      }));
    } catch (error) {
      error.textContent = 'The form could not send. Please email ' + 'voynov.lyuboslav@gmail.com' + ' instead.';
    } finally {
      button.disabled = false;
      if (buttonText) buttonText.textContent = originalText;
    }
  });
});
