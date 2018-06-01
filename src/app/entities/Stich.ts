
export class Stich {
  public anzahlschuss: number;
  public scheibe: number;

  public get key():string {
    return this._fbKey;
  }

  public get clone():Stich {
    const sC = new Stich();

    sC.anzahlschuss = this.anzahlschuss;
    sC.scheibe = this.scheibe;

    sC._fbKey = this._fbKey;
    sC._fbSchuetzenfestKey = this._fbSchuetzenfestKey;

    return sC;
  }

  // --- Used by FirebaseServiceProvider : do only read
  public _fbKey: string;
  public _fbSchuetzenfestKey: string;
}
