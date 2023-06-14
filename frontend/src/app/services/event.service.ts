import { Injectable } from '@angular/core';
import { EventM } from '../shared/models/EventM';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URLS } from '../shared/constants/urls';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(private http:HttpClient) { }
  
  getAll(): Observable<EventM[]> {
    return this.http.get<EventM[]>(URLS.EVENT.GET_ALL);
  }

  getAllEventsBySearchTerm(searchTerm:string): Observable<EventM[]> {
    return this.http.get<EventM[]>(URLS.EVENT.GET_BY_SEARCH_TERM(searchTerm));
  }

  getEventById(foodId:string):Observable<EventM> {
    return this.http.get<EventM>(URLS.EVENT.GET_BY_ID(foodId));
  }

  transcribeAudio(audioBlob: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    return this.http.post(URLS.EVENT.GET_EVENT_TRANSCRIBE_AUDIO_URL, formData);
  }
}
