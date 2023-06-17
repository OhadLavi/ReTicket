import { Component, OnInit } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { UserService } from 'src/app/services/user.service';
import { Notification } from 'src/app/shared/models/Notification';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private sharedService: SharedService, private userService:UserService) {}

  ngOnInit(): void {
    this.userService.userObservable.subscribe((user) => {
      if (user.id) {
        this.loadNotifications(user.id);
      }
    });
  }
  
  loadNotifications(userId: string) {
    this.sharedService.fetchNotifications(userId).subscribe((notifications) => {
      this.notifications = notifications;
      console.log(this.notifications);
    });
  }
}
