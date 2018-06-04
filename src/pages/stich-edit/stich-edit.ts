import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the StichEditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-stich-edit',
  templateUrl: 'stich-edit.html',
})
export class StichEditPage {

  stich: any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.stich = navParams.get('stich');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StichEditPage');
  }

  updateStich() {
    // TODO: Do something nice with the stich ^~^

    // change view
    this.navCtrl.pop();
  }

}
