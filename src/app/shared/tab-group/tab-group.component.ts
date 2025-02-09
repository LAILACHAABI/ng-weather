import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Observable} from 'rxjs';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';

export interface TabItem {
  title: string;
}

@Component({
  selector: 'app-tab-group',
  standalone: true,
  imports: [
    AsyncPipe,
    NgForOf,
    NgIf
  ],
  templateUrl: './tab-group.component.html',
  styleUrl: './tab-group.component.css'
})
export class TabGroupComponent  <T extends TabItem> {
  selectedIndex: number = 0;
  @Input() tabItems: Observable<T[]>;
  @Output() removeItem = new EventEmitter<T>();
  @Input() set selection(entry: T) {}
  @Output() selectionChange = new EventEmitter<T>();

  selectTab(entry: T) {
    this.selectionChange.emit(entry);
  }

  remove(entry: T) {
    this.removeItem.emit(entry);
    this.selectedIndex = 0;
  }
}
