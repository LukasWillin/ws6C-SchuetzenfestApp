
import isObject from 'lodash/isObject';
import isInteger from 'lodash/isInteger';
import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';

export class Stich {
  public anzahlschuss: number;
  public scheibe: number;

  public get key():string {
    return this._fbKey;
  }

  public get clone():Stich {
    const sC = new Stich();

    sC.anzahlschuss = this.anzahlschuss;
    sC.scheibe = this.scheibe;

    sC._fbKey = this._fbKey;
    sC._fbSchuetzenfestKey = this._fbSchuetzenfestKey;

    return sC;
  }

  constructor(obj?:any) {
    if (isObject(obj)) {
      if (isInteger(obj.anzahlschuss)) this.anzahlschuss =  obj.anzahlschuss;
      if (isInteger(obj.scheibe)) this.scheibe = obj.scheibe;

      if (isString(obj._fbKey)) this._fbKey = obj._fbKey;
      if (isString(obj._fbSchuetzenfestKey)) this._fbSchuetzenfestKey = obj._fbSchuetzenfestKey;
    }
  }

  // --- Used by FirebaseServiceProvider : do only read
  public _fbKey: string;
  public _fbSchuetzenfestKey: string;
}
