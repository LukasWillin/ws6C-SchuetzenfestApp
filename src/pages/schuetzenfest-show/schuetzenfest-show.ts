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
import {Stich} from "../../app/entities/Stich";
import {Subscription} from "rxjs/Subscription";
import {Resultat} from "../../app/entities/Resultat";
import {Schuetzenfest} from "../../app/entities/Schuetzenfest";
import filter from 'lodash/filter';
import orderBy from 'lodash/orderBy';
import take from 'lodash/take';
import {BarcodeScanner} from "@ionic-native/barcode-scanner";

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

  barcode: string;

  searchbarShowing: boolean;

  // Defines which tab gets displayed in the view
  tab_selection = "stiche";

  private schuetzen: Schuetze[] = [];
  private schuetzenFiltered: Schuetze[] = [];
  private schuetzenSubscription: Subscription;
  private sticheSubscription: Subscription;

  private stiche: Stich[] = [];

  schuetzenfest: Schuetzenfest;

  constructor(public navCtrl: NavController, public navParams: NavParams, public fbSvc : FirebaseServiceProvider,
              public platform: Platform, public actionsheetCtrl: ActionSheetController,
              private alertCtrl: AlertController, private barcodeScanner: BarcodeScanner) {
    this.schuetzenfest = navParams.get('schuetzenfest');
    this.searchbarShowing = false; // hide search bar by default
    console.log(this.schuetzen);

    }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SchuetzenfestShow');
    console.log("Key für das Schuetzenfest " + this.schuetzenfest.key);

    this.fbSvc.getSticheAboBySchuetzenfestKey(this.schuetzenfest.key)
      .subscribe(
        "pages/schuetzenfest-show/stiche"
        ,stL => this.stiche = stL
        ,50
        ,true);
    this.fbSvc.getSchuetzenAboBySchuetzenfestKey(this.schuetzenfest.key)
      .subscribe(
        "pages/schuetzenfest-show/schuetzen"
        ,sL => {
          this.schuetzen = sL;
          this.getSchuetzen();
        }
        , 50
        , true);

    /*this.sticheSubscription = this.fbSvc.getSticheBySchuetzenfestKey(this.schuetzenfest.key).subscribe(stL => this.stiche = stL);
    this.schuetzenSubscription = this.fbSvc.getSchuetzenBySchuetzenfestKey(this.schuetzenfest.key).subscribe(sL => this.schuetzen = sL);
*/


    console.log(this.schuetzen);
  }

  show(object: Schuetze | Stich) {
    if (object instanceof Schuetze) {
      console.log("show schuetze ", object);
      this.navCtrl.push(SchuetzeResultatPage, {
        schuetze: object,
        schuetzeKey: object.key,
        schuetzenfestKey: this.schuetzenfest.key,
      });
    } else {
      console.log("show stich ", object);
      this.navCtrl.push(StichShowPage, {
        stich: object,
        schuetzenfestKey: this.schuetzenfest.key,
        handler: this
      });
    }
  }

  public edit(object: Schuetze | Stich) {
    if (object instanceof Schuetze) {
      console.log("edit schuetze ", object);
      this.navCtrl.push(SchuetzeEditPage, {
        schuetze: object,
        stiche: this.stiche,
        schuetzenfestKey: this.schuetzenfest.key
      });
    } else {
      console.log("edit stich ", object);
      this.navCtrl.push(StichEditPage, {
        stich: object,
        schuetzenfestKey: this.schuetzenfest.key
      });
    }
  }

  delete(object: Schuetze | Stich) {
    if (object instanceof Schuetze) {
      console.log("delete schuetze ", object);
      this.fbSvc.crudSchuetze(object, this.schuetzenfest.key, CRUD.DELETE);
    } else {
      console.log("delete stich ", object);
      this.fbSvc.crudStich(object, this.schuetzenfest.key, CRUD.DELETE);
    }
  }

  addSchuetze() {
    console.log("creating new schuetze");
    this.navCtrl.push(SchuetzeCreatePage, {
      stiche: this.stiche,
      schuetzenfest: this.schuetzenfest
    });
  }

  addStich() {
    console.log("creating new stich");
    this.navCtrl.push(StichCreatePage, {
      schuetzenfestKey: this.schuetzenfest.key
    });
  }

  getSchuetzen(event?: any) {
    // set searchText to the value of the searchbar
    let searchText;
    if (event) searchText = event.target.value;

    // if the value is an empty string don't filter the items
    if (searchText && searchText.trim() != '') {
      this.schuetzenFiltered = orderBy(take(filter(this.schuetzen,(schuetze) => {
        let matchVorname = this.containsIgnoreCase(schuetze.vorname, searchText);
        let matchNachname = this.containsIgnoreCase(schuetze.nachname, searchText);
        let matchLizenzNr = this.containsIgnoreCase(schuetze.lizenzNr, searchText);
        return (matchVorname || matchNachname || matchLizenzNr);
      }), 30), ['vorname', 'nachname']);
    } else {
      this.schuetzenFiltered = take(this.schuetzen, 30);
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
            this.confirmDelete(object, false);
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

  confirmDelete(object: Schuetze|Stich, popView: boolean) {
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
            if (popView) {
              this.navCtrl.pop();
            }
          }
        }
      ]
    });
    alert.present();
  }

  scan() {
    this.barcodeScanner.scan().then((barcodeData) => {
      this.barcode = barcodeData.text;
      let schuetzeFound = this.schuetzen.filter((schuetze) => {
        return schuetze.lizenzNr == this.barcode
      });
      if (schuetzeFound.length == 1) {
        this.show(schuetzeFound[0]);
      } else {
        console.error("Found more than one Schütze!");
      }
    }, (err) => {
      console.error("Failed scanning barcode!");
    });
  }
}
