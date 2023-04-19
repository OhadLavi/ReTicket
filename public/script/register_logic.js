
const passwordRules = "Password must contain: \n1. At least one upper case letter\n\
2. At least one lower case letter \n3. At least one digit \n4. At least one special character\n\
5. At least 6 characters\nSpecial characters: : ! @ # \$ % ^ & * ( ) - _ = + \ | [ ] { } ; : / ? . > \<";
const emailRules = "Email field should match the format: aaa@bbb.ccc";

setToolTips();


function validateSignUp() {
    firstName = document.getElementById("firstName").value;
    lastName = document.getElementById("lastName").value;
    email = document.getElementById("email").value;
    password = document.getElementById("password").value;
    confirmPas = document.getElementById("confirm").value;
    const [emailValidation, passwordValidation, nameValidation, confirmationValidation] = validateEmailAndPassword();

    if (emailValidation && passwordValidation && nameValidation && confirmationValidation) {
        document.getElementById('submitBtn').disabled = true;
        return true;
    }
    return false;
}

function validateEmailAndPassword() {
    var emailValidation = validateEmail();
    var passwordValidation = validatePassword();
    var nameValidation = validateName();
    var confirmationValidation = validateConfirmation();

    if (!emailValidation)
        alert("Invalid email!\n" + emailRules);
    else if (!passwordValidation)
        alert("Invalid password!\n" + passwordRules);
    else if (!nameValidation)
        alert("Name is required and must contain only English letters!");
    else if (!confirmationValidation)
        alert("Passwords do not match!");

    return [emailValidation, passwordValidation, nameValidation, confirmationValidation];
}

function validateName() {
    var regName = /^[a-zA-Z]+$/;
    return (regName.test(firstName) && regName.test(lastName));
}

function validateConfirmation() {
    return confirmPas === password;
}

function validateEmail() {
    var validRegex = /^[a-zA-Z0-9.!#$%&'+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)$/;

    return email.match(validRegex) ? true : false;
}

function validatePassword() {
    var passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{6,})");

    return passwordRegex.test(password);

}

function showPassword() {
    if (document.getElementById("password").type === "password") {
        document.getElementById("password").type = "text";
        document.getElementById("confirm").type = "text";
    } else {
        document.getElementById("password").type = "password";
        document.getElementById("confirm").type = "password";
    }
}

function setToolTips() {
    document.getElementById("password").title = passwordRules;
    document.getElementById("email").title = emailRules;
    document.getElementById("confirm").title = "Passwords must match";
    document.getElementById("firstName").title = "Name is required and must contain only English letters";
    document.getElementById("lastName").title = "Name is required and must contain only English letters";
}

function validateRecaptcha() {
    const resp = grecaptcha.getResponse();
    if (resp.length == 0) {
        alert("You can't leave Captcha Code empty!");
        return false;
    }
    return true;
}

function recaptchaSelected()
{
    var recaptcha = document.getElementById("submitBtn");
    recaptcha.removeAttribute("disabled");
    recaptcha.removeAttribute("title");
}

document.getElementById('submitBtn').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default form submission
    if (validateSignUp()) {
        document.getElementById('register-form').submit(); // Submit the form manually if the validation passes
    }
});

