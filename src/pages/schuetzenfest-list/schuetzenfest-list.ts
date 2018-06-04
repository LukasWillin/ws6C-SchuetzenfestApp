import { Component } from '@angular/core';
import {ActionSheetController, IonicPage, NavController, NavParams, Platform} from 'ionic-angular';
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

  constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform, public actionsheetCtrl: ActionSheetController) {
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

  presentActionSheet() {
    let actionSheet = this.actionsheetCtrl.create({
      title: 'Schuetzenfest bearbeiten',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Bearbeiten',
          icon: !this.platform.is('ios') ? 'md-create' : null,
          handler: () => {
            console.log('Bearbeiten clicked');
          }
        },
        {
          text: 'Löschen',
          role: 'destructive',
          icon: !this.platform.is('ios') ? 'trash' : null,
          handler: () => {
            console.log('Löschen clicked');
          }
        },
        {
          text: 'Abbrechen',
          role: 'cancel', // will always sort to be on the bottom
          icon: !this.platform.is('ios') ? 'close' : null,
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }
}
