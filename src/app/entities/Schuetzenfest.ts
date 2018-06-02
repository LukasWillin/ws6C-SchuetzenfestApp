
import isObject from 'lodash/isObject';
import isInteger from 'lodash/isInteger';
import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';
import isBoolean from 'lodash/isBoolean';

import { Stich } from './Stich'
import {Resultat} from "./Resultat";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import set = Reflect.set;

export class Schuetzenfest {
  public stiche : BehaviorSubject<Stich[]> = new BehaviorSubject<Stich[]>([]);
  public name : string = "";

  public get key() : string {
    return this._fbKey;
  }

  public get isPlaceholder() : boolean {
    return !!this._fb_isPlaceholder;
  }

  public get clone() : Schuetzenfest {
    let sfC = new Schuetzenfest();

    sfC.stiche = this.stiche;
    sfC.name = this.name;

    sfC._fbKey = this._fbKey;

    return sfC;
  }

  constructor(obj?:any, setPlaceholder?:boolean) {
    if (arguments.length === 1)
      setPlaceholder = obj;

    if(isObject(obj)) {
      if (isString(obj.name) && !isEmpty(obj.name)) this.name = obj.name;
      if (obj.stiche) this.stiche = obj.stiche;

      if (isString(obj._fbKey) && !isEmpty(obj._fbKey)) this._fbKey = obj._fbKey;

    } else if (isBoolean(setPlaceholder)) {
      this._fb_isPlaceholder = setPlaceholder;
    }
  }

  // --- Used by FirebaseServiceProvider : do only read
  public _fbKey : string;
  public _fb_isPlaceholder : boolean = false;
}
