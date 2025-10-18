// Form handling for MU Online Website

// Form validation rules
const ValidationRules = {
    username: {
        required: true,
        minLength: 3,
        maxLength: 20,
        pattern: /^[a-zA-Z0-9_]+$/,
        message: 'Tên đăng nhập phải từ 3-20 ký tự, chỉ chứa chữ, số và dấu gạch dưới'
    },
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Email không đúng định dạng'
    },
    password: {
        required: true,
        minLength: 6,
        maxLength: 50,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        message: 'Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số'
    },
    confirmPassword: {
        required: true,
        matchField: 'password',
        message: 'Mật khẩu xác nhận không khớp'
    },
    terms: {
        required: true,
        message: 'Bạn phải đồng ý với điều khoản sử dụng'
    }
};

// Form handler class
class FormHandler {
    constructor() {
        this.init();
    }

    init() {
        this.initRegisterForm();
        this.initLoginForm();
        this.initFormSwitching();
        this.initRealTimeValidation();
    }

    // Initialize registration form
    initRegisterForm() {
        const registerForm = document.getElementById('registerForm');
        if (!registerForm) return;

        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegistration(registerForm);
        });
    }

    // Initialize login form
    initLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) return;

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(loginForm);
        });
    }

    // Initialize form switching
    initFormSwitching() {
        const showLoginBtn = document.getElementById('showLogin');
        const showRegisterBtn = document.getElementById('showRegister');
        const registerContainer = document.querySelector('.register-form-container');
        const loginContainer = document.querySelector('.login-form-container');

        if (showLoginBtn && showRegisterBtn && registerContainer && loginContainer) {
            showLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchToLogin(registerContainer, loginContainer);
            });

            showRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchToRegister(registerContainer, loginContainer);
            });
        }
    }

    // Initialize real-time validation
    initRealTimeValidation() {
        const inputs = document.querySelectorAll('input[name]');

        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    // Handle registration
    async handleRegistration(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Validate all fields
        const isValid = this.validateForm(form);
        if (!isValid) return;

        // Show loading state
        this.setFormLoading(form, true);

        try {
            // Simulate API call
            await this.submitRegistration(data);
            this.showSuccess('Đăng ký thành công! Chào mừng bạn đến với MU Online!');
            form.reset();
        } catch (error) {
            this.showError('Đăng ký thất bại: ' + error.message);
        } finally {
            this.setFormLoading(form, false);
        }
    }

    // Handle login
    async handleLogin(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Basic validation
        if (!data.loginUsername || !data.loginPassword) {
            this.showError('Vui lòng nhập đầy đủ thông tin đăng nhập');
            return;
        }

        // Show loading state
        this.setFormLoading(form, true);

        try {
            // Simulate API call
            await this.submitLogin(data);
            this.showSuccess('Đăng nhập thành công! Chào mừng bạn trở lại!');
        } catch (error) {
            this.showError('Đăng nhập thất bại: ' + error.message);
        } finally {
            this.setFormLoading(form, false);
        }
    }

    // Validate entire form
    validateForm(form) {
        const inputs = form.querySelectorAll('input[name]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // Validate individual field
    validateField(input) {
        const fieldName = input.name;
        const value = input.value.trim();
        const rules = ValidationRules[fieldName];

        if (!rules) return true;

        // Clear previous error
        this.clearFieldError(input);

        // Required validation
        if (rules.required && !value) {
            this.showFieldError(input, 'Trường này là bắt buộc');
            return false;
        }

        if (!value) return true; // Skip other validations if field is empty and not required

        // Length validation
        if (rules.minLength && value.length < rules.minLength) {
            this.showFieldError(input, `Tối thiểu ${rules.minLength} ký tự`);
            return false;
        }

        if (rules.maxLength && value.length > rules.maxLength) {
            this.showFieldError(input, `Tối đa ${rules.maxLength} ký tự`);
            return false;
        }

        // Pattern validation
        if (rules.pattern && !rules.pattern.test(value)) {
            this.showFieldError(input, rules.message);
            return false;
        }

        // Match field validation
        if (rules.matchField) {
            const matchInput = input.form.querySelector(`[name="${rules.matchField}"]`);
            if (matchInput && value !== matchInput.value) {
                this.showFieldError(input, rules.message);
                return false;
            }
        }

        // Checkbox validation
        if (input.type === 'checkbox' && rules.required && !input.checked) {
            this.showFieldError(input, rules.message);
            return false;
        }

        return true;
    }

    // Show field error
    showFieldError(input, message) {
        input.classList.add('error');
        const messageElement = input.parentNode.querySelector('.form-message');
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.style.display = 'block';
        }
    }

    // Clear field error
    clearFieldError(input) {
        input.classList.remove('error');
        const messageElement = input.parentNode.querySelector('.form-message');
        if (messageElement) {
            messageElement.textContent = '';
            messageElement.style.display = 'none';
        }
    }

    // Switch to login form
    switchToLogin(registerContainer, loginContainer) {
        registerContainer.style.display = 'none';
        loginContainer.style.display = 'block';

        // Add animation
        loginContainer.style.opacity = '0';
        loginContainer.style.transform = 'translateY(20px)';

        setTimeout(() => {
            loginContainer.style.transition = 'all 0.3s ease';
            loginContainer.style.opacity = '1';
            loginContainer.style.transform = 'translateY(0)';
        }, 10);
    }

    // Switch to register form
    switchToRegister(registerContainer, loginContainer) {
        loginContainer.style.display = 'none';
        registerContainer.style.display = 'block';

        // Add animation
        registerContainer.style.opacity = '0';
        registerContainer.style.transform = 'translateY(20px)';

        setTimeout(() => {
            registerContainer.style.transition = 'all 0.3s ease';
            registerContainer.style.opacity = '1';
            registerContainer.style.transform = 'translateY(0)';
        }, 10);
    }

    // Set form loading state
    setFormLoading(form, isLoading) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const inputs = form.querySelectorAll('input');

        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
            inputs.forEach(input => input.disabled = true);
        } else {
            submitBtn.disabled = false;
            const isLogin = form.id === 'loginForm';
            submitBtn.innerHTML = isLogin ?
                '<i class="fas fa-sign-in-alt"></i> Đăng Nhập' :
                '<i class="fas fa-user-plus"></i> Đăng Ký Ngay';
            inputs.forEach(input => input.disabled = false);
        }
    }

    // Show success message
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    // Show error message
    showError(message) {
        this.showNotification(message, 'error');
    }

    // Show notification
    showNotification(message, type) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : '#f44336'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: 400px;
        `;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Auto hide after 5 seconds
        setTimeout(() => {
            this.hideNotification(notification);
        }, 5000);

        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });
    }

    // Hide notification
    hideNotification(notification) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';

        setTimeout(() => {
            notification.remove();
        }, 300);
    }

    // Simulate registration API call
    async submitRegistration(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success/failure
                if (Math.random() > 0.1) { // 90% success rate
                    resolve({ success: true, message: 'Registration successful' });
                } else {
                    reject(new Error('Tên đăng nhập đã tồn tại'));
                }
            }, 1500);
        });
    }

    // Simulate login API call
    async submitLogin(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success/failure
                if (Math.random() > 0.2) { // 80% success rate
                    resolve({ success: true, message: 'Login successful' });
                } else {
                    reject(new Error('Tên đăng nhập hoặc mật khẩu không đúng'));
                }
            }, 1000);
        });
    }
}

// Password strength indicator
class PasswordStrength {
    constructor(passwordInput) {
        this.passwordInput = passwordInput;
        this.init();
    }

    init() {
        this.createIndicator();
        this.passwordInput.addEventListener('input', () => {
            this.updateStrength();
        });
    }

    createIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'password-strength';
        indicator.innerHTML = `
            <div class="strength-bar">
                <div class="strength-fill"></div>
            </div>
            <div class="strength-text">Độ mạnh mật khẩu</div>
        `;

        indicator.style.cssText = `
            margin-top: 0.5rem;
        `;

        this.passwordInput.parentNode.appendChild(indicator);
        this.indicator = indicator;
    }

    updateStrength() {
        const password = this.passwordInput.value;
        const strength = this.calculateStrength(password);

        const fill = this.indicator.querySelector('.strength-fill');
        const text = this.indicator.querySelector('.strength-text');

        const strengthLevels = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'];
        const colors = ['#f44336', '#ff9800', '#ffc107', '#4caf50', '#2196f3'];

        fill.style.cssText = `
            width: ${strength * 20}%;
            height: 4px;
            background: ${colors[strength]};
            border-radius: 2px;
            transition: all 0.3s ease;
        `;

        text.textContent = password ? strengthLevels[strength] : 'Độ mạnh mật khẩu';
        text.style.color = colors[strength];
    }

    calculateStrength(password) {
        let strength = 0;

        if (password.length >= 6) strength++;
        if (password.length >= 10) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        return Math.min(strength, 4);
    }
}

// Initialize forms when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Initialize form handler
    new FormHandler();

    // Initialize password strength indicator
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        new PasswordStrength(passwordInput);
    }

    // Add error styles
    const errorStyles = document.createElement('style');
    errorStyles.textContent = `
        .form-group input.error {
            border-color: #f44336;
            background: rgba(244, 67, 54, 0.1);
        }
        
        .form-message {
            display: none;
            color: #f44336;
            font-size: 0.9rem;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0;
            margin-left: auto;
        }
        
        .strength-bar {
            width: 100%;
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            overflow: hidden;
        }
        
        .strength-text {
            font-size: 0.8rem;
            margin-top: 0.3rem;
            color: #cccccc;
        }
    `;
    document.head.appendChild(errorStyles);
});
