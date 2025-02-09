import {Component, DestroyRef, inject} from '@angular/core';
import {WeatherService} from "../weather.service";
import {LocationService} from "../location.service";
import {ConditionsAndZip} from '../conditions-and-zip.type';
import {Observable} from 'rxjs';
import { map} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-current-conditions',
  templateUrl: './current-conditions.component.html',
  styleUrls: ['./current-conditions.component.css']
})
export class CurrentConditionsComponent {

  private weatherService = inject(WeatherService);
  protected locationService = inject(LocationService);
  protected selected : ConditionsAndZip;
  private destroyRef = inject(DestroyRef);

  protected currentConditionsByZip$: Observable<ConditionsAndZip[]>  = this.weatherService.getCurrentConditions().pipe(
      map((conditions: ConditionsAndZip[]) =>
          conditions.map((condition: ConditionsAndZip) =>
              ({...condition, title: `${condition.data.name} (${condition.zip})`})
          )));


  constructor() {
    this.getFirstElement();
  }

  remove(item: ConditionsAndZip) {
    this.locationService.removeLocation(item.zip);

    this.selected = null;
  }

  getFirstElement() {
    this.currentConditionsByZip$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((conditions) => {
      if (conditions.length > 0) {
        // Si aucun élément n'est sélectionné ou si l'élément sélectionné n'existe plus, prendre le premier
        if (!this.selected || !conditions.find(c => c.zip === this.selected?.zip)) {
          this.selected = conditions[0];
        }
      } else {
        this.selected = null; // Réinitialisation si la liste est vide
      }
    });
  }
}
