
import {Resultat} from "./Resultat";

import isObject from 'lodash/isObject';
import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';
import isBoolean from 'lodash/isBoolean';
import isDate from 'lodash/isDate';

import {BehaviorSubject} from "rxjs/BehaviorSubject";

export class Schuetze {
  get vorname(): string {
    return this._fb_field_vorname;
  }

  set vorname(value: string) {
    this._fb_lastChanged = new Date();
    this._fb_field_vorname = value;
  }

  get nachname(): string {
    return this._fb_field_nachname;
  }

  set nachname(value: string) {
    this._fb_lastChanged = new Date();
    this._fb_field_nachname = value;
  }

  get resultate(): Resultat[] {
    return this._field_resultate;
  }

  set resultate(value: Resultat[]) {
    this._fb_lastChanged = new Date();
    this._field_resultate = value;
  }

  get lizenzNr(): string {
    return this._fb_field_lizenzNr;
  }

  set lizenzNr(value: string) {
    this._fb_lastChanged = new Date();
    this._fb_field_lizenzNr = value;
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
  public get clone() : Schuetze {
    return new Schuetze(this);
  }

  public toString() : string {
    const jsonify = new Schuetze(this);
    jsonify.resultate = [];
    return JSON.stringify(jsonify);
  }

  constructor(obj?:any, setPlaceholder?:boolean) {
    if (arguments.length === 1)
      setPlaceholder = obj;

    if (isObject(obj)) {
      if (isString(obj._fb_field_vorname) && !isEmpty(obj._fb_field_vorname)) this._fb_field_vorname = obj._fb_field_vorname;
      if (isString(obj._fb_field_nachname) && !isEmpty(obj._fb_field_nachname)) this._fb_field_nachname = obj._fb_field_nachname;
      if (obj._field_resultate) this._field_resultate = obj._field_resultate;
      if (obj._fb_field_lizenzNr) this._fb_field_lizenzNr = obj._fb_field_lizenzNr;

      if (isString(obj._fbKey) && !isEmpty(obj._fbKey)) this._fbKey = obj._fbKey;

      if (isDate(obj._fb_lastChanged)) this._fb_lastChanged = obj._fb_lastChanged;
    }
    if (isBoolean(setPlaceholder)) {
      this._fb_isPlaceholder = setPlaceholder;
    }
  }

  // --- Used by FirebaseServiceProvider : do only read
  public _fbKey : string = "";

  public _fb_lastChanged : Date = new Date();
  public _fb_isPlaceholder : boolean = false;

  public _fb_field_vorname : string = "";
  public _fb_field_nachname : string = "";
  public _fb_field_lizenzNr : string = "";

  public _field_resultate : Resultat[] = [];
}
