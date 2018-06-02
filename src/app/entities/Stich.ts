
import isObject from 'lodash/isObject';
import isInteger from 'lodash/isInteger';
import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';
import isBoolean from "lodash/isBoolean";

export class Stich {
  public anzahlschuss : number = 0;
  public scheibe : number = -1;

  public get key() : string {
    return this._fbKey;
  }

  public get isPlaceholder() : boolean {
    return !!this._fb_isPlaceholder;
  }

  public get clone() : Stich {
    const sC = new Stich();

    sC.anzahlschuss = this.anzahlschuss;
    sC.scheibe = this.scheibe;

    sC._fbKey = this._fbKey;
    sC._fbSchuetzenfestKey = this._fbSchuetzenfestKey;

    return sC;
  }

  constructor(obj?:any, setPlaceholder?:boolean) {
    if (arguments.length === 1)
      setPlaceholder = obj;

    if (isObject(obj)) {
      if (isInteger(obj.anzahlschuss)) this.anzahlschuss =  obj.anzahlschuss;
      if (isInteger(obj.scheibe)) this.scheibe = obj.scheibe;

      if (isString(obj._fbKey)) this._fbKey = obj._fbKey;
      if (isString(obj._fbSchuetzenfestKey)) this._fbSchuetzenfestKey = obj._fbSchuetzenfestKey;

    } else if (isBoolean(setPlaceholder)) {
      this._fb_isPlaceholder = setPlaceholder;
    }
  }

  // --- Used by FirebaseServiceProvider : do only read
  public _fbKey : string;
  public _fbSchuetzenfestKey : string;
  public _fb_isPlaceholder : boolean = false;
}
