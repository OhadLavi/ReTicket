import { Injectable } from '@angular/core';
import { EventM } from '../shared/models/EventM';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URLS } from '../shared/constants/urls';
import { Ticket } from '../shared/interfaces/ITicket';

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

  getEventById(eventId:string):Observable<EventM> {
    return this.http.get<EventM>(URLS.EVENT.GET_BY_ID(eventId));
  }

  findTickets(eventId: string, quantity: number): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(URLS.EVENT.GET_TICKETS_URL(eventId, quantity));
  }

  transcribeAudio(audioBlob: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    return this.http.post(URLS.EVENT.GET_EVENT_TRANSCRIBE_AUDIO_URL, formData);
  }

  checkUserInWaitingList(eventId: string, userId: string): Observable<boolean> {
    console.log("here");
    return this.http.get<boolean>(URLS.EVENT.GET_CHECK_IN_WAITING_LIST_URL(eventId, userId));
  }
  
  addToWaitingList(eventId: string, userId: string): Observable<EventM> {
    console.log(URLS.EVENT.GET_ADD_TO_WAITING_LIST_URL(eventId), {userId});
    return this.http.post<EventM>(URLS.EVENT.GET_ADD_TO_WAITING_LIST_URL(eventId), {userId});
  }

  removeFromWaitingList(eventId: string, userId: string): Observable<EventM> {
    return this.http.delete<EventM>(URLS.EVENT.GET_REMOVE_FROM_WAITING_LIST_URL(eventId, userId));
  }

  isEventFavorite(eventId: string): Observable<{ isFavorite: boolean }> {
    return this.http.get<{ isFavorite: boolean }>(URLS.EVENT.IS_FAVORITE(eventId));
  }  

  favoriteEvent(eventId: string): Observable<EventM> {
    return this.http.post<EventM>(URLS.EVENT.FAVORITE(eventId), eventId);
  }

  unfavoriteEvent(eventId: string): Observable<EventM> {
    return this.http.delete<EventM>(URLS.EVENT.UNFAVORITE(eventId));
  }

  getUserFavorites(userId: string): Observable<EventM[]> {
    return this.http.get<EventM[]>(URLS.USER.GET_FAVORITES(userId));
  }

  
}
