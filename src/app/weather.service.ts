import {Injectable, Signal, signal, effect, inject} from '@angular/core';
import {Observable} from 'rxjs';

import {HttpClient} from '@angular/common/http';
import {CurrentConditions} from './current-conditions/current-conditions.type';
import {ConditionsAndZip} from './conditions-and-zip.type';
import {Forecast} from './forecasts-list/forecast.type';
import {LocationService} from './location.service';
import {CacheService} from './shared/cache.service';
import {tap} from 'rxjs/operators';

@Injectable()
export class WeatherService {

  static URL = 'https://api.openweathermap.org/data/2.5';
  static APPID = '5a4b2d457ecbef9eb2a71e480b947604';
  static ICON_URL = 'https://raw.githubusercontent.com/udacity/Sunshine-Version-2/sunshine_master/app/src/main/res/drawable-hdpi/';
  private currentConditions = signal<ConditionsAndZip[]>([]);
  private locationService = inject(LocationService);
  private cacheService = inject(CacheService);
  private httpClient = inject(HttpClient);

  constructor() {
    // Écoute les changements des emplacements et met à jour les conditions météo
    effect(
        () => {
          this.refreshWeatherData(this.locationService.getLocations()());
        },
        { allowSignalWrites: true }
    );
  }

  private refreshWeatherData(locations: string[]): void {
    this.currentConditions.set([]); // Réinitialiser les conditions
    locations.forEach(zip => this.addCurrentConditions(zip));
  }


  addCurrentConditions(zipcode: string): void {
    const cacheKey = `currentConditions_${zipcode}`;
    // Vérifier si les données sont en cache
    const cachedData = this.cacheService.getFromCache<CurrentConditions>(cacheKey);
    if (cachedData) {
      // Utiliser les données en cache
      this.currentConditions.update(conditions => [...conditions, { zip: zipcode, data: cachedData }]);
      return;
    }

    // Si les données ne sont pas en cache, effectuer la requête HTTP
    this.httpClient.get<CurrentConditions>(
        `${WeatherService.URL}/weather?zip=${zipcode},us&units=imperial&APPID=${WeatherService.APPID}`
    ).subscribe({
      next: (data) => {
        // Mettre à jour le cache
        this.cacheService.setToCache(cacheKey, data);
        // Ajouter les données récupérées aux conditions actuelles
        this.currentConditions.update(conditions => [...conditions, { zip: zipcode, data }]);
      },
      error: (error) => {

        console.error(`Erreur lors de la récupération des conditions météo pour ${zipcode}:`, error);
        this.locationService.removeLocation(zipcode);
        alert(`Error while getting weather  ${zipcode}:`);

      }
    });
  }


  getCurrentConditions(): Signal<ConditionsAndZip[]> {
    return this.currentConditions.asReadonly();
  }

  getForecast(zipcode: string): Observable<Forecast> {
    const cacheKey = `forecast_${zipcode}`;

    // Vérifier si les prévisions sont en cache
    const cachedForecast = this.cacheService.getFromCache<Forecast>(cacheKey);
    if (cachedForecast) {
      // Retourner les prévisions en cache sous forme d'observable
      return new Observable(observer => {
        observer.next(cachedForecast);
        observer.complete();
      });
    }

    // Si les prévisions ne sont pas en cache, effectuer la requête HTTP
    return this.httpClient.get<Forecast>(`${WeatherService.URL}/forecast/daily?zip=${zipcode},us&units=imperial&cnt=5&APPID=${WeatherService.APPID}`)
        .pipe(tap(forecast => {
          // Mettre à jour le cache
          this.cacheService.setToCache(cacheKey, forecast);
        }));
  }

  getWeatherIcon(id): string {
    if (id >= 200 && id <= 232)
      return WeatherService.ICON_URL + "art_storm.png";
    else if (id >= 501 && id <= 511)
      return WeatherService.ICON_URL + "art_rain.png";
    else if (id === 500 || (id >= 520 && id <= 531))
      return WeatherService.ICON_URL + "art_light_rain.png";
    else if (id >= 600 && id <= 622)
      return WeatherService.ICON_URL + "art_snow.png";
    else if (id >= 801 && id <= 804)
      return WeatherService.ICON_URL + "art_clouds.png";
    else if (id === 741 || id === 761)
      return WeatherService.ICON_URL + "art_fog.png";
    else
      return WeatherService.ICON_URL + "art_clear.png";
  }

}
