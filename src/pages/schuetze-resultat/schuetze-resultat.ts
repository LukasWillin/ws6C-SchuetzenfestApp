import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {Stich} from "../../app/entities/Stich";
import {Schuetze} from "../../app/entities/Schuetze";
import {Resultat} from "../../app/entities/Resultat";
import {CRUD, FirebaseServiceProvider} from "../../app/firebase-service";

import filter from 'lodash/filter';

/**
 * Generated class for the SchuetzeResultatPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-schuetze-resultat',
  templateUrl: 'schuetze-resultat.html',
})
export class SchuetzeResultatPage {

  schuetze : Schuetze;
  schuetzeKey: string;
  schuetzenfestKey: string = "";
  punktzahlen: number[] = [];

  resultate : Resultat[];

  constructor(public navCtrl: NavController, public navParams: NavParams, public fbSvc : FirebaseServiceProvider) {
    this.schuetze = navParams.get('schuetze');
    this.schuetzeKey = navParams.get('schuetzeKey');
    this.schuetzenfestKey = navParams.get('schuetzenfestKey');
    this.fbSvc.getSchuetzeAboByKey(this.schuetzeKey).subscribe(
      "pages/schuetze-resultat/schuetze"
      ,function(s) {
        this.schuetze = s;
        this.resultate = filter(this.schuetze.resultate, r => (r as Resultat).stich.schuetzenfestKey === this.schuetzenfestKey);
        console.warn(`called with ${this.schuetze}`);
      }.bind(this)
      ,2
      ,false);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ResultatPage');
  }

  resultatMax(stich) {
    return stich.scheibe*stich.anzahlschuss; // maximal erreichbares resultat
  }

  getResultatOptions(stich) {
    let resultatMax = this.resultatMax(stich); // maximal erreichbares resultat
    console.log("ResultatMax: ", resultatMax);
    // build array with numbers from 0 to resultatMax inclusive, with reverse order (highest number comes first)
    return (new Array(resultatMax+1)).fill(resultatMax+1).map((x,i)=>i).reverse();
  }

  resultatIsDecimal(stich) {
    return stich.scheibe % 10 == 0;
  }

  updateResultat() {
    console.log("Updating!");
    this.fbSvc.crudBatchResultat(this.resultate, "", "", CRUD.UPDATE);
    this.navCtrl.pop();
  }

}
