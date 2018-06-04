import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the StichShowPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-stich-show',
  templateUrl: 'stich-show.html',
})
export class StichShowPage {

  stich;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.stich = navParams.get('stich');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StichShowPage');
  }

}
