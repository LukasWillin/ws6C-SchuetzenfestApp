import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Schuetze} from "../../app/entities/Schuetze";
import {FirebaseServiceProvider} from "../../app/firebase-service";
import {Schuetzenfest} from "../../app/entities/Schuetzenfest";
import {Stich} from "../../app/entities/Stich";
import {Resultat} from "../../app/entities/Resultat";

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
  stiche: Stich[];
  sticheGeloest: number[] = [];
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
    const resultate = [];

    // create resultate based on stiche gelöst
    for (let i = 0; i < this.stiche.length; i++) {
      for (let j = 0; j < this.sticheGeloest[i]; j++) {
        let tempResultat = new Resultat();
        tempResultat.stich = this.stiche[i];
        resultate.push(tempResultat);
      }
    }
    console.log(resultate);
    newSchuetze.resultate = resultate;

    this.fbSvc.crudSchuetze(newSchuetze, this.schuetzenfest.key);
    console.log(newSchuetze);
    console.log(this.schuetzenfest.key);

    // Change view
    this.navCtrl.pop();
  }

}
