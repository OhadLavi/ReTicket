import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/shared/models/User';

@Component({
  selector: 'app-account-sidemenu',
  templateUrl: './account-sidemenu.component.html',
  styleUrls: ['./account-sidemenu.component.css']
})

// AccountSidemenu Component
export class AccountSidemenuComponent implements OnInit {

  public isCollapsed = true;
  myitems: any;
  user!:User;

  constructor(private userService:UserService) {
    userService.userObservable.subscribe((user)=>{
      if (user.id) {
        this.user = user;
      }
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      const pathName = window.location.pathname;
      const items = Array.from(document.querySelectorAll("a.menulist"));
      let matchingMenuItem = items.find((x: any) => {
        return x.pathname === pathName;
      });
      matchingMenuItem?.classList.add('active')
    }, 0);
  }

  logout() {
    this.userService.logout();
  }

  get isAuth() {
    return this.user && this.user.id;
  }
}
