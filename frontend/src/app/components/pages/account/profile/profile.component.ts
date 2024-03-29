import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/shared/models/User';
import { ActivatedRoute } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';

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
  
  constructor(
    private formBuilder: UntypedFormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private toast: NgToastService) {
      this.user = userService.currentUser;
      this.userBalance = this.user.balance;
  }

  ngOnInit(): void {
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

  updatePhoto(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      const photo: File = event.target.files[0];
      this.userService.updateUserPhoto(this.user.id, photo).subscribe(
        res => this.onPhotoUpdateSuccess(res),
        error => this.onPhotoUpdateError(error)
      );
    }
  }

  onPhotoUpdateSuccess(res: any) {
    this.user = res;
    this.userService.photoUpdatedSubject.next(true);
    this.toast.success({detail:"SUCCESS",summary:'User photo updated successfully!', sticky: false, duration: 3000, type: 'success'});
    document.querySelectorAll('#user_profile').forEach((element: any) => {
      element.src = this.user.imageURL;
    });
  }

  onPhotoUpdateError(error: any) {
    this.toast.error({detail:"ERROR",summary:'Error occurred while updating user photo', sticky: false, duration: 10000, type: 'error'});
  }

  deletePhoto() {  
    this.userService.deleteUserPhoto(this.user.id).subscribe((res) => {
      document.querySelectorAll('#user_profile').forEach((element: any) => {
        element.src = "http://localhost:5000/" + res.imageURL;
      });
      this.toast.success({detail:"SUCCESS",summary:'User photo deleted successfully!', sticky: false, duration: 3000, type: 'success'});
    },
    error => {
      console.log(error);
      this.toast.error({detail:"ERROR",summary:'Error occurred while deleting user photo', sticky: false, duration: 10000, type: 'error'});
    });
  }
  
  
  saveUser() {
    this.submitted = true;
    if (this.userForm.invalid) {
      return;
    }

    this.userService.updateUser(this.userForm.value).subscribe((res) => {
      if (res) {
        this.toast.success({detail:"SUCCESS",summary:'User updated successfully!', sticky: false, duration: 3000, type: 'success'});
      }
      },
      error => {
        this.toast.error({detail:"ERROR",summary:'Error occurred while updating user', sticky: false, duration: 10000, type: 'error'});
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
  }  

  // Move to Paypal
  moveToPaypal() {
    this.userService.moveToPaypal(this.user.id, this.user.email, this.userBalance)
    .subscribe(res => {
      if (res && res.payout && res.payout.batch_header && res.payout.batch_header.payout_batch_id) {
        this.toast.success({detail:"SUCCESS",summary:'Payment successful! The batch ID is ' + res.payout.batch_header.payout_batch_id, sticky: false, duration: 3000, type: 'success'});
        this.userService.updateUserBalanceInLocalStorage(0);
        this.userBalance = 0;
      }
    },
    error => {
      this.toast.error({detail:"ERROR",summary:'Error occurred while updating user balance', sticky: false, duration: 10000, type: 'error'});
    });
}
  
}
