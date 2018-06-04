import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the SchuetzeEditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-schuetze-edit',
  templateUrl: 'schuetze-edit.html',
})
export class SchuetzeEditPage {

  schuetze: any;
  stiche: any; // TODO: change to Stich[]
  sticheGeloest: number[];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.schuetze = navParams.get('schuetze');
    this.stiche = navParams.get('stiche');
    this.sticheGeloest = navParams.get('sticheGeloest');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SchuetzeEditPage');
  }

  updateSchuetze() {
    // TODO: Do something great with the schuetze ^~^

    // Change view
    this.navCtrl.pop();
  }

}
