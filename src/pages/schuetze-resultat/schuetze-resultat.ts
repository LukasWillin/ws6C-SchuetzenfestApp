import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {Stich} from "../../app/entities/Stich";
import {Schuetze} from "../../app/entities/Schuetze";
import {Resultat} from "../../app/entities/Resultat";

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

  schuetze: Schuetze;
  resultate: Resultat[];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.schuetze = navParams.get('schuetze');
    this.resultate = this.schuetze.resultate;
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
    return Array(resultatMax+1).fill(resultatMax+1).map((x,i)=>i).reverse();
  }

  resultatIsDecimal(stich) {
    return stich.scheibe % 10 == 0;
  }

}
