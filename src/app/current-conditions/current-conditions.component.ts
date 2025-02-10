import {CommonModule} from '@angular/common';
import {Component, inject, Signal} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ConditionsAndZip} from '../conditions-and-zip.type';
import {LocationService} from '../location.service';
import {WeatherService} from '../weather.service';
import {TabGroupComponent} from '../shared/tab-group/tab-group.component';
import {TabDirective} from '../shared/tab.directive';

@Component({
    selector: 'app-current-conditions',
    standalone: true,
    imports: [CommonModule, RouterModule, TabGroupComponent, TabDirective],
    templateUrl: './current-conditions.component.html',
    styleUrls: ['./current-conditions.component.css']
})
export class CurrentConditionsComponent {

    protected weatherService = inject(WeatherService);
    protected locationService = inject(LocationService);
    protected currentConditionsByZip: Signal<ConditionsAndZip[]> = this.weatherService.getCurrentConditions();

}
