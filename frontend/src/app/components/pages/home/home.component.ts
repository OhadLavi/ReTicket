import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { EventService } from 'src/app/services/event.service';
import { EventM } from 'src/app/shared/models/EventM';
import { FormControl } from '@angular/forms';
import * as RecordRTC from 'recordrtc';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent {
  events:EventM[] = [];
  searchTerm: string = '';
  private recorder: any;
  circleCircumference: number = 2 * Math.PI * 10;
  circleDashoffset: number = this.circleCircumference;
  isFilling: boolean = false;
  isRecording: boolean = false;

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

  sendDummyAudio(): void {
    fetch('assets/dummy-audio.mp3')
      .then(response => response.blob())
      .then(blob => this.eventService.transcribeAudio(blob).subscribe((res) => {
        this.searchTerm = res.transcription;
        this.searchEvents();
      }));
  }

  startRecording(): void {
    console.log('start recording');
    this.sendDummyAudio();
    // this.isRecording = true;
    // const mediaConstraints = { video: false, audio: true };
    // navigator.mediaDevices.getUserMedia(mediaConstraints).then(this.processRecording.bind(this));
  }

  private processRecording(stream: MediaStream): void {
    console.log('process recording');
    this.recorder = new RecordRTC(stream, { type: 'audio' });
    this.recorder.startRecording();
  }

  stopRecording(): void {
    console.log('stop recording');
    this.isRecording = false;
    if (this.recorder) {
      this.recorder.stopRecording(() => {
        this.sendToServer(this.recorder.getBlob());
      });
    }
  }

  private sendToServer(blob: Blob): void {
    this.eventService.transcribeAudio(blob).subscribe((res) => {
      this.searchTerm = res.transcription;
      this.searchEvents();
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchEvents();
  }

}
