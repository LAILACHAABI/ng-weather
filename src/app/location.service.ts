import {Injectable, Signal, signal} from '@angular/core';
import {CacheService} from './shared/cache.service';

export const LOCATIONS : string = "locations";

@Injectable()
export class LocationService {

  locations = signal<string[]> (this.loadLocations());

  constructor(private cacheService: CacheService) {}

  // Charger les emplacements depuis le cache ou localStorage
  private loadLocations(): string[] {
    const cacheKey = LOCATIONS;

    // Vérifier si les données des emplacements sont en cache
    const cachedLocations = this.cacheService.getFromCache<string[]>(cacheKey);
    if (cachedLocations) {
      return cachedLocations;
    }

    // Si les emplacements ne sont pas en cache, les charger depuis localStorage
    const locString = localStorage.getItem(cacheKey);
    const locations = locString ? JSON.parse(locString) : [];

    // Mettre les emplacements dans le cache pour les prochaines utilisations
    this.cacheService.setToCache(cacheKey, locations);
    return locations;
  }

  addLocation(zipcode: string): void {
    this.locations.update(locations => {
      const updatedLocations = [...locations, zipcode];
      // Mettre à jour le cache des emplacements
      this.cacheService.setToCache(LOCATIONS, updatedLocations);
      return updatedLocations;
    });
    this.saveLocations();
  }

  removeLocation(zipcode: string): void {
    this.locations.update(locations => {
      const updatedLocations = locations.filter(loc => loc !== zipcode);
      // Mettre à jour le cache des emplacements
      this.cacheService.setToCache(LOCATIONS, updatedLocations);
      return updatedLocations;
    });
    this.saveLocations();
  }

  // Sauvegarder les emplacements dans localStorage (aussi mis à jour dans le cache)
  private saveLocations(): void {
    const locations = this.locations();
    localStorage.setItem(LOCATIONS, JSON.stringify(locations));
    // Mettre à jour les emplacements dans le cache
    this.cacheService.setToCache(LOCATIONS, locations);
  }

  // Récupérer les emplacements sous forme de signal
  getLocations(): Signal<string[]> {
    return this.locations.asReadonly();
  }
}
