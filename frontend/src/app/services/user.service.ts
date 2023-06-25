import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../shared/models/User';
import { HttpClient } from '@angular/common/http';
import { URLS } from '../shared/constants/urls';
import { IUserLogin } from '../shared/interfaces/IUserLogin';
import { IUserRegister } from '../shared/interfaces/IUserRegister';
import { IUserUpdateProfile } from '../shared/interfaces/IUserUpdateProfile';

@Injectable({
  providedIn: 'root'
})


export class UserService {
  private userSubject = new BehaviorSubject<User>(this.getUserFromLocalStorage()); // Subject to hold the user data
  public userObservable:Observable<User>;
  public photoUpdatedSubject = new BehaviorSubject<boolean>(false);
  public photoUpdatedObservable = this.photoUpdatedSubject.asObservable();
  private readonly darkModeLSKey = 'DARK_MODE_ON';

  constructor(private http:HttpClient) { 
    this.userObservable = this.userSubject.asObservable(); // Initialize userObservable with the userSubject as an observable
  }

  // Registers a new user
  register(userRegister:IUserRegister): Observable<User> {
    const user =  this.http.post<User>(URLS.REGISTER.GET_REGISTER_URL, userRegister).pipe(
      tap({
        next: (user:User) => {
          this.setUserToLocalStorage(user);
          this.userSubject.next(user); // Update the userSubject with the new user
        },
        error: (err: any) => {
        }
      })
    );
    return user;
  }

  // Returns the current user
  public get currentUser():User {
    return this.userSubject.value;
  }
  
 // Checks if the user is authenticated
  isAuth():boolean {
    return !!this.currentUser.token;
  }

  // Logs in the user
  login(userLogin:IUserLogin):Observable<User> {
    this.removeUserFromLocalStorage();

    return this.http.post<User>(URLS.LOGIN.GET_LOGIN_URL, userLogin).pipe(
      tap({
        next: (user:User) => {
          this.setUserToLocalStorage(user);
          this.userSubject.next(user); // Update the userSubject with the new user
        },
        error: (err: any) => {
          this.removeUserFromLocalStorage();
        }
      })
    );
  }

  // Updates the user profile
  updateUser(userUpdate: IUserUpdateProfile): Observable<User> {
    const updateUserUrl = URLS.USER.GET_USER_UPDATE_URL(userUpdate.id);
    return this.http.put<User>(updateUserUrl, userUpdate).pipe(
      tap({
        next: (updatedUser: User) => {
          if (updatedUser.imageURL !== this.currentUser.imageURL) {
            this.photoUpdatedSubject.next(true);
          }
          updatedUser.token = this.currentUser.token;
          this.setUserToLocalStorage(updatedUser);
          this.userSubject.next(updatedUser);
        },
        error: (err: any) => {
          console.error('Error while updating user:', err);
        }
      })
    );
  }

  // Updates the user's profile photo
  updateUserPhoto(userId: string, photo: File): Observable<User> {
    const updateUserPhotoUrl = URLS.USER.GET_USER_PHOTO_UPDATE_URL(userId);
    const formData = new FormData();
    formData.append('photo', photo);

    return this.http.put<User>(updateUserPhotoUrl, formData).pipe(
      tap({
        next: (updatedUser: User) => {
          updatedUser.token = this.currentUser.token;
          this.setUserToLocalStorage(updatedUser);
          this.userSubject.next(updatedUser);
        },
        error: (err: any) => {
          console.error('Error while updating user photo:', err);
        }
      })
    );
}

// Deletes the user's profile photo
  deleteUserPhoto(userId: string): Observable<User> {
    const deleteUserPhotoUrl = URLS.USER.GET_USER_PHOTO_DELETE_URL(userId);
    return this.http.put<User>(deleteUserPhotoUrl, {}).pipe(
      tap({
        next: (updatedUser: User) => {
          updatedUser.token = this.currentUser.token;
          this.setUserToLocalStorage(updatedUser);
          this.photoUpdatedSubject.next(true); // Notify that the user photo has been deleted
        },
        error: (err: any) => {
        }
      })
    );
  }

   // Removes user data from local storage
  public removeUserFromLocalStorage() {
    try {
      localStorage.removeItem('user');
    }
    catch (e) {
    }
  }

  // Sets the user data in local storage
  private setUserToLocalStorage(user:User) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Updates the user data in local storage
  public updateUserInLocalStorage(user:User) {
    if (user) {
      this.setUserToLocalStorage(user);
    }
  }

  // Gets the user data from local storage
  private getUserFromLocalStorage():User {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user) as User;
    }
    return new User();
  }

  // Logs out the user
  logout() {
    this.userSubject.next(new User());
    localStorage.removeItem('user');
    localStorage.removeItem('Cart');
    localStorage.removeItem(this.darkModeLSKey);
    window.location.href = "/";
  }

  // Gets the user data from the server
  moveToPaypal(userId: string, userEmail: string, amount: number): Observable<any> {
    return this.http.post<any>(URLS.USER.GET_USER_MOVE_TO_PAYPAL_URL, {userId, userEmail, amount});
  }

  // Updates the user balance in local storage
  updateUserBalanceInLocalStorage(newBalance: number) {
    let user = this.getUserFromLocalStorage();
    user.balance = newBalance;
    this.setUserToLocalStorage(user);
  }

  // Updates the user balance in local storage
  setThemePreference(isDarkMode: boolean) {
    localStorage.setItem(this.darkModeLSKey, String(isDarkMode));
  }

  // Gets the user balance from local storage
  getThemePreference(): boolean {
    const savedPref = localStorage.getItem(this.darkModeLSKey);
    return savedPref !== null ? savedPref === 'true' : false;
  }
  
}
