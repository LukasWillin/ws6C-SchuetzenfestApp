import { Component } from '@angular/core';
import {ActionSheetController, AlertController, IonicPage, NavController, NavParams, Platform} from 'ionic-angular';
import {SchuetzeResultatPage} from "../schuetze-resultat/schuetze-resultat";
import {SchuetzeCreatePage} from "../schuetze-create/schuetze-create";
import {StichShowPage} from "../stich-show/stich-show";
import {StichCreatePage} from "../stich-create/stich-create";
import {Schuetze} from "../../app/entities/Schuetze";
import {CRUD, FirebaseServiceProvider} from "../../app/firebase-service";
import {SchuetzeEditPage} from "../schuetze-edit/schuetze-edit";
import {animate, style, transition, trigger} from "@angular/animations";
import {StichEditPage} from "../stich-edit/stich-edit";
import {Schuetzenfest} from "../../app/entities/Schuetzenfest";
import {Stich} from "../../app/entities/Stich";
import {Resultat} from "../../app/entities/Resultat";

/**
 * Generated class for the SchuetzenfestShowPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-schuetzenfest-show',
  templateUrl: 'schuetzenfest-show.html',
  animations: [
    trigger(
      'searchbarAnimation',
      [
        transition(':enter',
          [style({ transform: 'translateY(-100%)', opacity: 0 }),
            animate('100ms ease-out', style({ transform: 'translateY(0)', 'opacity': 1 }))]),
        transition(':leave',
          [style({ transform: 'translateY(0)', 'opacity': 1 }),
            animate('100ms ease-in', style({ transform: 'translateY(-100%)', 'opacity': 0 }))])
      ])]
})
export class SchuetzenfestShowPage {

  searchbarShowing: boolean;

  // Defines which tab gets displayed in the view
  tab_selection = "stiche";

  schuetzen;

  // schuetzen : Schuetze[] = this.fbSvc.schuetzen.value;

  stiche = [
    {
      name: "Kranzstich",
      anzahlSchuss: 10,
      scheibe: 10
    },
    {
      name: "Vindonissastich",
      anzahlSchuss: 10,
      scheibe: 10.9
    }
  ];

  schuetzenfest: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public fbSvc : FirebaseServiceProvider, public platform: Platform, public actionsheetCtrl: ActionSheetController, private alertCtrl: AlertController) {
    this.schuetzenfest = navParams.get('schuetzenfest');
    this.searchbarShowing = false; // hide search bar by default
    console.log(this.schuetzen);
    this.initializeSchuetzen();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StichPage');
  }

  show(object: Schuetze | Stich) {
    if (object instanceof Schuetze) {
      console.log("show schuetze ", object);
      this.navCtrl.push(SchuetzeResultatPage, {
        schuetze: object,
        stiche: this.stiche,
      });
    } else {
      console.log("show stich ", object);
      this.navCtrl.push(StichShowPage, {
        stich: object
      });
    }
  }

  edit(object: Schuetze | Stich) {
    if (object instanceof Schuetze) {
      console.log("edit schuetze ", object);
      this.navCtrl.push(SchuetzeEditPage, {
        schuetze: object
      })
    } else {
      console.log("edit stich ", object);
      this.navCtrl.push(StichEditPage, {
        stich: object
      });
    }
  }

  delete(object: Schuetze | Stich) {
    if (object instanceof Schuetze) {
      console.log("delete schuetze ", object);
      this.fbSvc.crudSchuetze(object, CRUD.DELETE);
    } else {
      console.log("delete stich ", object);
      this.fbSvc.crudStich(object, CRUD.DELETE);
    }
  }

  addSchuetze() {
    console.log("creating new schuetze");
    this.navCtrl.push(SchuetzeCreatePage);
  }

  addStich() {
    console.log("creating new stich");
    this.navCtrl.push(StichCreatePage);
  }

  initializeSchuetzen() {
    this.schuetzen = [
      {
        vorname: "François",
        nachname: "Martin",
        lizenzNr: "520921"
      },
      {
        vorname: "Roger",
        nachname: "Iten",
        lizenzNr: "666666"
      }
    ];
  }

  getSchuetzen(event: any) {
    // Reset schuetzen back to all of the schuetzen
    this.initializeSchuetzen();

    // set searchText to the value of the searchbar
    const searchText = event.target.value;

    // if the value is an empty string don't filter the items
    if (searchText && searchText.trim() != '') {
      this.schuetzen = this.schuetzen.filter((schuetze) => {
        let matchVorname = this.containsIgnoreCase(schuetze.vorname, searchText);
        let matchNachname = this.containsIgnoreCase(schuetze.nachname, searchText);
        let matchLizenzNr = this.containsIgnoreCase(schuetze.lizenzNr, searchText);
        return (matchVorname || matchNachname || matchLizenzNr);
      })
    }
  }

  containsIgnoreCase(s1, s2) {
    return s1.toLowerCase().indexOf(s2.toLowerCase()) > -1
  }

  toggleSearchbarVisibility() {
    this.searchbarShowing = !this.searchbarShowing;
  }

  presentActionSheet(object: Stich|Schuetze) {
    let actionSheet = this.actionsheetCtrl.create({
      title: 'Aktionen',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Bearbeiten',
          icon: !this.platform.is('ios') ? 'md-create' : null,
          handler: () => {
            console.log('Bearbeiten clicked');
            this.edit(object);
          }
        },
        {
          text: 'Löschen',
          role: 'destructive',
          icon: !this.platform.is('ios') ? 'trash' : null,
          handler: () => {
            console.log('Löschen clicked');
            this.confirmDelete(object);
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

  confirmDelete(object: Schuetze|Stich) {
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
            this.delete(object);
          }
        }
      ]
    });
    alert.present();
  }
}
