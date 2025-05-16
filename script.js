document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  const oobCode = urlParams.get('oobCode');
  
  // Store oobCode globally for password reset
  window.oobCode = oobCode;

  console.log("mode from URL:", mode);
  console.log("oobCode from URL:", oobCode);

  if (mode === 'verifyEmail') {
    document.getElementById('verifyEmail').classList.remove('hide');
    verifyEmail(oobCode);
  } else if (mode === 'resetPassword') {
    document.getElementById('resetPassword').classList.remove('hide');
  } else {
    document.getElementById('invalid-block').classList.remove('hide');
  }
});

function verifyEmail(oobCode) {
  const apiKey = "AIzaSyDhh2HBfL0-CLtSUoiVVeOhShFkeLPsgOQ"; // Consider moving this to a config
  fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      oobCode: oobCode
    }),
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => { throw err; });
    }
    return response.json();
  })
  .then(data => {
    const verifyEmailDiv = document.getElementById('verifyEmail');
    verifyEmailDiv.innerHTML = `
      <h1 class="text-2xl font-semibold text-[var(--primary)] mb-4">Email Verified Successfully!</h1>
      <p class="text-sm text-gray-500">You can now close this window and return to the app.</p>
    `;
  })
  .catch(error => {
    console.error('Verification error:', error);
    document.getElementById('verifyEmail').innerHTML = `
      <h1 class="text-2xl font-semibold text-red-600 mb-4">${error.error?.message || 'Verification Failed'}</h1>
      <p class="text-sm text-gray-500">${(error.error?.message || 'Please try again later.').replace(/_/g, ' ')}</p>
    `;
  });
}

function submitNewPassword() {
  const newPassword = document.getElementById("passwordInput").value;
  const resetStatus = document.getElementById("reset-status");
  
  // Clear previous status
  resetStatus.textContent = '';
  resetStatus.className = 'text-sm mt-2';

  // Validate password
  const failedValidations = validatePassword(newPassword);
  if (failedValidations.length > 0) {
    resetStatus.textContent = "Please fix password requirements";
    resetStatus.classList.add('text-red-600');
    return;
  }

  // Show loading state
  resetStatus.textContent = "Processing...";
  resetStatus.classList.add('text-gray-600');

  fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=AIzaSyDhh2HBfL0-CLtSUoiVVeOhShFkeLPsgOQ`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        oobCode: window.oobCode,
        newPassword: newPassword,
      }),
    }
  )
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => { throw err; });
    }
    return response.json();
  })
  .then(data => {
    resetStatus.textContent = "✅ Password successfully changed!";
    resetStatus.classList.remove('text-gray-600');
    resetStatus.classList.add('text-green-600');
    
    setTimeout(() => {
      try {
        window.location.href = "onbudget://password-reset";
      } catch (e) {
        console.log("Could not redirect to app, closing window");
        window.close();
      }
    }, 2000);
  })
  .catch(error => {
    console.error('Password reset error:', error);
    resetStatus.textContent = `❌ ${(error.error?.message || 'Something went wrong. Try again later.').replace(/_/g, " ")}`;
    resetStatus.classList.remove('text-gray-600');
    resetStatus.classList.add('text-red-600');
  });
}

// Password toggle functionality
const passwordInput = document.getElementById('passwordInput');
const hideIcon = document.getElementById('hideIcon');
const showIcon = document.getElementById('showIcon');

function togglePasswordVisibility() {
  const isHidden = passwordInput.type === 'password';
  passwordInput.type = isHidden ? 'text' : 'password';
  showIcon.classList.toggle('hide', !isHidden);
  hideIcon.classList.toggle('hide', isHidden);
}

// Validation criteria
const validations = {
  length: { regex: /^.{8,}$/, message: "At least 8 characters" },
  number: { regex: /[0-9]/, message: "At least 1 number" },
  special: { regex: /[!@#$%^&*(),.?":{}|<>]/, message: "At least 1 special character" },
  uppercase: { regex: /[A-Z]/, message: "At least 1 uppercase letter" },
  lowercase: { regex: /[a-z]/, message: "At least 1 lowercase letter" },
};

// Password validation display
passwordInput.addEventListener('input', () => {
  const password = passwordInput.value;
  const resultBox = document.getElementById('validationResults');
  resultBox.innerHTML = ''; // Clear previous

  Object.entries(validations).forEach(([key, { regex, message }]) => {
    const passed = regex.test(password);
    const item = document.createElement('div');
    item.textContent = (passed ? "✅ " : "❌ ") + message;
    item.style.color = passed ? "green" : "red";
    item.className = "text-sm";
    resultBox.appendChild(item);
  });
});

function validatePassword(password) {
  return Object.entries(validations)
    .filter(([key, { regex }]) => !regex.test(password))
    .map(([key, { message }]) => message);
}
