import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Stich} from "../../app/entities/Stich";
import {SchuetzenfestShowPage} from "../schuetzenfest-show/schuetzenfest-show";

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

  stich: Stich;
  handler: SchuetzenfestShowPage;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.stich = navParams.get('stich');
    this.handler = navParams.get('handler');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StichShowPage');
  }
}
