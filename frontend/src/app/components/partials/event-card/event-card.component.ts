import { Component, Input, OnInit } from '@angular/core';
import { EventM } from 'src/app/shared/models/EventM';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.css']
})
export class EventCardComponent implements OnInit {
  @Input() eventA!: EventM;

  constructor() { }

  ngOnInit(): void {
    console.log(this.eventA);
  }

}
