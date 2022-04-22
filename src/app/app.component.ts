import { Component, HostBinding, OnInit } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { SPINNER } from 'ngx-ui-loader';

import { constants } from './constants';
import { ThemingService } from './theming.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // the 500 level of mat light blue palette
  primaryColor = '#03A9F4';
  SPINNER = SPINNER;
  themes = constants.THEMES;
  year = new Date().getFullYear();

  @HostBinding('class') public cssClass = constants.DEFAULT_THEME;

  constructor(
    private overlayContainer: OverlayContainer,
    public themingService: ThemingService
  ) {}

  ngOnInit(): void {
    this.themingService.theme.subscribe((theme: string) => {
      this.cssClass = theme;
      const oCClasses = this.overlayContainer.getContainerElement().classList;
      oCClasses.remove(...Array.from(this.themes));
      oCClasses.add(this.cssClass);
    });
  }

  changeTheme(): void {
    this.cssClass =
      this.themes.indexOf(this.cssClass) == 0 ? this.themes[1] : this.themes[0];
    this.themingService.theme.next(this.cssClass);
    localStorage.setItem(constants.LS_THEME_KEY, this.cssClass);
  }
}
