import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private userService: UserService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const user = this.userService.currentUser;
    try {
    if(user.token) {
      console.log("token: " + user.token);
      request = request.clone({
        setHeaders:{
          Authorization: `Bearer ${user.token}`
        }
      })
    }
    else {
      this.userService.removeUserFromLocalStorage();
    }} catch (error) {
      console.log(error);
    }
    return next.handle(request);
  }
}
