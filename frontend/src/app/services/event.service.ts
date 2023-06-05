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
    return this.http.get<EventM[]>(URLS.FOOD.GET_ALL);
  }

  getAllEventsBySearchTerm(searchTerm:string) {
    // return this.getAll().filter(food => food.name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()));
    return this.http.get<EventM[]>(URLS.FOOD.GET_BY_SEARCH_TERM(searchTerm));
  }

  getEventById(foodId:string):Observable<EventM> {
    // return this.getAll().find(food => food.id === foodId) ?? new Food();
    return this.http.get<EventM>(URLS.FOOD.GET_BY_ID(foodId));
  }
}
