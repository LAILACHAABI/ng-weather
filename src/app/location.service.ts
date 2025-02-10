import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CacheService } from './cache.service';

export const LOCATIONS: string = 'locations';

@Injectable()
export class LocationService {


  private locationsSubject = new BehaviorSubject<string[]>([]);
  locations$: Observable<string[]> = this.locationsSubject.asObservable();
  private cacheService = inject(CacheService);

  constructor() {
    let locations = this.cacheService.getItem(LOCATIONS) || [];
    this.locationsSubject.next(locations);
  }

  addLocation(zipcode: string) {
    const  currentLocations = this.locationsSubject.getValue();
    if (!currentLocations.includes(zipcode)) {
      const updatedLocations = [...currentLocations, zipcode];
      this.locationsSubject.next(updatedLocations);
      this.cacheService.setItem(LOCATIONS, updatedLocations);
    }
  }

  removeLocation(zipcode: string) {
    const updatedLocations = this.locationsSubject.value.filter((loc) => loc !== zipcode);
    this.cacheService.setItem(LOCATIONS, updatedLocations);
    this.locationsSubject.next(updatedLocations);
  }
}
