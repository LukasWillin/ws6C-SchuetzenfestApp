
import { Stich } from './Stich'
import { Observable } from "rxjs/Observable";
import {Resultat} from "./Resultat";

export class Schuetzenfest {
  public stiche: Observable<Stich[]> = Observable.empty<Stich[]>();
  public name: string;

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

  // --- Used by FirebaseServiceProvider : do only read
  public _fbKey: string;
}
