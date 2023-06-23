import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
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
  isRecording: boolean = false;
  stream!: MediaStream;
  p: number = 1;
  
  constructor(private eventService:EventService, private activatedRoute:ActivatedRoute, private ngZone: NgZone) {
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

    eventsObservable.subscribe(
      (serverEvents) => {
        this.events = serverEvents;
      },
      (error) => {
        if (error.status === 500 && error.error.message === 'No results') {
          this.events = [];
        } else {
          console.error(error);
        }
      }
    );
  }

  startRecording(): void {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      this.stream = stream;
      this.recorder = new RecordRTC(stream, { type: 'audio' });
      this.recorder.startRecording();
      this.isRecording = true;
    }).catch((err) => {
      console.error('Could not start recording: ', err);
    });
  }

  stopRecording(): void {
    if (this.recorder) {
      this.isRecording = false;
      this.recorder.stopRecording(() => {
        let blob = this.recorder.getBlob();
        this.sendToServer(blob);
        this.stream.getTracks().forEach(track => track.stop());
        this.recorder = null;
      });
    }
  }

  private sendToServer(blob: Blob): void {
    if (blob.size > 70) {
      this.eventService.transcribeAudio(blob).subscribe((res) => {
        this.ngZone.run(() => {
          this.searchTerm = res.transcription;
          this.searchEvents();
        });
      });
    } else {
      console.log('Audio too short');
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchEvents();
  }

}
