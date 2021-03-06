import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { FirebaseServiceProvider } from './firebase-service';

import { HttpModule } from "@angular/http";
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireModule } from 'angularfire2';
import {SchuetzeCreatePage} from "../pages/schuetze-create/schuetze-create";
import {SchuetzeResultatPage} from "../pages/schuetze-resultat/schuetze-resultat";
import {SchuetzenfestCreatePage} from "../pages/schuetzenfest-create/schuetzenfest-create";
import {SchuetzenfestListPage} from "../pages/schuetzenfest-list/schuetzenfest-list";
import {SchuetzenfestShowPage} from "../pages/schuetzenfest-show/schuetzenfest-show";
import {StichShowPage} from "../pages/stich-show/stich-show";
import {StichCreatePage} from "../pages/stich-create/stich-create";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {SchuetzeEditPage} from "../pages/schuetze-edit/schuetze-edit";
import {StichEditPage} from "../pages/stich-edit/stich-edit";
import {SchuetzenfestEditPage} from "../pages/schuetzenfest-edit/schuetzenfest-edit";
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

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
    SchuetzeCreatePage,
    SchuetzeEditPage,
    SchuetzeResultatPage,
    SchuetzenfestCreatePage,
    SchuetzenfestListPage,
    SchuetzenfestEditPage,
    SchuetzenfestShowPage,
    StichShowPage,
    StichCreatePage,
    StichEditPage
  ],
  imports: [
    HttpModule,
    AngularFireDatabaseModule,
    AngularFireModule.initializeApp(firebaseConfig),
    BrowserModule,
    IonicModule.forRoot(MyApp),
    BrowserAnimationsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    SchuetzeCreatePage,
    SchuetzeEditPage,
    SchuetzeResultatPage,
    SchuetzenfestCreatePage,
    SchuetzenfestListPage,
    SchuetzenfestEditPage,
    SchuetzenfestShowPage,
    StichShowPage,
    StichCreatePage,
    StichEditPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    BarcodeScanner,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    FirebaseServiceProvider
  ]
})
export class AppModule {}
