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
  
  // Gets all events
  getAll(): Observable<EventM[]> {
    return this.http.get<EventM[]>(URLS.EVENT.GET_ALL);
  }

  // Gets all events by search term
  getAllEventsBySearchTerm(searchTerm:string): Observable<EventM[]> {
    return this.http.get<EventM[]>(URLS.EVENT.GET_BY_SEARCH_TERM(searchTerm));
  }

  // Gets all events by id  
  getEventById(eventId:string):Observable<EventM> {
    return this.http.get<EventM>(URLS.EVENT.GET_BY_ID(eventId));
  }

  // Find tickets by event id
  findTickets(eventId: string, quantity: number): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(URLS.EVENT.GET_TICKETS_URL(eventId, quantity));
  }

  // Transcribes audio file to text using Google Cloud Speech-to-Text API
  transcribeAudio(audioBlob: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    return this.http.post(URLS.EVENT.GET_EVENT_TRANSCRIBE_AUDIO_URL, formData);
  }

  // Check if user is in waiting list
  checkUserInWaitingList(eventId: string): Observable<boolean> {
    return this.http.get<boolean>(URLS.EVENT.GET_CHECK_IN_WAITING_LIST_URL(eventId));
  }
  
  // Add user to waiting list
  addToWaitingList(eventId: string): Observable<EventM> {
    return this.http.post<EventM>(URLS.EVENT.GET_ADD_TO_WAITING_LIST_URL(eventId), {});
  }
  
  // Remove user from waiting list
  removeFromWaitingList(eventId: string): Observable<EventM> {
    return this.http.delete<EventM>(URLS.EVENT.GET_REMOVE_FROM_WAITING_LIST_URL(eventId));
  }

  // Check if event is favorite
  isEventFavorite(eventId: string): Observable<{ isFavorite: boolean }> {
    return this.http.get<{ isFavorite: boolean }>(URLS.EVENT.IS_FAVORITE(eventId));
  }  

  // Favorite an event
  favoriteEvent(eventId: string): Observable<EventM> {
    return this.http.post<EventM>(URLS.EVENT.FAVORITE(eventId), {});
  }

  // Unfavorite an event
  unfavoriteEvent(eventId: string): Observable<EventM> {
    return this.http.delete<EventM>(URLS.EVENT.UNFAVORITE(eventId));
  }

  // Get user favorites
  getUserFavorites(): Observable<EventM[]> {
    return this.http.get<EventM[]>(URLS.EVENT.GET_FAVORITES_EVENTS_URL);
  }
  
}
