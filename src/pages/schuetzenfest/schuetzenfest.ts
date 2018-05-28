import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {StichPage} from "../stich/stich";

/**
 * Generated class for the SchuetzenfestPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-schuetzenfest',
  templateUrl: 'schuetzenfest.html',
})
export class SchuetzenfestPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SchuetzenfestPage');
  }

  schuetzenfeste = [
    'Vindonissa 2018',
    'Volksschiessen 2018'
  ]

  schuetzenfestSelected(schuetzenfest: string) {
    console.log("selected schuetzenfest ", schuetzenfest);
    this.navCtrl.push(StichPage, {
      schuetzenfest: schuetzenfest
    });
  }

}
