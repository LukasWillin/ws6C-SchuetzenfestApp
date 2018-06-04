import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {SchuetzenfestCreatePage} from "../schuetzenfest-create/schuetzenfest-create";
import {SchuetzenfestShowPage} from "../schuetzenfest-show/schuetzenfest-show";
import {SchuetzenfestEditPage} from "../schuetzenfest-edit/schuetzenfest-edit";

/**
 * Generated class for the SchuetzenfestListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-schuetzenfest-list',
  templateUrl: 'schuetzenfest-list.html',
})
export class SchuetzenfestListPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SchuetzenfestListPage');
  }

  //let bhsSchuetzenfest  : BehaviorChange<Schuetzenfest[]> = new BehaviorChange<Schuetzenfest[]>(this.schuetzenfeste);

  schuetzenfeste = [
    {
      name: 'Vindonissa 2018'
    },
    {
      name: 'Volksschiessen 2018'
    }
  ];

  schuetzenfestSelected(schuetzenfest: string) {
    console.log("selected schuetzenfest ", schuetzenfest);
    this.navCtrl.push(SchuetzenfestShowPage, {
      schuetzenfest: schuetzenfest
    });
  }

  schuetzenfestEdit(schuetzenfest) {
    console.log("I want to edit ", schuetzenfest);
    this.navCtrl.push(SchuetzenfestEditPage, {
      schuetzenfest: schuetzenfest
    })
  }

  addSchuetzenfest() {
    console.log("creating new schuetzenfest");
    this.navCtrl.push(SchuetzenfestCreatePage);
  }

}
