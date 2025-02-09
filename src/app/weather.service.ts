import { Injectable } from '@angular/core';
import {Observable, BehaviorSubject, of, from} from 'rxjs';
import {catchError, map, mergeMap, reduce, switchMap, tap} from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { CurrentConditions } from './current-conditions/current-conditions.type';
import { ConditionsAndZip } from './conditions-and-zip.type';
import { Forecast } from './forecasts-list/forecast.type';
import { LocationService } from './location.service';
import {CacheService} from './shared/cache.service';

@Injectable()
export class WeatherService {

  static URL = 'https://api.openweathermap.org/data/2.5';
  static APPID = '5a4b2d457ecbef9eb2a71e480b947604';
  static ICON_URL = 'https://raw.githubusercontent.com/udacity/Sunshine-Version-2/sunshine_master/app/src/main/res/drawable-hdpi/';

  private currentConditionsSubject = new BehaviorSubject<ConditionsAndZip[]>([]);
  public currentConditions$ = this.currentConditionsSubject.asObservable();

  constructor(
      private http: HttpClient,
      private locationService: LocationService,
      private cacheService: CacheService
  ) {
    this.initializeLocationSubscription();
  }

  private initializeLocationSubscription(): void {
    this.locationService.locations$
        .pipe(
            switchMap((locations) => this.syncCurrentConditions(locations))
        )
        .subscribe();
  }

    private syncCurrentConditions(locations: string[]): Observable<void> {
        // Filtrer les conditions existantes
        const existingConditions = this.currentConditionsSubject.value
            .filter(condition => locations.includes(condition.zip));

        // Trouver les nouvelles locations
        const newLocations = locations
            .filter(zip => !existingConditions.some(condition => condition.zip === zip));

        // Si pas de nouvelles locations, mettre à jour avec les conditions existantes
        if (!newLocations.length) {
            this.currentConditionsSubject.next(existingConditions);
            return of(void 0);
        }

        // Récupérer les conditions météo pour les nouvelles locations
        return from(newLocations).pipe(
            mergeMap(zip => this.getWeatherConditions(zip).pipe(
                map(data => ({ zip, data })),
                catchError(error => {
                    this.locationService.removeLocation(zip);
                    console.error(`Erreur météo pour ${zip}:`, error);
                    alert(`Erreur météo ${zip}: ${error.statusText}`);
                    return of(null);
                })
            )),
            // Accumuler les résultats
            reduce((acc: ConditionsAndZip[], result) => {
                if (result) acc.push(result);
                return acc;
            }, existingConditions),
            // Mettre à jour le subject
            tap(results => this.currentConditionsSubject.next(results)),
            map(() => void 0)
        );
    }


    getCurrentConditions(): Observable<ConditionsAndZip[]> {
    return this.currentConditions$;
  }

  getWeatherConditions(zipcode: string) : Observable<CurrentConditions> {
      const cacheKey = `weather-${zipcode}`;
      const cachedData = this.cacheService.getItem(cacheKey);

      if (cachedData) {
          return of(cachedData);
      }
    return this.http.get<CurrentConditions>(`${WeatherService.URL}/weather?zip=${zipcode},us&units=imperial&APPID=${WeatherService.APPID}`)
        .pipe(
            tap((data) => this.cacheService.setCachedItem(cacheKey, data))
        );
  }

  getForecast(zipcode: string): Observable<Forecast> {
    // Here we make a request to get the forecast data from the API. Note the use of backticks and an expression to insert the zipcode

      const cacheKey = `forecast-${zipcode}`;
      const cachedData = this.cacheService.getItem(cacheKey);

      if (cachedData) {
          return of(cachedData);
      }
    return this.http.get<Forecast>(`${WeatherService.URL}/forecast/daily?zip=${zipcode},us&units=imperial&cnt=5&APPID=${WeatherService.APPID}`)
        .pipe(
            tap((data) => this.cacheService.setCachedItem(cacheKey, data))
        );
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
