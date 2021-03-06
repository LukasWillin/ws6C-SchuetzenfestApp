
import isObject from 'lodash/isObject';
import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';
import isBoolean from 'lodash/isBoolean';
import isDate from 'lodash/isBoolean';

export class Schuetzenfest {

  public get name() : string {
    return this._fb_field_name;
  }

  public set name(value:string) {
    this._fb_lastChanged = new Date();
    this._fb_isPlaceholder = false;
    this._fb_field_name = value;
  }

  public get key() : string {
    return this._fbKey;
  }

  public get isPlaceholder() : boolean {
    return this._fb_isPlaceholder;
  }

  public get lastChanged() : Date {
    return new Date(this._fb_lastChanged.getTime());
  }

  public clone() : Schuetzenfest {
    return new Schuetzenfest(this);
  }

  public toString() : string {
    const jsonify = new Schuetzenfest(this);
    return JSON.stringify(jsonify);
  }

  constructor(obj?:any, setPlaceholder?:boolean) {
    if (arguments.length === 1)
      setPlaceholder = obj;

    if(isObject(obj)) {
      if (isString(obj.name) && !isEmpty(obj.name)) this._fb_field_name = obj.name;

      if (isString(obj._fb_field_name) && !isEmpty(obj._fb_field_name)) this._fb_field_name = obj._fb_field_name;

      if (isString(obj._fbKey) && !isEmpty(obj._fbKey)) this._fbKey = obj._fbKey;

      if (isDate(obj._fb_lastChanged)) this._fb_lastChanged = obj._fb_lastChanged;
      if (isString(obj._fb_lastChanged)) this._fb_lastChanged = new Date(Date.parse(obj._fb_lastChanged));
    }
    if (isBoolean(setPlaceholder)) {
      this._fb_isPlaceholder = setPlaceholder;
    }
  }

  // --- Used by FirebaseServiceProvider : do only read
  public _fbKey : string = "";

  public _fb_lastChanged : Date = new Date();
  public _fb_isPlaceholder : boolean = false;

  public _fb_field_name : string = "";
}
