import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import {FirebaseServiceProvider} from "./firebase-service";
import {Schuetze} from "./entities/Schuetze";
import {Schuetzenfest} from "./entities/Schuetzenfest";
import {SchuetzenfestListPage} from "../pages/schuetzenfest-list/schuetzenfest-list";
import {Stich} from "./entities/Stich";
import {Resultat} from "./entities/Resultat";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = SchuetzenfestListPage;

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, public fb:FirebaseServiceProvider) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Schützenfest', component: SchuetzenfestListPage },
    ];

    (<any>window).GlobalFBService = fb;
    (<any>window).GlobalSchuetze = Schuetze;
    (<any>window).GlobalSchuetzenfest = Schuetzenfest;
    (<any>window).GlobalStich = Stich;
    (<any>window).GlobalResultat = Resultat;
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
