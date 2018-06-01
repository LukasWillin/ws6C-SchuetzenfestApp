
import isObject from 'lodash/isObject';
import isInteger from 'lodash/isInteger';
import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';

import { Stich } from './Stich'
import { Observable } from "rxjs/Observable";
import {Resultat} from "./Resultat";

export class Schuetzenfest {
  public stiche: Observable<Stich[]> = Observable.empty<Stich[]>();
  public name: string = "";

  public get key():string {
    return this._fbKey;
  }

  public get clone():Schuetzenfest {
    let sfC = new Schuetzenfest();

    sfC.stiche = this.stiche;
    sfC.name = this.name;

    sfC._fbKey = this._fbKey;

    return sfC;
  }

  constructor(obj?:any) {
    if(isObject(obj)) {
      if (isString(obj.name) && !isEmpty(obj.name)) this.name = obj.name;
      if (obj.stiche) this.stiche = obj.stiche;

      if (isString(obj._fbKey) && !isEmpty(obj._fbKey)) this._fbKey = obj._fbKey;
    }
  }

  // --- Used by FirebaseServiceProvider : do only read
  public _fbKey: string;
}
