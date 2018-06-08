import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Stich} from "../../app/entities/Stich";
import {CRUD, FirebaseServiceProvider} from "../../app/firebase-service";

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

  stich: Stich;

  name: string;
  scheibe: number;
  anzahlSchuss: number;
  schuetzenfestKey: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public fbSvc : FirebaseServiceProvider) {
    this.stich = navParams.get('stich');
    this.schuetzenfestKey = navParams.get('schuetzenfestKey');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StichEditPage');
  }

  updateStich() {
    this.stich.name = this.name;
    this.stich.scheibe = this.scheibe;
    this.stich.anzahlschuss = this.anzahlSchuss;
    this.fbSvc.crudStich(this.stich, this.schuetzenfestKey, CRUD.UPDATE);

    // change view
    this.navCtrl.pop();
  }

}
