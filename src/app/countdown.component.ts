import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

import { constants } from './constants';
import { ThemingService } from './theming.service';

declare const FlipDown: any;

@Component({
  selector: 'app-countdown',
  template: `
    <div mx-auto>
      <h2 bold text-center>CLASS IN</h2>
      <div #flipdown class="flipdown" mx-auto></div>
    </div>
  `,
  styles: [
    'h2 {font-size: 20px; margin-bottom: 16px; font-weight: normal;}',
    'h2 {text-decoration: 2px double underline;}'
  ]
})
export class CountdownComponent implements AfterViewInit {
  flipdown: any;
  @ViewChild('flipdown') flipdownDivRef!: ElementRef;

  constructor(public theming: ThemingService) {}

  ngAfterViewInit(): void {
    this.theming.theme.subscribe((theme: string) => {
      theme = constants.THEMES.map((t) => t.split('-')[0]).filter(
        (t) => t != theme.split('-')[0]
      )[0];

      if (!this.flipdown) {
        this.flipdown = new FlipDown(
          Math.round(new Date(constants.CLASS_DATE).getTime() / 1000),
          this.flipdownDivRef.nativeElement,
          { theme }
        );
        this.flipdown.start();
      } else {
        this.flipdown.element.classList.remove(
          Array.from(this.flipdown.element.classList).filter((t) =>
            /flipdown__theme/.test(t as string)
          )
        );
        this.flipdown.element.classList.add(`flipdown__theme-${theme}`);
      }
    });
  }
}
