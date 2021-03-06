import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {FirebaseServiceProvider, CRUD} from "../../app/firebase-service";
import {Schuetzenfest} from "../../app/entities/Schuetzenfest";

/**
 * Generated class for the SchuetzenfestCreatePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-schuetzenfest-create',
  templateUrl: 'schuetzenfest-create.html',
})
export class SchuetzenfestCreatePage {

  name: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public fbSvc : FirebaseServiceProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SchuetzenfestCreatePage');
  }

  createSchuetzenfest() {
    console.log("Name: " + this.name);
    const newSchuetzenfest = new Schuetzenfest();
    newSchuetzenfest.name = this.name;
    this.fbSvc.crudSchuetzenfest(newSchuetzenfest);
    CRUD.PUSH;

    // Change view
    this.navCtrl.pop();
  }


}
