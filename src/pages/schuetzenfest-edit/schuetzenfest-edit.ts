import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Schuetzenfest} from "../../app/entities/Schuetzenfest";
import {FirebaseServiceProvider} from "../../app/firebase-service";

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

  schuetzenfest: Schuetzenfest;

  name: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public fbSvc : FirebaseServiceProvider) {
    this.schuetzenfest = navParams.get('schuetzenfest')
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SchuetzenfestEditPage');
  }

  updateSchuetzenfest() {
    this.schuetzenfest.name = this.name;
    this.fbSvc.crudSchuetzenfest(this.schuetzenfest);

    // change view
    this.navCtrl.pop();
  }
}
