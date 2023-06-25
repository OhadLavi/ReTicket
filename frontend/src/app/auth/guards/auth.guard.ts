import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from 'src/app/services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private userService:UserService, private router:Router){

  }

  // Checks if the user is logged in
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if(this.userService.currentUser.token) return true; // If the user is logged in, return true
    this.router.navigate(['/login'], {queryParams:{returnUrl: state.url}}) // If the user is not logged in, redirect to login page
    return false;
  }

}