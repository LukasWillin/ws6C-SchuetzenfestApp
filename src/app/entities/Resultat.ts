
import isObject from 'lodash/isObject';
import isInteger from 'lodash/isInteger';
import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';
import isBoolean from 'lodash/isBoolean';

import { Stich } from './Stich';
import { Observable } from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

export class Resultat {
  public stich : BehaviorSubject<Stich> = new BehaviorSubject<Stich>(null);
  public punktzahl : number = 0;

  public get key() : string {
    return this._fbKey;
  }

  public get isPlaceholder() : boolean {
    return !!this._fb_isBoolean;
  }

  public get clone() : Resultat {
    const rC = new Resultat();

    rC.stich = this.stich;
    rC.punktzahl = this.punktzahl;

    rC._fbSchuetzeKey = this._fbSchuetzeKey;
    rC._fbKey = this._fbKey;
    rC._fbStichKey = this._fbStichKey;

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

    } else if (isBoolean(setPlaceholder)) {
      this._fb_isBoolean = setPlaceholder;
    }
  }

  // --- Used by FirebaseServiceProvider : do only read
  public _fbKey : string;
  public _fbStichKey : string;
  public _fbSchuetzeKey : string;
  public _fb_isBoolean : boolean = false;
}
