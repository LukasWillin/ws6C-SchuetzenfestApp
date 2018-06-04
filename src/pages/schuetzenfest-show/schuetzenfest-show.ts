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

  private schuetzen: Schuetze[];
  private schuetzenSubscription: Subscription;
  // schuetzen : Schuetze[] = this.fbSvc.schuetzen.value;

  private stiche: Stich[];
  private sticheSubscription: Subscription;

  sticheGeloest = [
    1,2
  ];

  schuetzenfest: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public fbSvc : FirebaseServiceProvider, public platform: Platform, public actionsheetCtrl: ActionSheetController, private alertCtrl: AlertController) {
    this.schuetzenfest = navParams.get('schuetzenfest');
    this.searchbarShowing = false; // hide search bar by default
    console.log(this.schuetzen);

    let stich1: Stich = new Stich();
    stich1.name ="Kranzstich";
    stich1.anzahlschuss = 10;

    stich1.scheibe = 10;
    let stich2: Stich = new Stich();
    stich2.name ="Vindonissastich";
    stich2.anzahlschuss = 10;

    stich2.scheibe = 10.9;

    this.stiche = [stich1, stich2];

    this.initializeSchuetzen();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StichPage');
    console.log("key für das Schuetzenfest " + this.schuetzenfest.key);
    this.schuetzenSubscription = this.fbSvc.getSchuetzenBySchuetzenfestKey(this.schuetzenfest.key)
      .subscribe(schuetzenListe => this.schuetzen = schuetzenListe);
    this.sticheSubscription = this.fbSvc.getSticheBySchuetzenfestKey(this.schuetzenfest.key)
      .subscribe(sticheListe => this.stiche = sticheListe);
  }

  ionViewWillUnload() {
    console.log("ionViewWillUnload SchuetzenfestShow");
    this.schuetzenSubscription.unsubscribe();
    this.sticheSubscription.unsubscribe();
  }

  show(object: Schuetze | Stich) {
    if (object instanceof Schuetze) {
      console.log("show schuetze ", object);
      this.navCtrl.push(SchuetzeResultatPage, {
        schuetze: object,
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
        schuetze: object,
        stiche: this.stiche,
        sticheGeloest: this.sticheGeloest
      });
    } else {
      console.log("edit stich ", object);
      this.navCtrl.push(StichEditPage, {
        stich: object,
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
    this.navCtrl.push(SchuetzeCreatePage, {
      stiche: this.stiche
    });
  }

  addStich() {
    console.log("creating new stich");
    this.navCtrl.push(StichCreatePage);
  }

  // TODO: Do we need it... I guess not?
  initializeSchuetzen() {
    let schuetze1: Schuetze = new Schuetze();
    schuetze1.vorname = "François";
    schuetze1.nachname = "Martin";
    schuetze1.lizenzNr = "520921";

    let schuetze2: Schuetze = new Schuetze();
    schuetze2.vorname = "Roger";
    schuetze2.nachname = "Iten";
    schuetze2.lizenzNr = "666666";

    let resultat1: Resultat = new Resultat();
    resultat1.stich = this.stiche[0];
    resultat1.punktzahl = -1;

    let resultat2: Resultat = new Resultat();
    resultat2.stich = this.stiche[1];
    resultat2.punktzahl = -1;

    schuetze1.resultate = [resultat1, resultat2];

    let resultat3: Resultat = new Resultat();
    resultat3.stich = this.stiche[0];
    resultat3.punktzahl = 50;

    let resultat4: Resultat = new Resultat();
    resultat4.stich = this.stiche[1];
    resultat4.punktzahl = 87.9;

    let resultat5: Resultat = new Resultat();
    resultat5.stich = this.stiche[1];
    resultat5.punktzahl = 99.2;

    schuetze2.resultate = [resultat3, resultat4, resultat5];

    this.schuetzen = [
      schuetze1, schuetze2
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
