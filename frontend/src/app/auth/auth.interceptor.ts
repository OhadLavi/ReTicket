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

  // Adds the token to the header of the request
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const user = this.userService.currentUser;
    try {
      // If the user is logged in, add the token to the header of the request
      if(user.token) {
        request = request.clone({
          setHeaders:{
            Authorization: `Bearer ${user.token}`
          }
        })
      }
      else {
        this.userService.removeUserFromLocalStorage(); // If the user is not logged in, remove the user from local storage
      }
    } catch (error) {
      console.log(error);
    }
    return next.handle(request);
  }
}
