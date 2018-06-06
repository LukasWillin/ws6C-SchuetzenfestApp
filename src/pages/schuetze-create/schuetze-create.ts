import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Schuetze} from "../../app/entities/Schuetze";
import {CRUD, FirebaseServiceProvider} from "../../app/firebase-service";
import {Schuetzenfest} from "../../app/entities/Schuetzenfest";
import {Stich} from "../../app/entities/Stich";

/**
 * Generated class for the SchuetzeCreatePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-schuetze-create',
  templateUrl: 'schuetze-create.html',
})
export class SchuetzeCreatePage {

  vorname: string;
  nachname: string;
  lizenzNr: string;
  stiche: Stich;
  sticheGeloest: number[] = [];  // TODO: implement in Schütze and get from DB
  schuetzenfest: Schuetzenfest;

  constructor(public navCtrl: NavController, public navParams: NavParams, public fbSvc : FirebaseServiceProvider) {
    this.stiche = navParams.get('stiche');
    console.log(this.stiche);
    this.schuetzenfest = navParams.get('schuetzenfest');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreateSchuetzePage');
  }

  create() {
    console.log("Vorname: " + this.vorname + ", Nachname: " + this.nachname + ", Lizenznr: " + this.lizenzNr);
    const newSchuetze = new Schuetze();
    newSchuetze.nachname = this.nachname;
    newSchuetze.vorname = this.vorname;
    newSchuetze.lizenzNr = this.lizenzNr;

    console.log(newSchuetze);
    console.log(this.schuetzenfest.key);

    this.fbSvc.crudSchuetze(newSchuetze, this.schuetzenfest.key);
    CRUD.PUSH;
    // this.fbSvc.crudSchuetze("OKAY", this.schuetzenfest.key, CRUD.PUSH);

    // Change view
    this.navCtrl.pop();
  }

}
