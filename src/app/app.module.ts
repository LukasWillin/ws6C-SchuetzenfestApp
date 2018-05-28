import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { FirebaseServiceProvider } from '../providers/firebase-service/firebase-service';
import {SchuetzenfestPage} from "../pages/schuetzenfest/schuetzenfest";
import {SchuetzePage} from "../pages/schuetze/schuetze";
import {ResultatPage} from "../pages/resultat/resultat";
import {StichPage} from "../pages/stich/stich";

@NgModule({
  declarations: [
    MyApp,
    SchuetzenfestPage,
    SchuetzePage,
    ResultatPage,
    StichPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    SchuetzenfestPage,
    SchuetzePage,
    ResultatPage,
    StichPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    FirebaseServiceProvider
  ]
})
export class AppModule {}
