
import {Resultat} from "./Resultat";
import {Observable} from "rxjs/Observable";

import isObject from 'lodash/isObject';
import isInteger from 'lodash/isInteger';
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

  get resultate(): BehaviorSubject<Resultat[]> {
    return this._fb_field_resultate;
  }

  set resultate(value: BehaviorSubject<Resultat[]>) {
    this._fb_lastChanged = new Date();
    this.resultateSubscription.unsubscribe();
    this._fb_field_resultate = value;
    this.resultateSubscription = this._fb_field_resultate.subscribe(stL => this.resultateChangedHandler());
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
    const sC = new Schuetze();

    sC.vorname = this.vorname;
    sC.nachname = this.nachname;
    sC.resultate = this.resultate;
    sC.lizenzNr = this.lizenzNr;

    sC._fbKey = this._fbKey;

    sC._fb_lastChanged = this._fb_lastChanged;
    sC._fb_isPlaceholder = this._fb_isPlaceholder;

    return sC;
  }

  constructor(obj?:any, setPlaceholder?:boolean) {
    if (arguments.length === 1)
      setPlaceholder = obj;

    if (isObject(obj)) {
      if (isString(obj.vorname) && !isEmpty(obj.vorname)) this._fb_field_vorname = obj.vorname;
      if (isString(obj.nachname) && !isEmpty(obj.nachname)) this._fb_field_nachname = obj.nachname;
      if (obj.resultate) this.resultate = obj.resultate;
      if (obj.lizenzNr) this._fb_field_lizenzNr = obj.lizenzNr;

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
  public _fb_field_resultate : BehaviorSubject<Resultat[]> = new BehaviorSubject<Resultat[]>([]);
  public _fb_field_lizenzNr : string = "";

  private resultateSubscription = this._fb_field_resultate.subscribe(stL => this.resultateChangedHandler());

  private resultateChangedHandler() {
    this._fb_lastChanged = new Date();
  }
}
