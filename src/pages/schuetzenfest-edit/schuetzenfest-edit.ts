import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the SchuetzenfestEditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-schuetzenfest-edit',
  templateUrl: 'schuetzenfest-edit.html',
})
export class SchuetzenfestEditPage {

  schuetzenfest: any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.schuetzenfest = navParams.get('schuetzenfest')
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SchuetzenfestEditPage');
  }

  updateSchuetzenfest() {
    // TODO: Do something cool with the Schuetzenfest ^~^

    // change view
    this.navCtrl.pop();
  }
}
