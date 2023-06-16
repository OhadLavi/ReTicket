import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm!:FormGroup;
  isSubmitted = false;
  returnUrl = '';
  loginError: string | null = null;
  
  constructor(private formBuilder:FormBuilder, private userService:UserService, private actiavtedRouter:ActivatedRoute, private router:Router) {
    // this.userService.removeUserFromLocalStorage();
  }

  ngOnInit(): void {
    if (this.userService.isAuth()) {
      this.router.navigateByUrl('/');
    }

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.returnUrl = this.actiavtedRouter.snapshot.queryParams.returnUrl;
  }

  get fc() {
    return this.loginForm.controls;
  }

  submit() {
    this.isSubmitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    console.log((this.returnUrl));
    this.userService.login(this.loginForm.value).subscribe(
      () => { this.router.navigateByUrl(this.returnUrl); },
      (error) => {
        if (error.status === 401) {
          console.log(error.error);
          this.loginError = error.error.error;
        } else {
          this.loginError = 'An error occurred. Please try again later.';
        }
      }
    );
  }
  

}
