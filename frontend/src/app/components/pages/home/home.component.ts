import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { EventService } from 'src/app/services/event.service';
import { EventM } from 'src/app/shared/models/EventM';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent {
  events:EventM[] = [];
  constructor(private eventService:EventService, activatedRoute:ActivatedRoute) {
    let eventsObservable:Observable<EventM[]>;
    activatedRoute.params.subscribe((params) => {
      if (params.searchTerm)
        eventsObservable = this.eventService.getAllEventsBySearchTerm(params.searchTerm);
      else
        eventsObservable = eventService.getAll();

      eventsObservable.subscribe((serverEvents) => {this.events = serverEvents;});
    });
  }

  ngOnInit(): void {
  
  }
}
