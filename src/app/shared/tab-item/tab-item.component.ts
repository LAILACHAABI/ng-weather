import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';

@Component({
  selector: 'app-tab-item',
  standalone: true,
  imports: [],
  template: `
    <div [style.display]="active ? 'block' : 'none'">
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabItemComponent {
  @Input() id!: string;
  @Input() title!: string;

  private _active = false;

  get active(): boolean {
    return this._active;
  }

  set active(value: boolean) {
    if (this._active !== value) {
      this._active = value;
      this.cdr.markForCheck();
    }
  }

  constructor(private cdr: ChangeDetectorRef) {}
}
