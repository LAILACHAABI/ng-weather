import {Injectable, Signal, signal} from '@angular/core';
import {Observable} from 'rxjs';

import {HttpClient} from '@angular/common/http';
import {CurrentConditions} from './current-conditions/current-conditions.type';
import {ConditionsAndZip} from './conditions-and-zip.type';
import {Forecast} from './forecasts-list/forecast.type';
import {LocationService} from './location.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Injectable()
export class WeatherService {

  static URL = 'https://api.openweathermap.org/data/2.5';
  static APPID = '5a4b2d457ecbef9eb2a71e480b947604';
  static ICON_URL = 'https://raw.githubusercontent.com/udacity/Sunshine-Version-2/sunshine_master/app/src/main/res/drawable-hdpi/';
  private currentConditions = signal<ConditionsAndZip[]>([]);

  constructor(private http: HttpClient, private locationService: LocationService) {
    this.initializeLocationSubscription();
  }
  private initializeLocationSubscription(): void {
    this.locationService.locations$
        .pipe(takeUntilDestroyed())
        .subscribe(locations => {
          this.syncCurrentConditions(locations);
        });
  }
  private syncCurrentConditions(locations: string[]): void {
    this.currentConditions.update(conditions => {
      // Garde uniquement les conditions des locations existantes
      const existingConditions = conditions.filter(condition =>
          locations.includes(condition.zip)
      );

      // Trouve les nouvelles locations à ajouter
      const newLocations = locations.filter(location =>
          !conditions.some(condition => condition.zip === location)
      );

      // Pour chaque nouvelle location, fait un appel API pour obtenir les conditions
      newLocations.forEach(zipcode => {
        this.getWeatherConditions(zipcode).subscribe({
          next: (data) => {
            this.currentConditions.update(current => [...current, { zip: zipcode, data }]);
          },
          error: (error) => {
            // Supprime le zipcode du LocationService pour tout type d'erreur
            this.locationService.removeLocation(zipcode);

            // Log l'erreur avec des informations contextuelles
            console.error(`Erreur lors de la récupération des conditions météo pour ${zipcode}:`, {
              status: error.status,
              message: error.message,
              error
            });
            alert(`Error while getting  ${zipcode} weather : ${error.statusText}`);
          }
        });
      });

      return existingConditions;
    });
  }


  getCurrentConditions(): Signal<ConditionsAndZip[]> {
    return this.currentConditions.asReadonly();
  }

  getWeatherConditions(zipcode: string) : Observable<CurrentConditions> {
    return this.http.get<CurrentConditions>(`${WeatherService.URL}/weather?zip=${zipcode},us&units=imperial&APPID=${WeatherService.APPID}`);
  }

  getForecast(zipcode: string): Observable<Forecast> {
    // Here we make a request to get the forecast data from the API. Note the use of backticks and an expression to insert the zipcode
    return this.http.get<Forecast>(`${WeatherService.URL}/forecast/daily?zip=${zipcode},us&units=imperial&cnt=5&APPID=${WeatherService.APPID}`);
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
