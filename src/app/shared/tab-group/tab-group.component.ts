import {AfterContentInit, Component, ContentChildren, EventEmitter, Output, QueryList} from '@angular/core';
import {TabItemComponent} from '../tab-item/tab-item.component';
import {Tab} from '../models';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-tab-group',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './tab-group.component.html',
  styleUrl: './tab-group.component.css'
})
export class TabGroupComponent implements AfterContentInit {
  @ContentChildren(TabItemComponent) tabItems!: QueryList<TabItemComponent>;
  @Output() tabClosed = new EventEmitter<string>();
  tabs: Tab[] = [];

  ngAfterContentInit() {
    this.initializeTabs();
    this.tabItems.changes.subscribe(() => {
      this.initializeTabs();
    });
  }

  private initializeTabs() {
    this.tabs = this.tabItems.map((item, index) => ({
      id: item.id,
      title: item.title,
      active: index === 0
    }));
    this.updateActiveStates();
  }
  private updateActiveStates() {
    this.tabItems.forEach(item => {
      const tab = this.tabs.find(t => t.id === item.id);
      item.active = tab?.active || false;
    });
  }

  selectTab(tab: Tab) {
    this.tabs.forEach(t => t.active = t.id === tab.id);
    this.updateActiveStates();
  }

  closeTab(tab: Tab, event: Event) {
    event.stopPropagation();
    this.tabClosed.emit(tab.id);

    const index = this.tabs.findIndex(t => t.id === tab.id);
    if (tab.active && this.tabs.length > 1) {
      const newIndex = index === this.tabs.length - 1 ? index - 1 : index + 1;
      this.tabs[newIndex].active = true;
    }
  }

}
