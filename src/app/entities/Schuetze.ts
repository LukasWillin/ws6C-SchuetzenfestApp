
import {Resultat} from "./Resultat";
import {Observable} from "rxjs/Observable";

export class Schuetze {
  public vorname: string = "";
  public nachname: string = "";
  public resultate: Observable<Resultat[]> = new Observable<Resultat[]>();
  public lizenzNr: string = "";

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

  constructor(obj?:any) {
    if (typeof obj === 'object') {
      if (obj.vorname) this.vorname = obj.vorname;
      if (obj.nachname) this.nachname = obj.nachname;
      if (obj.resultate) this.resultate = obj.resultate;
      if (obj.lizenzNr) this.lizenzNr = obj.lizenzNr;

      if(obj._fbKey) this._fbKey = obj._fbKey;
    }
  }

  // --- Used by FirebaseServiceProvider : do only read
  public _fbKey: string = "";
}
