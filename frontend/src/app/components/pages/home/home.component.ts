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
  searchTerm: string = '';

  constructor(private eventService:EventService, private activatedRoute:ActivatedRoute) {
    this.activatedRoute.params.subscribe((params) => {
      if (params.searchTerm)
        this.searchTerm = params.searchTerm;
    });
  }

  ngOnInit(): void {
    this.searchEvents();
  }

  searchEvents(): void {
    let eventsObservable:Observable<EventM[]>;
    if (this.searchTerm)
      eventsObservable = this.eventService.getAllEventsBySearchTerm(this.searchTerm);
    else
      eventsObservable = this.eventService.getAll();

    eventsObservable.subscribe((serverEvents) => {this.events = serverEvents;
    console.log(this.events);});
  }
}
