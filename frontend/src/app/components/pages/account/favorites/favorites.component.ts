import { Component, OnInit } from '@angular/core';
import { EventService } from 'src/app/services/event.service';
import { UserService } from 'src/app/services/user.service';
import { EventM } from 'src/app/shared/models/EventM';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  favorites!: EventM[];

  constructor(private eventService: EventService, private userService: UserService) {}

  ngOnInit() {
    this.eventService.getUserFavorites(this.userService.currentUser.id)
      .subscribe(favorites => {
        this.favorites = favorites;
      });
  }
  
}
