
import { Stich } from './Stich';
import { Observable } from "rxjs/Observable";

export class Resultat {
  public stich: Observable<Stich>;
  public punktzahl: number;

  public get key():string {
    return this._fbKey;
  }

  public get clone():Resultat {
    const rC = new Resultat();

    rC.stich = this.stich;
    rC.punktzahl = this.punktzahl;

    rC._fbSchuetzeKey = this._fbSchuetzeKey;
    rC._fbKey = this._fbKey;
    rC._fbStichKey = this._fbStichKey;

    return rC
  }

  // --- Used by FirebaseServiceProvider : do only read
  public _fbKey: string;
  public _fbStichKey: string;
  public _fbSchuetzeKey: string;
}
