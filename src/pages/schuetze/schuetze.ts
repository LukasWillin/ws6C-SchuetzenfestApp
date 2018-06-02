import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {CreateSchuetzePage} from "../create-schuetze/create-schuetze";

/**
 * Generated class for the SchuetzePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-schuetze',
  templateUrl: 'schuetze.html',
})
export class SchuetzePage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SchuetzePage');
  }

  schuetzen = [
    'François Martin',
    'Roger Iten'
  ]

  schuetzeSelected(schuetze: string) {
    console.log("selected schuetze ", schuetze);
    // this.navCtrl.push()
  }

  addSchuetze() {
    console.log("creating new schuetze");
    this.navCtrl.push(CreateSchuetzePage);
  }

}
