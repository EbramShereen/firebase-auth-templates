class AuthComponent {
  constructor() {
    this.validations = {
      length: { regex: /^.{8,}$/, message: "At least 8 characters" },
      number: { regex: /[0-9]/, message: "At least 1 number" },
      special: { regex: /[!@#$%^&*(),.?":{}|<>]/, message: "At least 1 special character" },
      uppercase: { regex: /[A-Z]/, message: "At least 1 uppercase letter" },
      lowercase: { regex: /[a-z]/, message: "At least 1 lowercase letter" },
    };
    
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => this.setup());
  }

  setup() {
    // Initialize password fields and icons
    this.initPasswordFields();
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const oobCode = urlParams.get('oobCode');
    
    // Store oobCode globally for password reset
    window.oobCode = oobCode;

    // Show appropriate view based on mode
    this.showView(mode, oobCode);
    
    // Set up event listeners
    this.setupEventListeners();
  }

  initPasswordFields() {
    // Set initial password field types
    document.getElementById('passwordInput').type = 'password';
    document.getElementById('confirmPasswordInput').type = 'password';
    
    // Initially show hide icons (eye slashed) and hide show icons
    document.getElementById('showIcon1').classList.add('hide');
    document.getElementById('hideIcon1').classList.remove('hide');
    
    document.getElementById('showIcon2').classList.add('hide');
    document.getElementById('hideIcon2').classList.remove('hide');
  }

  showView(mode, oobCode) {
    if (mode === 'verifyEmail') {
      document.getElementById('verifyEmail').classList.remove('hide');
      this.verifyEmail(oobCode);
    } else if (mode === 'resetPassword') {
      document.getElementById('resetPassword').classList.remove('hide');
    } else {
      document.getElementById('invalid-block').classList.remove('hide');
    }
  }

  setupEventListeners() {
    document.getElementById('passwordInput').addEventListener('input', () => {
      this.validatePasswordRequirements();
      this.validatePasswordMatch();
    });
    
    document.getElementById('confirmPasswordInput').addEventListener('input', () => {
      this.validatePasswordMatch();
    });
  }

  togglePasswordVisibility(inputId, showIconId, hideIconId) {
    const passwordInput = document.getElementById(inputId);
    const showIcon = document.getElementById(showIconId);
    const hideIcon = document.getElementById(hideIconId);
    
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    
    showIcon.classList.toggle('hide', !isHidden);
    hideIcon.classList.toggle('hide', isHidden);
  }

  validatePasswordRequirements() {
    const password = document.getElementById("passwordInput").value;
    const resultBox = document.getElementById('validatePasswordResults');
    
    resultBox.innerHTML = '';

    Object.entries(this.validations).forEach(([key, { regex, message }]) => {
      const passed = regex.test(password);
      const item = document.createElement('div');
      item.textContent = (passed ? "✅ " : "❌ ") + message;
      item.className = passed ? "validation-message validation-success" : "validation-message validation-error";
      resultBox.appendChild(item);
    });
  }

  validatePasswordMatch() {
    const password = document.getElementById("passwordInput").value;
    const confirmPassword = document.getElementById("confirmPasswordInput").value;
    const resultBox = document.getElementById('validateConfirmResults');
    
    resultBox.innerHTML = '';

    if (password && confirmPassword) {
      const matchItem = document.createElement('div');
      const passed = password === confirmPassword;
      matchItem.textContent = passed ? "✅ Passwords match" : "❌ Passwords do not match";
      matchItem.className = passed ? "validation-message validation-success" : "validation-message validation-error";
      resultBox.appendChild(matchItem);
    }
  }

  verifyEmail(oobCode) {
    const apiKey = "AIzaSyDhh2HBfL0-CLtSUoiVVeOhShFkeLPsgOQ";
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
        <h1 class="text-2xl font-semibold text-primary mb-4">Email Verified Successfully!</h1>
        <p class="text-sm text-gray-500">You can now close this window and return to the app.</p>
      `;
    })
    .catch(error => {
      console.error('Verification error:', error);
      document.getElementById('verifyEmail').innerHTML = `
        <h1 class="text-2xl font-semibold text-error mb-4">${error.error?.message || 'Verification Failed'}</h1>
        <p class="text-sm text-gray-500">${(error.error?.message || 'Please try again later.').replace(/_/g, ' ')}</p>
      `;
    });
  }

  submitNewPassword() {
    const newPassword = document.getElementById("passwordInput").value;
    const confirmPassword = document.getElementById("confirmPasswordInput").value;
    const resetStatus = document.getElementById("reset-status");
    
    // Clear previous status
    resetStatus.textContent = '';
    resetStatus.className = 'status-message';

    // Validate password requirements
    const requirementErrors = Object.entries(this.validations)
      .filter(([key, { regex }]) => !regex.test(newPassword))
      .map(([key, { message }]) => message);

    if (requirementErrors.length > 0) {
      resetStatus.textContent = "Please fix password requirements";
      resetStatus.classList.add('validation-error');
      return;
    }

    // Validate password match
    if (newPassword !== confirmPassword) {
      resetStatus.textContent = "❌ Passwords do not match";
      resetStatus.classList.add('validation-error');
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
      resetStatus.classList.add('validation-success');
      
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
      resetStatus.classList.add('validation-error');
    });
  }
}

// Initialize the component
const authComponent = new AuthComponent();

// Make methods available globally
function togglePasswordVisibility(inputId, showIconId, hideIconId) {
  authComponent.togglePasswordVisibility(inputId, showIconId, hideIconId);
}

function submitNewPassword() {
  authComponent.submitNewPassword();
}