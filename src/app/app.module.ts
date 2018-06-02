import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { FirebaseServiceProvider } from './firebase-service';
import { SchuetzenfestPage } from "../pages/schuetzenfest/schuetzenfest";
import { SchuetzePage } from "../pages/schuetze/schuetze";
import { ResultatPage } from "../pages/resultat/resultat";
import { StichPage } from "../pages/stich/stich";

import { HttpModule } from "@angular/http";
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireModule } from 'angularfire2';
import {CreateSchuetzenfestPage} from "../pages/create-schuetzenfest/create-schuetzenfest";
import {CreateSchuetzePage} from "../pages/create-schuetze/create-schuetze";

const firebaseConfig = {
  apiKey: "AIzaSyCkW_Qob61IQRreDHnDtqw3nhAPwZ7dywM",
  authDomain: "schuetzenfestapp.firebaseapp.com",
  databaseURL: "https://schuetzenfestapp.firebaseio.com",
  projectId: "schuetzenfestapp",
  storageBucket: "schuetzenfestapp.appspot.com",
  messagingSenderId: "793873349094"
};

@NgModule({
  declarations: [
    MyApp,
    SchuetzenfestPage,
    CreateSchuetzenfestPage,
    SchuetzePage,
    CreateSchuetzePage,
    ResultatPage,
    StichPage
  ],
  imports: [
    HttpModule,
    AngularFireDatabaseModule,
    AngularFireModule.initializeApp(firebaseConfig),
    BrowserModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    SchuetzenfestPage,
    CreateSchuetzenfestPage,
    SchuetzePage,
    CreateSchuetzePage,
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
