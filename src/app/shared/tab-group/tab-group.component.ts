import { CommonModule } from '@angular/common';
import {
  AfterContentInit,
  Component,
  ContentChildren,
  EventEmitter,
  Output,
  QueryList,
  ChangeDetectorRef,
  signal,
} from '@angular/core';
import { TabDirective } from '../tab.directive';

/**
 * Component that manages a group of tabs
 * @description Handles tab switching, removal, and activation in a tab interface
 */
@Component({
  selector: 'app-tab-group',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab-group.component.html',
  styleUrl: './tab-group.component.css',
})
export class TabGroupComponent implements AfterContentInit {
  /**
   * Collection of tab items projected into the component
   */
  @ContentChildren(TabDirective)
  tabItems!: QueryList<TabDirective>;

  /**
   * Event emitter for when a tab is removed
   */
  @Output()
  removedTab = new EventEmitter<TabDirective>();

  /**
   * Currently active tab using signals
   */
  activeTab = signal<TabDirective | undefined>(undefined);

  constructor(private cdr: ChangeDetectorRef) {}

  /**
   * Lifecycle hook that runs after content initialization
   */
  ngAfterContentInit(): void {
    if (this.tabItems.length > 0) {
      this.activeTab.set(this.tabItems.first);
    }

    // Using built-in change detection
    this.tabItems.changes.subscribe(() => {
      this.handleTabsChange();
    });
  }

  /**
   * Removes a tab and handles active tab management
   */
  removeTab(tab: TabDirective, index: number): void {
    this.removedTab.emit(tab);

    if (tab === this.activeTab()) {
      const tabsArray = this.tabItems.toArray();
      if (tabsArray.length > 1) {
        this.activeTab.set(tabsArray[index > 0 ? index - 1 : 1] || tabsArray[0]);
      } else {
        this.activeTab.set(undefined);
      }
    }
  }

  /**
   * Activates a specific tab
   */
  activateTab(tab: TabDirective): void {
    if (tab !== this.activeTab()) {
      this.activeTab.set(tab);
    }
  }

  /**
   * Handles changes in the tabs collection
   */
  private handleTabsChange(): void {
    if (!this.activeTab() && this.tabItems.length > 0) {
      this.activeTab.set(this.tabItems.first);
    }
  }
}
