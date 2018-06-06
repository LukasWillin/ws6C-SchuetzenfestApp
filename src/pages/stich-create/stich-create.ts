import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Schuetzenfest} from "../../app/entities/Schuetzenfest";
import {FirebaseServiceProvider, CRUD} from "../../app/firebase-service";
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

  private name: string;
  private scheibe: number;
  private anzahlSchuss: number;

  private schuetzenfestKey : string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public fbSvc : FirebaseServiceProvider) {
    this.schuetzenfestKey = navParams.get("schuetzenfestKey")
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StichCreatePage');

  }

  createStich() {
    console.log("Name: " + this.name);
    const newStich = new Stich();
    newStich.name = this.name;
    newStich.scheibe = this.scheibe;
    newStich.anzahlschuss = this.anzahlSchuss;

    this.fbSvc.crudStich(newStich, this.schuetzenfestKey, CRUD.PUSH);

    // Change view
    this.navCtrl.pop();
  }

}
