import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { UserService } from 'src/app/services/user.service';
import { IUserRegister } from 'src/app/shared/interfaces/IUserRegister';
import { PasswordsMatchValidator } from 'src/app/shared/validators/password_match_validator';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  isSubmitted = false;
  returnUrl: '';
  emailInUseError = false;
  passwordMismatchError = false;
  hidePassword = true;
  hideConfirmPassword = true;
  generalError = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toast: NgToastService
  ) { 
    this.returnUrl = this.activatedRoute.snapshot.queryParams.returnUrl || '/';
  }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required, Validators.minLength(1)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(1)]],
      email: ['', [Validators.required, Validators.email]]
    }, {
      validator: PasswordsMatchValidator('password', 'confirmPassword')
    });
    this.returnUrl = this.activatedRoute.snapshot.queryParams.returnUrl || '/';
  }

  get fc() { return this.registerForm.controls; }

  submit() {
    this.isSubmitted = true;
    this.emailInUseError = false;
    this.passwordMismatchError = false;
  
    if (this.registerForm.invalid) {
      return;
    }
  
    const fv = this.registerForm.value;
    const user: IUserRegister = {
      name: fv.name,
      password: fv.password,
      email: fv.email
    };
  
    this.userService.register(user).subscribe(
      user => {
        this.router.navigateByUrl(this.returnUrl);
        this.toast.success({detail:"SUCCESS",summary:'You have successfully registered.', sticky: false, duration: 5000, type: 'success'});
      },
      error => {
        if (error.status === 400 && error.error.error === 'User already exists') {
          this.emailInUseError = true;
          this.fc.email.markAsTouched();
          this.fc.email.setErrors({'emailInUse': true});
        } else if (error.status === 500 && error.error.error === 'Error registering user') {
          this.toast.error({detail:"ERROR",summary: 'An error occurred. Please try again later.', sticky: false, duration: 10000, type: 'error'});
          this.generalError = true;
        }
      }
    );
  }
  
}
