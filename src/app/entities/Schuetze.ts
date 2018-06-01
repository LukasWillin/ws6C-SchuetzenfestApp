
import {Resultat} from "./Resultat";
import {Observable} from "rxjs/Observable";

import isObject from 'lodash/isObject';
import isInteger from 'lodash/isInteger';
import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';

export class Schuetze {
  public vorname: string = "";
  public nachname: string = "";
  public resultate: Observable<Resultat[]> = Observable.empty<Resultat[]>();
  public lizenzNr: string = "";

  public get key(): string {
    return this._fbKey;
  }

  public get clone(): Schuetze {
    const sC = new Schuetze();

    sC.vorname = this.vorname;
    sC.nachname = this.nachname;
    sC.resultate = this.resultate;
    sC.lizenzNr = this.lizenzNr;

    sC._fbKey = this._fbKey;

    return sC;
  }

  constructor(obj?:any) {
    if (isObject(obj)) {
      if (isString(obj.vorname) && !isEmpty(obj.vorname)) this.vorname = obj.vorname;
      if (isString(obj.nachname) && !isEmpty(obj.nachname)) this.nachname = obj.nachname;
      if (obj.resultate) this.resultate = obj.resultate;
      if (obj.lizenzNr) this.lizenzNr = obj.lizenzNr;

      if (isString(obj._fbKey) && !isEmpty(obj._fbKey)) this._fbKey = obj._fbKey;
    }
  }

  // --- Used by FirebaseServiceProvider : do only read
  public _fbKey: string = "";
}
