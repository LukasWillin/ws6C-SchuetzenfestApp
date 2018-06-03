import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Schuetzenfest} from "../../app/entities/Schuetzenfest";
import {FirebaseServiceProvider} from "../../app/firebase-service";
import {Stich} from "../../app/entities/Stich";

/**
 * Generated class for the StichCreatePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-stich-create',
  templateUrl: 'stich-create.html',
})
export class StichCreatePage {

  name: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public fbSvc : FirebaseServiceProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StichCreatePage');
  }

  // TODO: #FIXME
  createStich() {
    console.log("Name: " + this.name);
    const newStich = new Stich();
    // TODO: Uncomment when class is ready!
    //newStich.name = this.name;

    // Change view
    this.navCtrl.pop();
  }

}