
import {Resultat} from "./Resultat";
import {Observable} from "rxjs/Observable";

export class Schuetze {
  public vorname: string;
  public nachname: string;
  public resultate: Observable<Resultat[]>;
  public lizenzNr: string;

  public get key(): string {
    return this._fbKey;
  }

  public get clone(): Schuetze {
    const sC = new Schuetze();

    sC.vorname = this.vorname;
    sC.nachname = this.nachname;
    sC.resultate = this.resultate;
    sC.lizenzNr = this.lizenzNr;

    sC._fbKey = this._fbKey;

    return sC;
  }

  // --- Used by FirebaseServiceProvider : do only read
  public _fbKey: string;
}
