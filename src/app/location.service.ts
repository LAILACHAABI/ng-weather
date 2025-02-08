import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

export const LOCATIONS : string = "locations";

@Injectable()
export class LocationService {

  private locationsSubject = new BehaviorSubject<string[]>([]);
  locations$ = this.locationsSubject.asObservable();

  constructor() {
    let locString = localStorage.getItem(LOCATIONS);
    if (locString) {
      const locations = JSON.parse(locString);
      this.locationsSubject.next(locations);
    }
  }

  addLocation(zipcode : string) {
    const currentLocations = this.locationsSubject.getValue();
    if (!currentLocations.includes(zipcode)) {
      const updatedLocations = [...currentLocations, zipcode];
      this.locationsSubject.next(updatedLocations);
      localStorage.setItem(LOCATIONS, JSON.stringify(updatedLocations));
    }
  }

  removeLocation(zipcode : string) {
    const currentLocations = this.locationsSubject.value;
    const updatedLocations = currentLocations.filter(loc => loc !== zipcode);
    this.locationsSubject.next(updatedLocations);
    localStorage.setItem(LOCATIONS, JSON.stringify(updatedLocations));
  }
}
