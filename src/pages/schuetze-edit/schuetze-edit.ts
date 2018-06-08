import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {CRUD, FirebaseServiceProvider} from "../../app/firebase-service";
import {Schuetze} from "../../app/entities/Schuetze";
import {Stich} from "../../app/entities/Stich";
import {Resultat} from "../../app/entities/Resultat";
import {groupBy} from "rxjs/operators";

/**
 * Generated class for the SchuetzeEditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-schuetze-edit',
  templateUrl: 'schuetze-edit.html',
})
export class SchuetzeEditPage {

  schuetze: Schuetze;
  stiche: Stich[];
  sticheGeloest: number[] = [];

  vorname: string;
  nachname: string;
  lizenzNr: string;
  schuetzenfestKey: string = "";

  constructor(public navCtrl: NavController, public navParams: NavParams, public fbSvc : FirebaseServiceProvider) {
    this.schuetze = navParams.get('schuetze');
    this.stiche = navParams.get('stiche');
    this.schuetzenfestKey = navParams.get('schuetzenfestKey');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SchuetzeEditPage');
  }

  updateSchuetze() {
    this.schuetze.vorname = this.vorname;
    this.schuetze.nachname = this.nachname;
    this.schuetze.lizenzNr = this.lizenzNr;

    let schuetzeResultate;
    this.fbSvc.getResultateAboBySchuetzeAndSchuetzenfestKey(this.schuetzenfestKey, this.schuetze.key)
      .subscribe(
        "pages/schuetze-edit/resultateBySchuetzeKeyAndSchuetzenfestKey"
        , rL => schuetzeResultate = rL
        , 1
        ,true
      );

    // create resultate based on stiche gelöst
    for (let i = 0; i < this.stiche.length; i++) {
      for (let j = 0; j < this.sticheGeloest[i]; j++) {
        let tempResultat = new Resultat();
        tempResultat.stich = this.stiche[i];
        this.fbSvc.crudResultat(tempResultat, this.stiche[i].key, this.schuetze.key, CRUD.PUSH);
      }
    }

    this.fbSvc.crudSchuetze(this.schuetze, CRUD.UPDATE);

    // Change view
    this.navCtrl.pop();
  }

}
