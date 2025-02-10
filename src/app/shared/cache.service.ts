import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class CacheService {

  // Durée par défaut du cache (en secondes)
  private defaultCacheDuration: number = 2 * 60 * 60; // 2 heures en secondes

  constructor() {}

  // Récupérer les données du cache
  getFromCache<T>(key: string): T | null {
    const cachedData = localStorage.getItem(key);
    if (!cachedData) {
      return null;
    }

    const parsedData = JSON.parse(cachedData);
    const currentTime = new Date().getTime();

    // Vérifier si le cache est expiré
    if (parsedData.expiry < currentTime) {
      localStorage.removeItem(key);
      return null;
    }

    return parsedData.data;
  }

  // Stocker les données dans le cache avec une date d'expiration
  setToCache<T>(key: string, data: T, durationInSeconds: number = this.defaultCacheDuration): void {
    const currentTime = new Date().getTime();
    const expiry = currentTime + durationInSeconds * 1000; // En millisecondes

    const cacheData = {
      data,
      expiry
    };

    localStorage.setItem(key, JSON.stringify(cacheData));
  }
}
