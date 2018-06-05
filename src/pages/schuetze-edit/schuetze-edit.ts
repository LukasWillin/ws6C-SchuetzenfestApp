import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {CRUD, FirebaseServiceProvider} from "../../app/firebase-service";
import {Schuetze} from "../../app/entities/Schuetze";
import {Stich} from "../../app/entities/Stich";

/**
 * Generated class for the SchuetzeEditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-schuetze-edit',
  templateUrl: 'schuetze-edit.html',
})
export class SchuetzeEditPage {

  schuetze: Schuetze;
  stiche: Stich;
  sticheGeloest: number[]; // TODO: implement in Schütze and get from DB

  vorname: string;
  nachname: string;
  lizenzNr: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public fbSvc : FirebaseServiceProvider) {
    this.schuetze = navParams.get('schuetze');
    this.stiche = navParams.get('stiche');
    this.sticheGeloest = navParams.get('sticheGeloest');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SchuetzeEditPage');
  }

  updateSchuetze() {
    this.schuetze.vorname = this.vorname;
    this.schuetze.nachname = this.nachname;
    this.schuetze.lizenzNr = this.lizenzNr;

    this.fbSvc.crudSchuetze(this.schuetze, CRUD.UPDATE);

    // Change view
    this.navCtrl.pop();
  }

}
