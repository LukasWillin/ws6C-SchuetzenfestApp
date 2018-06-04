
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
  get stich(): Stich {
    return this._fb_field_stich;
  }

  set stich(value: Stich) {
    this._fb_lastChanged = new Date();
    this._fb_field_stich = value;
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
    return new Resultat(this);
  }
  public toString() : string {
    const jsonify = new Resultat(this);
    jsonify._fb_field_stich = null;
    return JSON.stringify(jsonify);
  }


  constructor(obj?:any, setPlaceholder?:boolean) {
    if (arguments.length === 1)
      setPlaceholder = obj;

    if (isObject(obj)) {
      if (isObject(obj._fb_field_stich)) this._fb_field_stich = obj._fb_field_stich;
      if (isInteger(obj._fb_field_punktzahl)) this._fb_field_punktzahl = obj._fb_field_punktzahl;

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

  public _fb_field_stich : Stich = null;
  public _fb_field_punktzahl : number = 0;

}
