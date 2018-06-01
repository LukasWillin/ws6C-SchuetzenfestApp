
import isObject from 'lodash/isObject';
import isInteger from 'lodash/isInteger';
import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';

import { Stich } from './Stich';
import { Observable } from "rxjs/Observable";

export class Resultat {
  public stich: Observable<Stich> = Observable.empty<Stich>();
  public punktzahl: number;

  public get key():string {
    return this._fbKey;
  }

  public get clone():Resultat {
    const rC = new Resultat();

    rC.stich = this.stich;
    rC.punktzahl = this.punktzahl;

    rC._fbSchuetzeKey = this._fbSchuetzeKey;
    rC._fbKey = this._fbKey;
    rC._fbStichKey = this._fbStichKey;

    return rC
  }

  constructor(obj?:any) {
    if (isObject(obj)) {
      if (isObject(obj.stich)) this.stich = obj.stich;
      if (isInteger(obj.punktzahl)) this.punktzahl = obj.punktzahl;

      if (isString(obj._fbKey) && !isEmpty(obj._fbKey)) this._fbKey = obj._fbKey;
      if (isString(obj._fbStichKey) && !isEmpty(obj._fbStichKey)) this._fbStichKey = obj._fbStichKey;
      if (isString(obj._fbSchuetzeKey) && !isEmpty(obj._fbSchuetzeKey)) this._fbSchuetzeKey = obj._fbSchuetzeKey;
    }
  }

  // --- Used by FirebaseServiceProvider : do only read
  public _fbKey: string;
  public _fbStichKey: string;
  public _fbSchuetzeKey: string;
}
