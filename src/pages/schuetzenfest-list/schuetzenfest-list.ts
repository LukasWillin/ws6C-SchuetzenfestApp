import { Component } from '@angular/core';
import {ActionSheetController, AlertController, IonicPage, NavController, NavParams, Platform} from 'ionic-angular';
import {SchuetzenfestCreatePage} from "../schuetzenfest-create/schuetzenfest-create";
import {SchuetzenfestShowPage} from "../schuetzenfest-show/schuetzenfest-show";
import {SchuetzenfestEditPage} from "../schuetzenfest-edit/schuetzenfest-edit";
import {FirebaseServiceProvider, CRUD} from "../../app/firebase-service";
import {Schuetzenfest} from "../../app/entities/Schuetzenfest";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";

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

  private schuetzenfeste: Schuetzenfest[];
  private schuetzenfesteSubscription:Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform, public actionsheetCtrl: ActionSheetController, private alertCtrl: AlertController, private fbSvc: FirebaseServiceProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SchuetzenfestListPage');
    this.schuetzenfesteSubscription = this.fbSvc.schuetzenfeste.subscribe(schuetzenfestListe => {
      this.schuetzenfeste = schuetzenfestListe;
      // this.schuetzenfesteSubscription.unsubscribe();
    })
  }

  // FIXME: Not needed - according to François.
  // ionViewWillUnload() {
  //   console.log('ionViewWillUnload SchuetzenfestListPage');
  //   this.schuetzenfesteSubscription.unsubscribe();
  // }
  // TODO: ionViewDestory --> unsubscribble

  //let bhsSchuetzenfest  : BehaviorChange<Schuetzenfest[]> = new BehaviorChange<Schuetzenfest[]>(this.schuetzenfeste);

  // schuetzenfeste = [
  //   {
  //     name: 'Vindonissa 2018'
  //   },
  //   {
  //     name: 'Volksschiessen 2018'
  //   }
  // ];

  // schuetzenfeste: Schuetzenfest[] = this.fbSvc.schuetzenfeste.value;



  create() {
    console.log("creating new schuetzenfest");
    this.navCtrl.push(SchuetzenfestCreatePage);
  }

  show(schuetzenfest: Schuetzenfest) {
    console.log("selected schuetzenfest ", schuetzenfest);
    this.navCtrl.push(SchuetzenfestShowPage, {
      schuetzenfest: schuetzenfest
    });
  }

  edit(schuetzenfest: Schuetzenfest) {
    console.log("I want to edit ", schuetzenfest);
    this.navCtrl.push(SchuetzenfestEditPage, {
      schuetzenfest: schuetzenfest
    })
  }

  delete(schuetzenfest: Schuetzenfest) {
    this.fbSvc.crudSchuetzenfest(schuetzenfest, CRUD.DELETE);
  }

  presentActionSheet(schuetzenfest: Schuetzenfest) {
    let actionSheet = this.actionsheetCtrl.create({
      title: 'Aktionen',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Bearbeiten',
          icon: !this.platform.is('ios') ? 'md-create' : null,
          handler: () => {
            console.log('Bearbeiten clicked');
            this.edit(schuetzenfest);
          }
        },
        {
          text: 'Löschen',
          role: 'destructive',
          icon: !this.platform.is('ios') ? 'trash' : null,
          handler: () => {
            console.log('Löschen clicked');
            this.confirmDelete(schuetzenfest);
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

  confirmDelete(schuetzenfest: Schuetzenfest) {
    let alert = this.alertCtrl.create({
      title: 'Löschen bestätigen',
      message: 'Wirklich löschen?',
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
            this.delete(schuetzenfest);
          }
        }
      ]
    });
    alert.present();
  }
}
