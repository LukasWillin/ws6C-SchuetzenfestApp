import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {SchuetzeResultatPage} from "../schuetze-resultat/schuetze-resultat";
import {SchuetzeCreatePage} from "../schuetze-create/schuetze-create";
import {StichShowPage} from "../stich-show/stich-show";
import {StichCreatePage} from "../stich-create/stich-create";

/**
 * Generated class for the SchuetzenfestShowPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-schuetzenfest-show',
  templateUrl: 'schuetzenfest-show.html',
})
export class SchuetzenfestShowPage {

  schuetzen = [
    'François Martin',
    'Roger Iten'
  ];

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

  schuetzenfest: string;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.schuetzenfest = navParams.get('schuetzenfest');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StichPage');
  }

  schuetzeSelected(schuetze: string) {
    console.log("selected schuetze ", schuetze);
    this.navCtrl.push(SchuetzeResultatPage, {
      schuetze: schuetze,
      stiche: this.stiche,
    });
  }

  stichSelected(stich: string) {
    console.log("selected stich ", stich);
    this.navCtrl.push(StichShowPage, {
      stich: stich
    });
  }

  addSchuetze() {
    console.log("creating new schuetze");
    this.navCtrl.push(SchuetzeCreatePage);
  }

  addStich() {
    console.log("creating new stich");
    this.navCtrl.push(StichCreatePage);
  }

}
