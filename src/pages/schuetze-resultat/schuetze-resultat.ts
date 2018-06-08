import {Component} from '@angular/core';
import {AlertController, IonicPage, NavController, NavParams} from 'ionic-angular';
import {Schuetze} from "../../app/entities/Schuetze";
import {Resultat, ResultatViewModel} from "../../app/entities/Resultat";
import {CRUD, FirebaseServiceProvider} from "../../app/firebase-service";

import filter from 'lodash/filter';
import map from 'lodash/map';

/**
 * Generated class for the SchuetzeResultatPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-schuetze-resultat',
  templateUrl: 'schuetze-resultat.html',
})
export class SchuetzeResultatPage {

  schuetze : Schuetze;
  schuetzeKey: string;
  schuetzenfestKey: string = "";
  punktzahlen: number[] = [];

  resultate : ResultatViewModel[];

  constructor(public navCtrl: NavController, public navParams: NavParams, public fbSvc : FirebaseServiceProvider,
  private alertCtrl: AlertController) {
    this.schuetze = navParams.get('schuetze');
    this.schuetzeKey = navParams.get('schuetzeKey');
    this.schuetzenfestKey = navParams.get('schuetzenfestKey');
    this.fbSvc.getSchuetzeAboByKey(this.schuetzeKey).subscribe(
      "pages/schuetze-resultat/schuetze"
      ,function(s) {
        this.schuetze = s;
        this.resultate = map(filter(this.schuetze.resultate, r => (r as Resultat).stich.schuetzenfestKey === this.schuetzenfestKey), r => new ResultatViewModel(r));
      }.bind(this)
      ,1
      ,false);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ResultatPage');
  }

  resultatMax(stich) {
    return stich.scheibe*stich.anzahlschuss; // maximal erreichbares resultat
  }

  getResultatOptions(stich) {
    let resultatMax = this.resultatMax(stich); // maximal erreichbares resultat
    console.log("ResultatMax: ", resultatMax);
    // build array with numbers from 0 to resultatMax inclusive, with reverse order (highest number comes first)
    return (new Array(resultatMax+1)).fill(resultatMax+1).map((x,i)=>i).reverse();
  }

  resultatIsDecimal(stich) {
    return stich.scheibe % 10 == 0;
  }

  updateResultat() {
    console.log("Updating!");
    this.fbSvc.crudBatchResultat(map(this.resultate, r => r.model), "", "", CRUD.UPDATE);
    this.navCtrl.pop();
  }

  clickBack() {
    let alert = this.alertCtrl.create({
      title: 'Nicht speichern',
      message: 'Wirklich ohne zu speichern zurück gehen? Die eingegebenen Resultate gehen dann verloren!',
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'OK',
          handler: () => {
            console.log('OK clicked');
            this.navCtrl.pop();
          }
        }
      ]
    });
    alert.present();
  }

}
