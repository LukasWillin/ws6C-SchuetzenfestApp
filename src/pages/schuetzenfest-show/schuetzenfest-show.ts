import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {SchuetzeResultatPage} from "../schuetze-resultat/schuetze-resultat";
import {SchuetzeCreatePage} from "../schuetze-create/schuetze-create";
import {StichShowPage} from "../stich-show/stich-show";
import {StichCreatePage} from "../stich-create/stich-create";
import {Schuetze} from "../../app/entities/Schuetze";
import {FirebaseServiceProvider} from "../../app/firebase-service";
import {SchuetzeEditPage} from "../schuetze-edit/schuetze-edit";
import {animate, style, transition, trigger} from "@angular/animations";

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
            animate('100ms', style({ transform: 'translateY(0)', 'opacity': 1 }))]),
        transition(':leave',
          [style({ transform: 'translateY(0)', 'opacity': 1 }),
            animate('100ms', style({ transform: 'translateY(-100%)', 'opacity': 0 }))])
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

  constructor(public navCtrl: NavController, public navParams: NavParams, public fbSvc : FirebaseServiceProvider) {
    this.schuetzenfest = navParams.get('schuetzenfest');
    this.searchbarShowing = false; // hide search bar by default
    console.log(this.schuetzen);
    this.initializeSchuetzen();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StichPage');
  }

  schuetzeSelected(schuetze) {
    console.log("selected schuetze ", schuetze);
    this.navCtrl.push(SchuetzeResultatPage, {
      schuetze: schuetze,
      stiche: this.stiche,
    });
  }

  editSchuetze(schuetze) {
    console.log("I want to edit ", schuetze);
    // TODO: move to new page.
    this.navCtrl.push(SchuetzeEditPage, {
      schuetze: schuetze
    })
  }

  stichSelected(stich: string) {
    console.log("selected stich ", stich);
    this.navCtrl.push(StichShowPage, {
      stich: stich
    });
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
    // Reset items back to all of the items
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
}
