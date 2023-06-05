import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/shared/models/User';

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

  constructor(private formBuilder: UntypedFormBuilder, private userService: UserService) {
    this.user = userService.currentUser;
    console.log(this.user.imageURL);
  }

  ngOnInit(): void {
    //this.imageURL = this.user.imageURL;
    console.log(this.user);
    // When the user clicks on the button, scroll to the top of the document
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    // Remove header account and wallet button
    document.querySelector('.account')?.classList.add('d-none')
    document.querySelector('.wallet')?.classList.add('d-none')
    document.querySelector('.connectwallet')?.classList.add('d-none')

    //Remove mail subscription footer
    document.querySelector('.footer .bg-dark')?.classList.remove('mt-n10', 'pt-10')
    document.querySelector('.footer.bg-secondary')?.classList.add('d-none')

    /**
    * BreadCrumb
    */
    this.breadCrumbItems = [
      { label: 'Home', link: '/' },
      { label: 'Marketplace', link: '/' },
      { label: 'Single Project', active: true, link: '/Single Project' }
    ];

    /**
   * Form Validation
   */
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
  }

  /**
 * Form data get
 */
  get form() {
    return this.userForm.controls;
  }

  get formPhoto() {
    return this.photoForm.controls;
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

  // File Upload
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

}
