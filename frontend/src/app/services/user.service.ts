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
  private userSubject = new BehaviorSubject<User>(this.getUserFromLocalStorage());
  public userObservable:Observable<User>;
  constructor(private http:HttpClient) { 
    this.userObservable = this.userSubject.asObservable();
  }

  register(userRegister:IUserRegister): Observable<User> {
    console.log(URLS.REGISTER.GET_REGISTER_URL);
    const t =  this.http.post<User>(URLS.REGISTER.GET_REGISTER_URL, userRegister).pipe(
      tap({
        next: (user:User) => {
          console.log(user);
          this.setUserToLocalStorage(user);
          this.userSubject.next(user);
        },
        error: (err: any) => {
          console.log(err);
        }
      })
    );
    return t;
  }

  public get currentUser():User {
    return this.userSubject.value;
  }
  

  isAuth():boolean {
    return !!this.currentUser.token;
  }

  login(userLogin:IUserLogin):Observable<User> {
    this.removeUserFromLocalStorage();
    console.log('login');
    return this.http.post<User>(URLS.LOGIN.GET_LOGIN_URL, userLogin).pipe(
      tap({
        next: (user:User) => {
          console.log(user);
          this.setUserToLocalStorage(user);
          this.userSubject.next(user);
        },
        error: (err: any) => {
          this.removeUserFromLocalStorage();
          console.log(err);
        }
      })
    );
  }

  updateUser(userUpdate: IUserUpdateProfile): Observable<User> {
    const updateUserUrl = URLS.USER.GET_USER_UPDATE_URL(userUpdate.id);
    return this.http.put<User>(updateUserUrl, userUpdate).pipe(
      tap({
        next: (updatedUser: User) => {
          updatedUser.token = this.currentUser.token;
          console.log('User updated:', updatedUser);
          this.setUserToLocalStorage(updatedUser);
          this.userSubject.next(updatedUser);
        },
        error: (err: any) => {
          console.log('Error updating user:', err);
        }
      })
    );
  }

  updateUserPhoto(userId: string, photo: File): Observable<User> {
    const updateUserPhotoUrl = URLS.USER.GET_USER_PHOTO_UPDATE_URL(userId);
    const formData = new FormData();
    console.log(photo.name);
    formData.append('photo', photo);

    return this.http.put<User>(updateUserPhotoUrl, formData).pipe(
      tap({
        next: (updatedUser: User) => {
          console.log('User photo updated:', updatedUser);
          updatedUser.token = this.currentUser.token;
          this.setUserToLocalStorage(updatedUser);
        },
        error: (err: any) => {
          console.log('Error updating user photo:', err);
        }
      })
    );
  }

  public removeUserFromLocalStorage() {
    console.log('removeUserFromLocalStorage');
    try {
      localStorage.removeItem('user');
      console.log('removeUserFromLocalStorage');
    }
    catch (e) {
      console.log(e);
    }
  }

  private setUserToLocalStorage(user:User) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  public updateUserInLocalStorage(user:User) {
    if (user) {
      this.setUserToLocalStorage(user);
    }
  }

  private getUserFromLocalStorage():User {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user) as User;
    }
    return new User();
  }

  logout() {
    this.userSubject.next(new User());
    localStorage.removeItem('user');
    window.location.href = "/";
  }

}
