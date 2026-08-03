/* Login page — Heard Guest
   Prototype: no backend. Form validates locally and simulates sign-in. */

document.addEventListener('DOMContentLoaded', function () {
  var app = document.getElementById('app');
  var form = document.getElementById('login-form');
  var emailInput = document.getElementById('email');
  var emailField = document.getElementById('email-field');
  var passwordInput = document.getElementById('password');
  var passwordField = document.getElementById('password-field');
  var passwordToggle = document.getElementById('password-toggle');
  var submitBtn = document.getElementById('submit-btn');
  var toastRegion = document.getElementById('toast-region');

  /* --- Density switching ---
     Guest phone → comfortable, Guest desktop → compact. */
  var mql = window.matchMedia('(min-width: 768px)');
  function updateDensity(e) {
    app.classList.remove('density-comfortable', 'density-compact');
    app.classList.add(e.matches ? 'density-compact' : 'density-comfortable');
  }
  mql.addEventListener('change', updateDensity);
  updateDensity(mql);

  /* --- Password visibility toggle --- */
  passwordToggle.addEventListener('click', function () {
    var isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    passwordToggle.classList.toggle('is-visible', isHidden);
    passwordToggle.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    passwordToggle.setAttribute('aria-pressed', String(isHidden));
  });

  /* --- Clear errors on input --- */
  function clearError(field, input) {
    field.classList.remove('rail-input--error');
    var helper = field.querySelector('.rail-input__helper--error');
    if (helper) helper.remove();
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
  }

  emailInput.addEventListener('input', function () {
    clearError(emailField, emailInput);
  });

  passwordInput.addEventListener('input', function () {
    clearError(passwordField, passwordInput);
  });

  /* --- Show an error helper on a field --- */
  function showError(field, input, helperId, message) {
    clearError(field, input);
    field.classList.add('rail-input--error');
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', helperId);

    var helper = document.createElement('span');
    helper.className = 'rail-input__helper rail-input__helper--error';
    helper.id = helperId;
    helper.textContent = message;
    field.appendChild(helper);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  /* --- Form submit --- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var hasError = false;
    var emailValue = emailInput.value.trim();
    var passwordValue = passwordInput.value;

    if (!emailValue) {
      showError(emailField, emailInput, 'email-error', 'Please enter your email.');
      hasError = true;
    } else if (!isValidEmail(emailValue)) {
      showError(emailField, emailInput, 'email-error', 'Please enter a valid email address.');
      hasError = true;
    }

    if (!passwordValue) {
      showError(passwordField, passwordInput, 'password-error', 'Please enter your password.');
      hasError = true;
    }

    if (hasError) return;

    /* Simulate sign-in */
    submitBtn.classList.add('rail-button--loading');
    submitBtn.setAttribute('disabled', '');
    submitBtn.innerHTML = '<span class="rail-button__spinner" aria-hidden="true"></span> Signing in…';

    setTimeout(function () {
      submitBtn.classList.remove('rail-button--loading');
      submitBtn.removeAttribute('disabled');
      submitBtn.textContent = 'Sign in';
      showToast('success', 'Welcome back!');
    }, 1500);
  });

  /* --- Toast --- */
  var iconMap = {
    success: 'check',
    error: 'alert-circle',
    info: 'info',
    warning: 'alert-triangle'
  };

  function showToast(type, message) {
    var toast = document.createElement('div');
    toast.className = 'rail-toast rail-toast--' + type;
    toast.setAttribute('role', 'alert');

    toast.innerHTML =
      '<div class="rail-toast__icon" aria-hidden="true">' +
        '<i data-lucide="' + (iconMap[type] || 'info') + '"></i>' +
      '</div>' +
      '<div class="rail-toast__content">' +
        '<span class="rail-toast__message">' + message + '</span>' +
      '</div>' +
      '<button class="rail-toast__dismiss" aria-label="Dismiss">&times;</button>';

    toastRegion.appendChild(toast);
    if (typeof lucide !== 'undefined') lucide.createIcons();

    function dismiss() {
      toast.classList.add('rail-toast--exiting');
      setTimeout(function () { toast.remove(); }, 300);
    }

    toast.querySelector('.rail-toast__dismiss').addEventListener('click', dismiss);
    setTimeout(dismiss, 4000);
  }
});
