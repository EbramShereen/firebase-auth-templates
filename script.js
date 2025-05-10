document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  const oobCode = urlParams.get('oobCode');

  console.log("mode from URL:", mode);
  console.log("oobCode from URL:", oobCode);

  if (mode === 'verifyEmail') {
    document.getElementById('verifyEmail').classList.remove('hide');
    verifyEmail(oobCode, apiKey);
  } else if (mode === 'resetPassword') {
    document.getElementById('resetPassword').classList.remove('hide');
    // optionally validate oobCode here before showing the reset form
  } else {
    document.getElementById('invalid-block').classList.remove('hide');
  }
});

function verifyEmail(oobCode, apiKey) {
  fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      oobCode: oobCode
    }),
  })
  .then(response => response.json())
  .then(data => {
    const verifyEmailDiv = document.getElementById('verifyEmail');
    if (data.error) {
      verifyEmailDiv.innerHTML = `
        <h1 class="text-2xl font-semibold text-red-600 mb-4">Verification Failed</h1>
        <p class="text-sm text-gray-500">${data.error.message.replace(/_/g, ' ')}</p>
      `;
    } else {
      verifyEmailDiv.innerHTML = `
        <h1 class="text-2xl font-semibold text-[var(--primary)] mb-4">Email Verified Successfully!</h1>
        <p class="text-sm text-gray-500">You can now close this window and return to the app.</p>
      `;
    }
  })
  .catch(error => {
    document.getElementById('verifyEmail').innerHTML = `
      <h1 class="text-2xl font-semibold text-red-600 mb-4">Verification Error</h1>
      <p class="text-sm text-gray-500">Please try again later.</p>
    `;
  });
}

function submitNewPassword() {
  const newPassword = document.getElementById("new-password").value;
  const resetStatus = document.getElementById("reset-status");

  const failed = validatePassword(newPassword);

  if (failed.length > 0) {
    return; // 🚫 Don't make the request
  }

  // ✅ All validations passed, proceed
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
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        resetStatus.innerText = `❌ ${data.error.message.replace(/_/g, " ")}`;
      } else {
        resetStatus.innerText = "✅ Password successfully changed!";
        setTimeout(() => {
          window.location.href = "onbudget://password-reset";
        }, 2000);
      }
    })
    .catch(() => {
      resetStatus.innerText = "❌ Something went wrong. Try again later.";
    });
}

const passwordInput = document.getElementById('passwordInput');
const hideIcon = document.getElementById('hideIcon');
const showIcon = document.getElementById('showIcon');

// Validation criteria
const validations = {
  length: { regex: /^.{8,}$/, message: "At least 8 characters" },
  number: { regex: /[0-9]/, message: "At least 1 number" },
  special: { regex: /[!@#$%^&*(),.?":{}|<>]/, message: "At least 1 special character" },
  uppercase: { regex: /[A-Z]/, message: "At least 1 uppercase letter" },
  lowercase: { regex: /[a-z]/, message: "At least 1 lowercase letter" },
};
function validatePassword(password) {
  return [
    { regex: /.{8,}/, error: "❌ At least 8 characters" },
    { regex: /[0-9]/, error: "❌ At least 1 number" },
    { regex: /[!@#$%^&*(),.?":{}|<>]/, error: "❌ At least 1 special character" },
    { regex: /[A-Z]/, error: "❌ At least 1 uppercase letter" },
    { regex: /[a-z]/, error: "❌ At least 1 lowercase letter" }
  ].filter(rule => !rule.regex.test(password)); // Return failed validations
}

// Password toggle
function togglePasswordVisibility() {
  const isHidden = passwordInput.type === 'password';
  passwordInput.type = isHidden ? 'text' : 'password';
  showIcon.classList.toggle('hide', isHidden);
  hideIcon.classList.toggle('hide', !isHidden);
}

// Password validation
passwordInput.addEventListener('input', () => {
  const password = passwordInput.value;
  const resultBox = document.getElementById('validationResults');
  resultBox.innerHTML = ''; // Clear previous

  Object.entries(validations).forEach(([key, { regex, message }]) => {
    const passed = regex.test(password);
    const item = document.createElement('div');
    item.textContent = (passed ? "✅ " : "❌ ") + message;
    item.style.color = passed ? "green" : "red";
    resultBox.appendChild(item);
  });
});
function isPasswordValid(password) {
  return Object.values(validations).every(({ regex }) => regex.test(password));
}
