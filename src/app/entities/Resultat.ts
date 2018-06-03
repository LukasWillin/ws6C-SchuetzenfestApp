
import isObject from 'lodash/isObject';
import isInteger from 'lodash/isInteger';
import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';
import isBoolean from 'lodash/isBoolean';
import isDate from 'lodash/isDate';

import { Stich } from './Stich';
import { Observable } from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

export class Resultat {
  get stich(): BehaviorSubject<Stich> {
    return this._fb_field_stich;
  }

  set stich(value: BehaviorSubject<Stich>) {
    this._fb_lastChanged = new Date();
    this.stichSubscription.unsubscribe();
    this._fb_field_stich = value;
    this.stichSubscription = this._fb_field_stich.subscribe(stL => this.stichChangedHandler());
  }

  get punktzahl(): number {
    return this._fb_field_punktzahl;
  }

  set punktzahl(value: number) {
    this._fb_lastChanged = new Date();
    this._fb_field_punktzahl = value;
  }

  public get key() : string {
    return this._fbKey;
  }

  public get isPlaceholder() : boolean {
    return !!this._fb_isPlaceholder;
  }

  public get lastChanged() : Date {
    return new Date(this._fb_lastChanged.getTime());
  }

  public get clone() : Resultat {
    const rC = new Resultat();

    rC.stich = this.stich;
    rC.punktzahl = this.punktzahl;

    rC._fbSchuetzeKey = this._fbSchuetzeKey;
    rC._fbKey = this._fbKey;
    rC._fbStichKey = this._fbStichKey;

    rC._fb_lastChanged = this._fb_lastChanged;
    rC._fb_isPlaceholder = this._fb_isPlaceholder;

    return rC
  }

  constructor(obj?:any, setPlaceholder?:boolean) {
    if (arguments.length === 1)
      setPlaceholder = obj;

    if (isObject(obj)) {
      if (isObject(obj.stich)) this.stich = obj.stich;
      if (isInteger(obj.punktzahl)) this.punktzahl = obj.punktzahl;

      if (isString(obj._fbKey) && !isEmpty(obj._fbKey)) this._fbKey = obj._fbKey;
      if (isString(obj._fbStichKey) && !isEmpty(obj._fbStichKey)) this._fbStichKey = obj._fbStichKey;
      if (isString(obj._fbSchuetzeKey) && !isEmpty(obj._fbSchuetzeKey)) this._fbSchuetzeKey = obj._fbSchuetzeKey;

      if (isDate(obj._fb_lastChanged)) this._fb_lastChanged = obj._fb_lastChanged;
    }
    if (isBoolean(setPlaceholder)) {
      this._fb_isPlaceholder = setPlaceholder;
    }
  }

  // --- Used by FirebaseServiceProvider : do only read
  public _fbKey : string;
  public _fbSchuetzeKey : string;
  public _fbStichKey : string;

  public _fb_lastChanged : Date = new Date();
  public _fb_isPlaceholder : boolean = false;

  public _fb_field_stich : BehaviorSubject<Stich> = new BehaviorSubject<Stich>(null);
  public _fb_field_punktzahl : number = 0;

  private stichSubscription = this._fb_field_stich.subscribe(st => this.stichChangedHandler());

  private stichChangedHandler() {
    this._fb_lastChanged = new Date();
  }
}
