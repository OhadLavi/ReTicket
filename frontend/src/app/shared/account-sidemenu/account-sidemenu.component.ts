import { Component, OnInit } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { TicketService } from 'src/app/services/ticket.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/shared/models/User';

@Component({
  selector: 'app-account-sidemenu',
  templateUrl: './account-sidemenu.component.html',
  styleUrls: ['./account-sidemenu.component.css']
})

export class AccountSidemenuComponent implements OnInit {

  public isCollapsed = true;
  myitems: any;
  user!:User;
  notificationCount = 0;
  ticketCount = 0;

  constructor(private userService:UserService, private sharedService: SharedService, private ticketService: TicketService) {
    this.userService.userObservable.subscribe((user)=>{
      if (user.id) {
        this.user = user;
        this.loadNotifications(user.id);
        this.loadTickets(user.id);
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

  loadNotifications(userId: string) {
    this.sharedService.fetchNotifications().subscribe((notifications) => {
      this.notificationCount = notifications.length;
    });
  }

  loadTickets(userId: string) {
    this.ticketService.fetchUserTickets(userId).subscribe((tickets) => {
      this.ticketCount = tickets.sellingTickets.length + tickets.boughtTickets.length;
    });
  }
}
