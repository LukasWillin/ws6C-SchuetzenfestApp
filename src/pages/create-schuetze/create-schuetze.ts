import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {FirebaseServiceProvider} from "../../app/firebase-service";
import {Schuetze} from "../../app/entities/Schuetze";

/**
 * Generated class for the CreateSchuetzePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-create-schuetze',
  templateUrl: 'create-schuetze.html',
})
export class CreateSchuetzePage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public fbSvc : FirebaseServiceProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreateSchuetzePage');
  }

  createSchuetze(vorname: string, nachname: string, lizenzNr: string ) {
    const val : Schuetze[] = this.fbSvc.schuetzen.value;
    const newSchuetze = new Schuetze();
    newSchuetze.nachname = nachname;
    newSchuetze.vorname = vorname;
    newSchuetze.lizenzNr = lizenzNr;
    val.push(newSchuetze);
    this.fbSvc.schuetzen.next(val);
  }

}
