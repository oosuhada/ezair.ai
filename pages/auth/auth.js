document.addEventListener('DOMContentLoaded', () => {
    const idPhoneTab = document.getElementById('id-phone-tab');
    const qrTab = document.getElementById('qr-tab');
    const idPhoneFormContainer = document.getElementById('id-phone-form-container');
    const qrFormContainer = document.getElementById('qr-form-container');
    const signInButton = document.querySelector('.sign-in-button');
    const idPhoneInput = document.getElementById('id-phone-input');
    const passwordInput = document.getElementById('password-input');
    const ipSecurityToggle = document.querySelector('.ip-security-toggle');
    const toggleSwitch = ipSecurityToggle.querySelector('.toggle-switch');
    const toggleText = ipSecurityToggle.querySelector('.toggle-text');

    // Function to update the sign-in button state
    function updateSignInButtonState() {
        if (idPhoneInput.value.length > 0 && passwordInput.value.length > 0) {
            signInButton.classList.add('active');
        } else {
            signInButton.classList.remove('active');
        }
    }

    // Event listeners for input changes to enable/disable button
    idPhoneInput.addEventListener('input', updateSignInButtonState);
    passwordInput.addEventListener('input', updateSignInButtonState);

    // Initial state check for the button
    updateSignInButtonState();

    // Tab switching logic
    idPhoneTab.addEventListener('click', () => {
        idPhoneTab.classList.add('active');
        qrTab.classList.remove('active');
        idPhoneFormContainer.classList.add('active');
        qrFormContainer.classList.remove('active');
        // 탭 전환 시 입력 필드 상태 다시 확인
        updateSignInButtonState();
    });

    qrTab.addEventListener('click', () => {
        qrTab.classList.add('active');
        idPhoneTab.classList.remove('active');
        qrFormContainer.classList.add('active');
        idPhoneFormContainer.classList.remove('active');
    });

    // IP Security Toggle functionality
    ipSecurityToggle.addEventListener('click', () => {
        const isOn = toggleSwitch.classList.toggle('on');
        toggleText.textContent = isOn ? 'ON' : 'OFF';
        // 실제 IP 보안 설정 변경 로직은 여기에 추가
        console.log('IP Security is now:', isOn ? 'ON' : 'OFF');
    });

    // Input focus effect
    idPhoneInput.addEventListener('focus', () => {
        idPhoneInput.closest('.input-group').classList.add('focused');
    });

    idPhoneInput.addEventListener('blur', () => {
        idPhoneInput.closest('.input-group').classList.remove('focused');
    });

    passwordInput.addEventListener('focus', () => {
        passwordInput.closest('.input-group').classList.add('focused');
    });

    passwordInput.addEventListener('blur', () => {
        passwordInput.closest('.input-group').classList.remove('focused');
    });

    // Sign In button click (example)
    signInButton.addEventListener('click', () => {
        if (signInButton.classList.contains('active')) {
            const idPhone = idPhoneInput.value;
            const password = passwordInput.value;
            console.log('로그인 시도:', { idPhone, password });
            alert('로그인 시도 (콘솔 확인)');
            // 실제 로그인 API 호출 로직은 여기에 추가
        } else {
            alert('ID/전화번호와 비밀번호를 모두 입력해주세요.');
        }
    });

    // Prevent default form submission if this were a form element (buttons often don't need this)
    // If you wrap the inputs and button in a <form> tag, you'd add this:
    // document.querySelector('.auth-form-container').addEventListener('submit', (e) => {
    //     e.preventDefault();
    //     // Call signInButton.click() or similar logic
    // });
});