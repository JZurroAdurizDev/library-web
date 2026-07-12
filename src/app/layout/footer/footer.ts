import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
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