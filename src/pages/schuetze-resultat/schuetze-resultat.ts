import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {Stich} from "../../app/entities/Stich";
import {Schuetze} from "../../app/entities/Schuetze";
import {Resultat} from "../../app/entities/Resultat";
import {CRUD, FirebaseServiceProvider} from "../../app/firebase-service";

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

  schuetze : Schuetze = new Schuetze();
  schuetzeKey: string = "";
  schuetzenfestKey: string = "";
  punktzahlen: number[] = [];

  resultate : Resultat[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public fbSvc : FirebaseServiceProvider) {
    this.schuetzeKey = navParams.get('schuetzeKey');
    this.schuetzenfestKey = navParams.get('schuetzenfestKey');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ResultatPage');
    this.fbSvc.getSchuetzeAboByKey(this.schuetzeKey).subscribe(
      "pages/schuetze-resultat/schuetze"
      ,s => {
        this.schuetze = s;
        this.fbSvc.getResultateAboBySchuetzeAndSchuetzenfestKey(this.schuetzenfestKey, this.schuetzeKey)
          .subscribe("pages/schuetze-resultat/schuetze-resultate"
            ,rL => this.resultate = rL
            ,1
            ,true);
      }
      ,1
      ,true);
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
    this.fbSvc.crudBatchResultat(this.resultate, "", "", CRUD.UPDATE);
    this.navCtrl.pop();
  }

}
