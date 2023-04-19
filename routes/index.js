const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const request = require('request');
const generatorNumber = require('generate-serial-number');
const { checkAuthenticated } = require("../utils/authenticate");
const generator = require('generate-password');
const requestPromise = require('request-promise-native');
//const { sendEmail } = require("../utils/sendEmail");
const multer = require('multer');

const User = require("../models/userScheme.js");
const Ticket = require("../models/ticketScheme.js");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + '.pdf');
  }
});

const upload = multer({ storage: storage });

router.get('/', checkAuthenticated, async (req, res) => {
  const user = req.user;
  try {
    const treatments = await User.find({ userId: user._id });
    res.render("views/home.ejs", { user });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while fetching data");
  }
});


router.get("/login", (req, res) => {
  res.render("views/login.ejs")
});

router.get("/register", (req, res) => {
  res.render("views/register.ejs")
});

router.get("/forgot-password", (req, res) => {
  res.render("views/forgot-password.ejs")
});

router.get("/uploadTicket", checkAuthenticated, (req, res) => {
  //const user = req.user;
  //Treatment.find({ userId: user._id }, (err, treatments) => {
    res.render("views/uploadTicket.ejs");
  //}
  //);
});

router.get("*", (req, res) => {
  res.render('views/404.ejs');
});

router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password, recaptcha } = req.body;
  // var secret_key = "6Lc37tYjAAAAAIvA_p5mO6RbN-8Y0q2f6YNb2A6X"; // real secret key
  var secret_key = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"; //test recaptcha secret key
  var url = "https://www.google.com/recaptcha/api/siteverify?secret=" + secret_key + "&response=" + req.body.captcha + "&remoteip=" + req.connection.remoteAddress;

  request(url, async(error, response, body) => {
    body = JSON.parse(body);
    console.log("checking recaptcha");
    if (body.success !== undefined && !body.success) //unsuccessful
    {
      console.log("unsuccessful recaptha");
      res.redirect('/login');
    }
    else {
      User.findOne({ email: email })
        .then((user) => {
          if (user) //already exist
          {
            console.log('user exists');
            res.redirect('/register');
          }
          else {
            const newUser = new User({
              firstName,
              lastName,
              email,
              password,
            });

            bcrypt.genSalt(10, (err, salt) =>
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser.save()
                  .then((user) => {
                    console.log('user created');
                    // try {
                    //   console.log("try block entered.")
                    //   var subject = "Welcome to Car-Maintenance-Buddy!";
                    //   var text = "Your account has been successfuly set. You may now log into your dashboard.";
                    //   if (!sendEmail(email, subject, text)) {
                    //     throw new Error;
                    //   }
                    // }
                    // catch (e) {
                    //   console.log(e);
                    // }
                    res.redirect("/login");
                  })
                  .catch((err) => console.log(err));
              })
            );
          }
        })
        .catch();
    }
  });
});

router.post('/login', async (req, res, next) => {
  console.log('Request body:', req.body);
  // var secret_key = "6Lc37tYjAAAAAIvA_p5mO6RbN-8Y0q2f6YNb2A6X"; // real secret key
  var secret_key = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"; //test recaptcha secret key
  var url = "https://www.google.com/recaptcha/api/siteverify?secret=" + secret_key + "&response=" + req.body.captcha + "&remoteip=" + req.connection.remoteAddress;

  try {
    const body = await requestPromise(url);
    const parsedBody = JSON.parse(body);
    console.log("checking recaptcha");

    if (parsedBody.success !== undefined && !parsedBody.success) { // unsuccessful
      console.log("unsuccessful recaptha");
      res.redirect('/login');
    } else {
      console.log("checking user");
      passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true,
        rememberMe: true
      })(req, res, next);
    }
  } catch (error) {
    console.error("Error while verifying reCAPTCHA:", error);
    res.redirect('/login');
  }
});

router.post('/logout', (req, res) => {
  req.logout(() => {
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
  });
});

router.post('/search', async (req, res) => {
  const searchQuery = req.body.search;
  // do something with the search query
  const searchResults = [
    {
      "ticketID": "TICKET123",
      "bandName": "Radiohead",
      "venue": "Madison Square Garden",
      "city": "New York",
      "country": "USA",
      "owner": "<User ObjectId>"
    },
    {
      "ticketID": "TICKET456",
      "bandName": "Foo Fighters",
      "venue": "Wembley Stadium",
      "city": "London",
      "country": "UK",
      "owner": "<User ObjectId>"
    }
  ]; // replace this with your actual search results

  res.render('views/search.ejs', { tickets: searchResults });
});

router.post('/upload-ticket', checkAuthenticated, upload.single('ticketFile'), (req, res) => {
  console.log('File uploaded:', req.file);
  // Handle the uploaded file (e.g., save it to the database, create a new ticket, etc.)
  res.redirect('/'); // Redirect to a success or confirmation page, or wherever you'd like
});

router.post("/addTreatment", (req, res) => {
  const { treatmentID, treatmentInfo, treatmentDate, workerEmail, carNumber } = req.body;
  const user = req.user;
  var id = generatorNumber.generate(4);

  const treatment = new Treatment({
    treatmentNumber: id,
    treatmentInfo: treatmentInfo,
    treatmentDate: treatmentDate.replace('T', ' '),
    workerEmail: workerEmail,
    carNumber: carNumber,
    userId: user._id,
  });

  treatment.save()
    .then(() => {
      res.redirect('/tables');
    })
    .catch(err => {
      console.log(err)
    });
});

router.post("/removeTreatment", (req, res) => {
  const id = req.body.treatmentID;
  Treatment.findByIdAndDelete(id)
    .then(() => {
      res.redirect('/tables');
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/editTreatment", (req, res) => {
  const { treatmentID, treatmentInfo, treatmentDate, workerEmail, carNumber } = req.body;
  const data = { treatmentInfo: treatmentInfo, treatmentDate: treatmentDate, workerEmail: workerEmail, carNumber: carNumber };
  Treatment.findByIdAndUpdate(treatmentID, data, { useFindAndModify: false })
    .then(() => {
      res.redirect('/tables');
    })
    .catch((err) => {
      console.log(err);
    });
});


// sending email to forget-password page 
function validatePassword(password) {
  var passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{6,})");
  return passwordRegex.test(password);
}

// router.post('/forgot-password', async (req, res) => {
//   const email = req.body.email;
//   User.findOne({ email: email })
//     .then(user => {
//       let new_password;
//       if (user) {
//         do {
//           new_password = generator.generate({
//             length: 8,
//             numbers: true,
//             symbols: '!@#$%^&*()-_=+\\[]{};:/?/><',//! @ # \$ % ^ & * ( ) - _ = + \ | [ ] { } ; : / ? . > \<
//             lowercase: true,
//             uppercase: true,
//           });
//         } while (!validatePassword(new_password));

//         //encrypt password
//         var salt = bcrypt.genSaltSync(10);
//         var hash = bcrypt.hashSync(new_password, salt);

//         //update new password
//         User.updateOne({ _id: user._id }, { password: hash }, function (err, docs) {
//           if (err) {
//             console.log(err)
//           }
//           else {
//             console.log("Updated Docs : ", docs);
//           }
//         });
//         console.log('user password has been reset! new password:' + new_password);

//         var subject = `Your Password in Car Maintenace Buddy website`;
//         const text = `Hi ${user.firstName}!\n\
//                             We heard that you forgot your password to our site...\n\
//                             This is your new password: ${new_password}`;
//         try {
//           if (sendEmail(email, subject, text)) {
//             res.json({
//               status: 'success',
//               msg: 'The new password is in your email'
//             });
//           }
//           else {
//             throw new Error;
//           }
//         }
//         catch (e) {
//           console.log(e);
//           res.json({
//             status: 'error',
//             msg: 'failed to send email'
//           });
//         }
//       }
//       else { //user is not registered
//         res.json({
//           status: 'error',
//           msg: 'Unknown email'
//         });
//       }
//     });
// });

module.exports = router;