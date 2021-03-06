
import isObject from 'lodash/isObject';
import isInteger from 'lodash/isInteger';
import isEmpty from 'lodash/isEmpty';
import isBoolean from "lodash/isBoolean";
import isDate from "lodash/isDate";
import isNumber from 'lodash/isNumber';
import isString from "lodash/isString";

export class Stich {

  set name(value:string) {
    this._fb_lastChanged = new Date();
    this._fb_isPlaceholder = false;
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
    this._fb_isPlaceholder = false;
    this._fb_field_scheibe = value;
  }

  get anzahlschuss(): number {
    return this._fb_field_anzahlschuss;
  }

  set anzahlschuss(value: number) {
    this._fb_lastChanged = new Date();
    this._fb_isPlaceholder = false;
    this._fb_field_anzahlschuss = value;
  }

  get key() : string {
    return this._fbKey;
  }

  get schuetzenfestKey() : string {
    return this._fbSchuetzenfestKey;
  }

  public get isPlaceholder() : boolean {
    return this._fb_isPlaceholder;
  }
  public get lastChanged() : Date {
    return new Date(this._fb_lastChanged.getTime());
  }

  public toString() : string {
    const jsonify = new Stich(this);
    return JSON.stringify(jsonify);
  }

  clone() : Stich {
    return new Stich(this);
  }

  constructor(obj?:any, setPlaceholder?:boolean) {
    if (arguments.length === 1)
      setPlaceholder = obj;

    if (isObject(obj)) {
      if (isInteger(+obj.anzahlschuss) && +obj._fb_field_anzahlschuss !== 0) this._fb_field_anzahlschuss =  +obj.anzahlschuss;
      if (!isEmpty(obj.name)) this._fb_field_name = obj.name;
      if (isNumber(+obj.scheibe) && +obj.scheibe !== -1) this._fb_field_scheibe = +obj.scheibe;

      if (isInteger(+obj._fb_field_anzahlschuss) && +obj._fb_field_anzahlschuss !== 0) this._fb_field_anzahlschuss =  +obj._fb_field_anzahlschuss;
      if (!isEmpty(obj._fb_field_name)) this._fb_field_name = obj._fb_field_name;
      if (isNumber(+obj._fb_field_scheibe) && +obj._fb_field_scheibe !== -1) this._fb_field_scheibe = +obj._fb_field_scheibe;

      if (!isEmpty(obj._fbKey)) this._fbKey = obj._fbKey;
      if (!isEmpty(obj._fbSchuetzenfestKey)) this._fbSchuetzenfestKey = obj._fbSchuetzenfestKey;

      if (isDate(obj._fb_lastChanged)) this._fb_lastChanged = obj._fb_lastChanged;
      if (isString(obj._fb_lastChanged)) this._fb_lastChanged = new Date(Date.parse(obj._fb_lastChanged));
    }
    if (isBoolean(setPlaceholder)) {
      this._fb_isPlaceholder = setPlaceholder;
    }
  }

  // --- Used by FirebaseServiceProvider : do only read
  public _fbKey : string = "";
  public _fbSchuetzenfestKey : string = "";

  public _fb_isPlaceholder : boolean = false;
  public _fb_lastChanged : Date = new Date();

  public _fb_field_anzahlschuss : number = 0;
  public _fb_field_scheibe : number = -1;
  public _fb_field_name : string = "";
}
