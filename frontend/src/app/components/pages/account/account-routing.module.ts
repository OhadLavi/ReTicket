import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { TicketsComponent } from './tickets/tickets.component';
import { NotificationsComponent } from './notifications/notifications.component';

const routes: Routes = [
  {
    path: 'profile', component: ProfileComponent
  },
  {
    path: 'tickets', component: TicketsComponent
  },
  {
    path: 'notifications', component: NotificationsComponent
  }
  // {
  //   path: 'mycollection', component: MyCollectionComponent
  // },
  // {
  //   path: 'favorite', component: FavoriteComponent
  // },
  // {
  //   path: 'notification', component: NotificationComponent
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }

