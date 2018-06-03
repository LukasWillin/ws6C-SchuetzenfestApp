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
  stiche = [
    {
      name: "Kranzstich",
      anzahlSchuss: 10,
      scheibe: 10
    },
    {
      name: "Vindonissastich",
      anzahlSchuss: 10,
      scheibe: 10.9
    }
  ];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.schuetze = navParams.get('schuetze');

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ResultatPage');
  }

  getResultate(stich) {
    let resultatMax = stich.scheibe*stich.anzahlSchuss;
    if (resultatMax % 10 == 0) {
      // schüsse sind jeweils ganzzahlig
      return Array(resultatMax+1).fill(resultatMax+1).map((x,i)=>i).reverse();
    } else {
      // schüsse jeweils mit komma
      return 0; // TODO: fix
    }
  }

}
