window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode") || "";
  const oobCode = decodeURIComponent(params.get("oobCode") || "");
  console.log("oobCode from URL:", oobCode);

  const verifyBlock = document.getElementById("verifyEmail");

  const resetBlock = document.getElementById("resetPassword");

  const invalidBlock = document.getElementById("invalid-block");
  console.log("mode: "+mode);

  
  if (mode == "verifyEmail") {
    verifyBlock.classList.remove("hidden");
    setTimeout(() => {
      window.location.href = "onbudget://verifyEmail";
    }, 2000);
  } else if (mode === "resetPassword") {
    resetBlock.classList.remove("hidden");
    window.oobCode = oobCode; // Store for later use
  } else {
    invalidBlock.classList.remove("hidden");
  }
});

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
