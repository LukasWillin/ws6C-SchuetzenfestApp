import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
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
  resultate: number[];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.schuetze = navParams.get('schuetze');
    this.getResultat()
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ResultatPage');
  }

  getResultat() { // TODO: for testing only
    let resultatMax = 80;
    if (resultatMax % 10 == 0) {
      // schüsse sind jeweils ganzzahlig
      return Array(resultatMax+1).fill(resultatMax+1).map((x,i)=>i).reverse();
    } else {
      // schüsse jeweils mit komma
      return 0; // TODO: fix
    }
  }

  getResultate(stich: Stich) {
    let resultatMax = stich.scheibe*stich.anzahlschuss;
    if (resultatMax % 10 == 0) {
      // schüsse sind jeweils ganzzahlig
      return Array(resultatMax+1).fill(resultatMax+1).map((x,i)=>i).reverse();
    } else {
      // schüsse jeweils mit komma
      return 0; // TODO: fix
    }
  }

}
