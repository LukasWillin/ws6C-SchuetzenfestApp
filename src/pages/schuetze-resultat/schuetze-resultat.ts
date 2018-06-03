import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {Stich} from "../../app/entities/Stich";

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

  schuetze: string;
  stiche: any; // TODO: change this when switching to DB implementation

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.schuetze = navParams.get('schuetze');
    this.stiche = navParams.get('stiche');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ResultatPage');
  }

  getResultatOptions(stich) {
    let resultatMax = stich.scheibe*stich.anzahlSchuss; // maximal erreichbares resultat
    // build array with numbers from 0 to resultatMax inclusive, with reverse order (highest number comes first)
    return Array(resultatMax+1).fill(resultatMax+1).map((x,i)=>i).reverse();
  }

  resultatIsDecimal(stich) {
    return stich.scheibe % 10 == 0;
  }

}
