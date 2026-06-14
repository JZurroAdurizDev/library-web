import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {

  /**
   * Current year displayed in the copyright section.
   */
  public year: number;

  constructor() {

    /**
     * Initializes the current year when the component is created.
     */
    this.year = new Date().getFullYear();
  }
}