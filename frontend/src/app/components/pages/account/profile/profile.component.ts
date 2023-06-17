import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/shared/models/User';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  breadCrumbItems!: any;
  submitted = false;
  userForm!: UntypedFormGroup;
  photoForm!: UntypedFormGroup;
  user!: User;
  userBalance!: number;
  paymentSuccess!: boolean;
  paymentId!: string;
  token!: string;
  payerId!: string;
  
  constructor(private formBuilder: UntypedFormBuilder, private userService: UserService, private snackBar: MatSnackBar, private route: ActivatedRoute) {
    this.user = userService.currentUser;
    this.userBalance = this.user.balance;
    console.log(this.user.balance);
    console.log(this.user.imageURL);
  }

  ngOnInit(): void {
    //this.imageURL = this.user.imageURL;
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    document.querySelector('.account')?.classList.add('d-none')
    document.querySelector('.wallet')?.classList.add('d-none')
    document.querySelector('.connectwallet')?.classList.add('d-none')
    document.querySelector('.footer .bg-dark')?.classList.remove('mt-n10', 'pt-10')
    document.querySelector('.footer.bg-secondary')?.classList.add('d-none')

    this.breadCrumbItems = [
      { label: 'Home', link: '/' },
      { label: 'Marketplace', link: '/' },
      { label: 'Single Project', active: true, link: '/Single Project' }
    ];

    this.userForm = this.formBuilder.group({
      name: [this.user.name, [Validators.required]],
      username: [''],
      id: [this.user.id, [Validators.required]],
      email: [this.user.email, [Validators.required, Validators.email]],
      facebook: [''],
      insta: [''],
      password: [this.user.password],
    });

    this.photoForm = this.formBuilder.group({
      photo: ['']
    });

    this.route.queryParams.subscribe(params => {
      if (Object.keys(params).length > 0) {
        this.paymentSuccess = params['success'] === 'true' ? true : false;
        this.paymentId = params['paymentId'];
        this.token = params['token'];
        this.payerId = params['PayerID'];
    
        if (this.paymentSuccess) {
          console.log('Payment successful!');
        } else {
          console.log('Payment failed!');
        }
      }
    });    
  }

  get form() {
    return this.userForm.controls;
  }

  get formPhoto() {
    return this.photoForm.controls;
  }

  openSnackBarSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['success-snackbar']
    });
  }

  updatePhoto(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      const photo: File = event.target.files[0];
  
      // Use FileReader to read the uploaded file as a Data URL
      const reader = new FileReader();
      reader.onload = () => {
        this.imageURL = reader.result as string;
      };
      reader.readAsDataURL(photo);
  
      // Use the service method to send the file to the backend
      this.userService.updateUserPhoto(this.user.id, photo).subscribe((res) => {
        this.openSnackBarSuccess('Operation successful!');
        console.log(res);
        document.querySelectorAll('#user_profile').forEach((element: any) => {
          element.src = this.imageURL;
        });
      },
      error => {
        console.log('Error occurred while updating user photo:', error);
      });
    }
  }
  
  saveUser() {
    console.log("saveUser");
    this.submitted = true;
    if (this.userForm.invalid) {
      console.log("invalid");
      return;
    }

    this.userService.updateUser(this.userForm.value).subscribe((res) => {
      console.log(res);
    });

  }

  imageURL: string | undefined;
  fileChange(event: any) {
    let fileList: any = (event.target as HTMLInputElement);
    let file: File = fileList.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imageURL = reader.result as string;
      document.querySelectorAll('#user_profile').forEach((element: any) => {
        element.src = this.imageURL;
      });
    };
    reader.readAsDataURL(file);
  
    // Clear the selected file from the file input element
  }  

  moveToPaypal() {
    this.userService.moveToPaypal(this.user.id, this.user.email, this.userBalance)
    .subscribe(res => {
      console.log(res);
      if (res && res.payout && res.payout.batch_header && res.payout.batch_header.payout_batch_id) {
        console.log(res);
        this.openSnackBarSuccess('Payment successful! The batch ID is ' + res.payout.batch_header.payout_batch_id);
        this.userService.updateUserBalanceInLocalStorage(0);
        this.userBalance = 0;
      }
    },
    error => {
      this.openSnackBarSuccess('Error occurred while paying user:' + error);
      console.log('Error occurred while paying user:', error);
    });
}
  
}
