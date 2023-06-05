import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, OnInit, HostBinding, Input, ViewChild  } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import { CartService } from 'src/app/services/cart.service';
import { ThemeService } from 'src/app/services/theme.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/shared/models/User';
import { faBell } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  faBell = faBell;
  @Input() toggleControl!: FormControl;
  cartQuantity = 0;
  public isCollapsed = true;
  user!:User;
  @ViewChild('snav') sidenav!: MatSidenav;

  constructor(cartService:CartService, private userService:UserService, public themeService: ThemeService, private overlay: OverlayContainer) {
    cartService.getCartObservable().subscribe((newCart)=>{
      this.cartQuantity = newCart.totalCount;
    })

    userService.userObservable.subscribe((user)=>{
      if (user.id) {
        this.user = user;
      }
    });
  }

  ngOnInit(): void {
    this.user = this.userService.currentUser; // Set initial user value
  }

  toggle() {
    this.sidenav.toggle();
  }

  logout() {
    this.userService.logout();
  }

  get isAuth() {
    return this.userService.isAuth();
  }

}
