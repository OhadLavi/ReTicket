
const passwordRules = "Password must contain: \n1. At least one upper case letter\n\
2. At least one lower case letter \n3. At least one digit \n4. At least one special character\n\
5. At least 6 characters\nSpecial characters: : ! @ # \$ % ^ & * ( ) - _ = + \ | [ ] { } ; : / ? . > \<";
const emailRules = "Email field should match the format: aaa@bbb.ccc";

var email = document.getElementById("email").value;
var password = document.getElementById("password").value;

setToolTips();

// (function () {
//     var proxied = window.alert;
//     window.alert = function () {
//         modal = $('<div id="myModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 id="myModalTitle" class="modal-title">Modal title</h4></div><div class="modal-body"><p>One fine body&hellip;</p></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>');
//         modal.find(".modal-body").text(arguments[0]);
//         modal.find(".modal-title").text("Something is Wrong...");
//         modal.modal('show');
//     };
// })();
  
//   grecaptcha.ready(function() {
//     grecaptcha.render('recaptcha', {
//       'sitekey': 'your_site_key',
//       'callback': function(response) {
//         document.getElementById('captcha').value = response;
//       },
//       'expired-callback': function() {
//         document.getElementById('captcha').value = '';
//       }
//     });
//   });
  

function validateLogIn() {
    email = document.getElementById("email").value;
    password = document.getElementById("password").value;
    const [emailValidation, passwordValidation] = validateEmailAndPassword();

    if (emailValidation && passwordValidation) {
            return true;
    }
    return false;
}

function validateEmailAndPassword() {
    var emailValidation = validateEmail();
    var passwordValidation = validatePassword();

    if (!emailValidation)
        alert("Invalid email!\n" + emailRules);

    else if (!passwordValidation)
        alert("Invalid password!\n" + passwordRules);

    return [emailValidation, passwordValidation];
}

function validateEmail() {
    var validRegex = /^[a-zA-Z0-9.!#$%&'+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)$/;

    return email.match(validRegex) ? true : false;
}

function validatePassword() {
    var passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{6,})");

    return passwordRegex.test(password);

}

function setToolTips() {
    document.getElementById("password").title = passwordRules;
    document.getElementById("email").title = emailRules;
}

function validateRecaptcha() {
    const resp = grecaptcha.getResponse();
    if (resp.length == 0) {
        alert("You can't leave Captcha Code empty!");
        return false;
    }
    return true;
}

function recaptchaSelected() {
    var recaptcha = document.getElementById("submitBtn");
    recaptcha.removeAttribute("disabled");
    recaptcha.removeAttribute("title");
}
