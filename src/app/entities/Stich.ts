
import isObject from 'lodash/isObject';
import isInteger from 'lodash/isInteger';
import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';
import isBoolean from "lodash/isBoolean";
import isDate from "lodash/isDate";

export class Stich {

  set name(value:string) {
    this._fb_lastChanged = new Date();
    this._fb_field_name = value;
  }

  get name() : string {
    return this._fb_field_name;
  }

  get scheibe(): number {
    return this._fb_field_scheibe;
  }

  set scheibe(value: number) {
    this._fb_lastChanged = new Date();
    this._fb_field_scheibe = value;
  }
  get anzahlschuss(): number {
    return this._fb_field_anzahlschuss;
  }
  set anzahlschuss(value: number) {
    this._fb_lastChanged = new Date();
    this._fb_field_anzahlschuss = value;
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
  public get clone() : Stich {
    const stC = new Stich();

    stC.anzahlschuss = this.anzahlschuss;
    stC.scheibe = this.scheibe;

    stC._fbKey = this._fbKey;
    stC._fbSchuetzenfestKey = this._fbSchuetzenfestKey;

    stC._fb_lastChanged = this._fb_lastChanged;
    stC._fb_isPlaceholder = this._fb_isPlaceholder;

    return stC;
  }

  constructor(obj?:any, setPlaceholder?:boolean) {
    if (arguments.length === 1)
      setPlaceholder = obj;

    if (isObject(obj)) {
      if (isInteger(obj.anzahlschuss)) this.anzahlschuss =  obj.anzahlschuss;
      if (isInteger(obj.scheibe)) this.scheibe = obj.scheibe;

      if (isString(obj._fbKey)) this._fbKey = obj._fbKey;
      if (isString(obj._fbSchuetzenfestKey)) this._fbSchuetzenfestKey = obj._fbSchuetzenfestKey;

      if (isDate(obj._fb_lastChanged)) this._fb_lastChanged = obj._fb_lastChanged;
    }
    if (isBoolean(setPlaceholder)) {
      this._fb_isPlaceholder = setPlaceholder;
    }
  }

  // --- Used by FirebaseServiceProvider : do only read
  public _fbKey : string;
  public _fbSchuetzenfestKey : string;

  public _fb_isPlaceholder : boolean = false;
  public _fb_lastChanged : Date = new Date();

  public _fb_field_anzahlschuss : number = 0;
  public _fb_field_scheibe : number = -1;
  public _fb_field_name : string = "";
}
