import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import {SchuetzenfestPage} from "../pages/schuetzenfest/schuetzenfest";
import {SchuetzePage} from "../pages/schuetze/schuetze";
import {StichPage} from "../pages/stich/stich";
import {ResultatPage} from "../pages/resultat/resultat";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = SchuetzenfestPage;

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Schuetzenfest', component: SchuetzenfestPage },
      { title: 'Schuetze', component: SchuetzePage},
      { title: 'Stich', component: StichPage},
      { title: 'Resultat', component: ResultatPage}
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
