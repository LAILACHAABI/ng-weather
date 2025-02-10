import {Injectable, Signal, signal} from '@angular/core';

export const LOCATIONS : string = "locations";

@Injectable()
export class LocationService {

  locations = signal<string[]> (this.loadLocations());

  constructor() {}

  private loadLocations() : string[] {
    let locString = localStorage.getItem(LOCATIONS);
    return locString ? JSON.parse(locString) : [];
  }

  addLocation(zipcode : string) {
    this.locations.update(locations => [...locations,zipcode]);
    this.saveLocations();
  }

  removeLocation(zipcode : string) {
    this.locations.update(locations => locations.filter(loc => loc !== zipcode));
    this.saveLocations();
  }

  private saveLocations(): void {
    localStorage.setItem(LOCATIONS, JSON.stringify(this.locations()));
  }

  getLocations(): Signal<string[]> {
    return this.locations.asReadonly();
  }
}
