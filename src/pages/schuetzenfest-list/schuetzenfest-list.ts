import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {SchuetzenfestCreatePage} from "../schuetzenfest-create/schuetzenfest-create";
import {SchuetzenfestShowPage} from "../schuetzenfest-show/schuetzenfest-show";

/**
 * Generated class for the SchuetzenfestListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-schuetzenfest-list',
  templateUrl: 'schuetzenfest-list.html',
})
export class SchuetzenfestListPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SchuetzenfestListPage');
  }

  //let bhsSchuetzenfest  : BehaviorChange<Schuetzenfest[]> = new BehaviorChange<Schuetzenfest[]>(this.schuetzenfeste);

  schuetzenfeste = [
    'Vindonissa 2018',
    'Volksschiessen 2018'
  ];

  schuetzenfestSelected(schuetzenfest: string) {
    console.log("selected schuetzenfest ", schuetzenfest);
    this.navCtrl.push(SchuetzenfestShowPage, {
      schuetzenfest: schuetzenfest
    });
  }

  addSchuetzenfest() {
    console.log("creating new schuetzenfest");
    this.navCtrl.push(SchuetzenfestCreatePage);
  }

}
