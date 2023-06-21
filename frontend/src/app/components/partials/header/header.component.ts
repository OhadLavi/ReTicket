import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, OnInit, HostBinding, Input, ViewChild, ChangeDetectorRef  } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import { CartService } from 'src/app/services/cart.service';
import { ThemeService } from 'src/app/services/theme.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/shared/models/User';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { SharedService } from 'src/app/services/shared.service';
import { Notification } from 'src/app/shared/models/Notification';

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
  notifications: Notification[] = [];
  notificationCount = 0;

  constructor(
    private cartService: CartService,
    private userService: UserService,
    private sharedService: SharedService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cartService.getCartObservable().subscribe((newCart) => {
      this.cartQuantity = newCart.totalCount;
    });

    this.userService.userObservable.subscribe((user) => {
      if (user.id) {
        this.user = user;
        this.loadNotifications();
      }
    });
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

  toggleNotifications() {
    this.loadNotifications();
    console.log("h");
    if (this.notificationCount > 0) {
      console.log("h");
      this.sharedService.markNotificationsAsRead().subscribe(() => {
        this.notificationCount = 0;
        this.cd.detectChanges();
      });
    }
  }  
  
  loadNotifications() {
    this.sharedService.fetchNotifications().subscribe((notifications) => {
        this.notifications = notifications;
        this.notificationCount = notifications.filter(notification => !notification.isRead).length;
        this.cd.detectChanges();
    });
  }

}
