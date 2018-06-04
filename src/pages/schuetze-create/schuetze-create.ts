import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Schuetze} from "../../app/entities/Schuetze";
import {FirebaseServiceProvider} from "../../app/firebase-service";

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
  stiche: any; // TODO: change to Stich[]
  sticheGeloest: number[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public fbSvc : FirebaseServiceProvider) {
    this.stiche = navParams.get('stiche');
    console.log(this.stiche);
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

    //this.fbSvc.crudSchuetze(newSchuetze);

    // Change view
    this.navCtrl.pop();
  }

}
