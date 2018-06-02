
import isObject from 'lodash/isObject';
import isInteger from 'lodash/isInteger';
import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';
import isBoolean from 'lodash/isBoolean';
import isDate from 'lodash/isBoolean';

import { Stich } from './Stich'
import {Resultat} from "./Resultat";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import set = Reflect.set;

export class Schuetzenfest {

  public get name() : string {
    return this._fb_field_name;
  }
  public set name(value:string) {
    this._fb_field_name = value;
  }

  public get stiche() : BehaviorSubject<Stich[]> {
    return this._fb_field_stiche;
  }
  public set stiche(value: BehaviorSubject<Stich[]>) {
    this._fb_field_stiche = value;
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

  public get clone() : Schuetzenfest {
    let sfC = new Schuetzenfest();

    sfC.stiche = this.stiche;
    sfC.name = this.name;

    sfC._fbKey = this._fbKey;

    sfC._fb_lastChanged = this._fb_lastChanged;
    sfC._fb_isPlaceholder = this._fb_isPlaceholder;

    return sfC;
  }

  constructor(obj?:any, setPlaceholder?:boolean) {
    if (arguments.length === 1)
      setPlaceholder = obj;

    if(isObject(obj)) {
      if (isString(obj.name) && !isEmpty(obj.name)) this.name = obj.name;
      if (obj.stiche) this.stiche = obj.stiche;

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

  public _fb_field_name : string = "";
  public _fb_field_stiche : BehaviorSubject<Stich[]> = new BehaviorSubject<Stich[]>([]);
}
