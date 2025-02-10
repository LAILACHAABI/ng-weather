import { Directive, Input, TemplateRef } from '@angular/core';

/**
 * Directive to handle tabs in a user interface
 * @description This directive allows defining the content and title of a tab
 */
@Directive({
  selector: "[tab]",
  standalone: true,
})
export class TabDirective {
  /**
   * Title of the tab
   * @default ""
   */
  @Input() title: string = "";

  /**
   * Template reference for the tab content
   * @required
   */
  @Input({ required: true }) templateRef!: TemplateRef<{ content: any }>;



/**
   * Content of the tab
   * @description Can be of any type
   */
  @Input() content: any;

  /**
   * Indicates if the tab is active
   * @default false
   */
  @Input() isActive: boolean = false;

  /**
   * Unique identifier for the tab
   * @default automatically generated
   */
  readonly id: string = `tab-${Math.random().toString(36).substr(2, 9)}`;

  constructor() {
    if (!this.title) {
      console.warn('TabDirective: It is recommended to define a title for the tab');
    }
  }
}
