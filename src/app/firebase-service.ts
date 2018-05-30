import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireList } from 'angularfire2/database';
import { DatabaseSnapshotDoesNotExist, DatabaseSnapshotExists } from "angularfire2/database/interfaces";
import { AngularFireAction } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';

import { Schuetze } from "./entities/Schuetze";
import { Schuetzenfest } from "./entities/Schuetzenfest";
import { Resultat } from "./entities/Resultat";
import { Stich } from "./entities/Stich";

const FBREF_PATH_SCHUETZEN = '/schuetzen';
const FBREF_PATH_SCHUETZENFESTE = '/schuetzenfeste';
const FBREF_PATH_RESULTATE = '/resultate';
const FBREF_PATH_STICHE = '/stiche';

const STR_DELETE = 'delete';
const STR_UPDATE = 'update';
const STR_PUSH = 'push';
const STR_GET = 'get';

class CRUD {
  public static get DELETE(): string {
    return STR_DELETE;
  }

  public static get UPDATE(): string {
    return STR_UPDATE;
  }

  public static get PUSH(): string {
    return STR_PUSH;
  }

  public static get GET(): string {
    return STR_GET;
  }
}

@Injectable()
export class FirebaseServiceProvider {

  private _fbRefSchuetzenfeste:AngularFireList<Schuetzenfest>;
  private _fbRefSchuetzen:AngularFireList<Schuetze>;
  private _fbRefResultate:AngularFireList<Resultat>;
  private _fbRefStiche:AngularFireList<Stich>;

  private _schuetzenfeste: Observable<Schuetzenfest[]>;
  get schuetzenfeste(): Observable<Schuetzenfest[]> {
    return this._schuetzenfeste;
  }
  private _schuetzen: Observable<Schuetze[]>;
  get schuetzen(): Observable<Schuetze[]> {
    return this._schuetzen;
  }
  private _resultate: Observable<Resultat[]>;
  get resultate(): Observable<Resultat[]> {
    return this._resultate;
  }
  private _stiche: Observable<Stich[]>;
  get stiche(): Observable<Stich[]> {
    return this._stiche;
  }

  public constructor(public afd: AngularFireDatabase) {
    this._fbRefSchuetzen = this.afd.list(FBREF_PATH_SCHUETZEN);
    this._fbRefSchuetzenfeste = this.afd.list(FBREF_PATH_SCHUETZENFESTE);
    this._fbRefResultate = this.afd.list(FBREF_PATH_RESULTATE);
    this._fbRefStiche = this.afd.list(FBREF_PATH_STICHE);

    const self = this;

    this._stiche = this._fbRefStiche.snapshotChanges().map(changes => {
      return changes.map(self.mapStichPayload);
    });
    this._resultate = this._fbRefResultate.snapshotChanges().map(changes => {
      return changes.map(self.mapResultatPayload);
    });
    this._schuetzenfeste = this._fbRefSchuetzenfeste.snapshotChanges().map(changes => {
      return changes.map(self.mapSchuetzenfestPayload);
    });
    this._schuetzen = this._fbRefSchuetzen.snapshotChanges().map(changes => {
      return changes.map(self.mapSchuetzePayload);
    });
  }

  /**
   *
   * @param lizenzNr required - LizenzNummer of Schuetze.
   * @param instance optional, default:undefined - Ommit to #get. Pass object to #push or #update. Set null to #delete.
   * @param crudOp optional - One of delete, update, push, get
   * @returns {Promise<Schuetze|Error>}
   */
  public schuetze(instance: Schuetze|string, crudOp?: string): Promise<Observable<Schuetze>> {
    const self = this;

    const fbKey:string = (typeof instance === 'object') ? instance._fbKey : instance;

    let schuetze:Schuetze;
    let resultatBatch: Resultat[];
    let resultatBatchKeys: string[];

    if (crudOp !== CRUD.GET) {
      if (typeof instance === 'object') schuetze = instance;
      else this.getSchuetzeByKey(fbKey).subscribe(s => schuetze = s).unsubscribe();
      schuetze.resultate.subscribe(rL => {
          rL.forEach(r => {
            r._fbSchuetzeKey = fbKey;
          });
          resultatBatch = rL;
          resultatBatchKeys = rL.map(r => r._fbKey);
          this.batchResultat(resultatBatch, crudOp).then(_ => {});
        })
        .unsubscribe();
    }

    if(typeof instance === 'object' && crudOp === undefined || crudOp === CRUD.UPDATE || crudOp === CRUD.PUSH) {
      checkIfItemExists(FBREF_PATH_SCHUETZEN, fbKey).then( exists => {
        instance = (instance as Schuetze).clone;
        instance.resultate = undefined;
        if(exists && crudOp === undefined || crudOp === CRUD.UPDATE) {
          return self._fbRefSchuetzen.update(fbKey, instance).then(_ => {
              return self.getSchuetzeByKey(fbKey);
            });
        } else if (!exists || !exists && crudOp === CRUD.PUSH) {
          return self._fbRefSchuetzen.push(instance).once('value').then(item => {
            return self.getSchuetzeByKey(item.key);
          });

        } else {
          return Promise.reject(new Error(`Internal state error. Failed with CRUD ${crudOp} on ${exists ? 'existing ' : 'missing'} instance ${fbKey}`));
        }
      });
    } else {
      if (crudOp === undefined || crudOp === CRUD.GET) {
        return Promise.resolve(self.getSchuetzeByKey(fbKey));
      } else if (crudOp === CRUD.DELETE) {
        return Promise.resolve(self.getSchuetzeByKey(fbKey)).then(s => {
          return self._fbRefSchuetzen.remove(fbKey).then(() => { return s});
        });
      } else {
        return Promise.reject(new Error(`Tried to call FireBaseProvider#schuetzen with instance set to ${(typeof instance)} but expected \Object\<\Schuetzenfest\>, undefined or null and/or crud`));
      }
    }
  }

  /**
   *
   * @param lizenzNr required - LizenzNummer of Schuetze.
   * @param instance optional, default:undefined - Ommit to #get. Pass object to #push or #update. Set null to #delete.
   * @param crudOp optional - One of delete, update, push, get
   * @returns {Promise<Schuetze|Error>}
   */
  public schuetzenfest(instance: Schuetzenfest|string, crudOp?: string): Promise<Observable<Schuetzenfest>> {
    const fbKey:string = (typeof instance === 'object') ? instance._fbKey : instance;
    const self = this;
    if(typeof instance === 'object' && crudOp === undefined || crudOp === CRUD.UPDATE || crudOp === CRUD.PUSH) {

      let stichBatch: Stich[];
      let stichBatchKeys: string[];
      let schuetzenfest:Schuetzenfest;

      if (crudOp !== CRUD.GET) {
        if (typeof instance === 'object') schuetzenfest = instance;
        else this.getSchuetzenfestByKey(fbKey).subscribe(s => schuetzenfest = s).unsubscribe();
        schuetzenfest.stiche.subscribe(stL => {
            stL.forEach(r => {
              r._fbSchuetzenfestKey = fbKey;
            });
            stichBatch = stL;
            stichBatchKeys = stL.map(r => r._fbKey);
            this.batchStich(stichBatch, crudOp).then(_ => {});
          })
          .unsubscribe();
      }

      return checkIfItemExists(FBREF_PATH_SCHUETZENFESTE, fbKey).then(exists => {
        
        instance = (instance as Schuetzenfest).clone;
        instance.stiche = undefined;

        if(exists && crudOp === undefined || exists && crudOp === CRUD.UPDATE) {

          return self._fbRefSchuetzenfeste.update(fbKey, instance).then(_ => {
            return self.getSchuetzenfestByKey(fbKey);
          });

        } else if (!exists || !exists && crudOp === CRUD.PUSH) {
          return self._fbRefSchuetzenfeste.push(instance).once('value').then(item => {
            return self.getSchuetzenfestByKey(item.key);
          });

        } else {
          return Promise.reject(new Error(`Internal state error. Failed with CRUD ${crudOp} on ${exists ? 'existing ' : 'missing'} instance ${fbKey}`));
        }
      });
    } else {
      if (crudOp === undefined || crudOp === CRUD.GET) {
        return Promise.resolve(self.getSchuetzenfestByKey(fbKey));
      } else if (crudOp === CRUD.DELETE) {
        return Promise.resolve(this.getSchuetzenfestByKey(fbKey)).then(s => {
          return self._fbRefSchuetzenfeste.remove(fbKey).then(() => s );
        });
      } else {
        return Promise.reject(new Error(`Tried to call FireBaseProvider#schuetzenfest with instance set to ${(typeof instance)} but expected \Object\<\Schuetzenfest\>, undefined or null and/or crud`));
      }
    }
  }

  public batchStich(instances: Stich[]|string[], crudOp:string): Promise<Observable<Stich>[]> {
    const self = this;
    const result:Observable<Stich>[] = [];
    if (typeof instances[0] === 'string') {
      (instances as string[]).map(() => {})
    } else {
      (instances as Stich[]).forEach(i => this.stich(i, crudOp).then(r => result.push(r)));
    }
    return Promise.resolve(result);
  }

  public stich(instance: Stich|string, crudOp?: string): Promise<Observable<Stich>> {
    const fbKey:string = (typeof instance === 'object') ? instance._fbKey : instance;
    const self = this;
    if(typeof instance === 'object' && crudOp === undefined || crudOp === CRUD.UPDATE || crudOp === CRUD.PUSH) {

      return checkIfItemExists(FBREF_PATH_STICHE, fbKey).then(exists => {
        instance = (instance as Stich).clone;
        if(exists && crudOp === undefined || exists && crudOp === CRUD.UPDATE) {
          return self._fbRefStiche.update(fbKey, instance).then(_ => {
            return self.getStichByKey(fbKey);
          });

        } else if (!exists || !exists && crudOp === CRUD.PUSH) {
          return self._fbRefStiche.push(instance).once('value').then(item => {
            return self.getStichByKey(item.key);
          });

        } else {
          return Promise.reject(new Error(`Internal state error. Failed with CRUD ${crudOp} on ${exists ? 'existing ' : 'missing'} instance ${fbKey}`));
        }
      });
    } else {
      if (crudOp === undefined || crudOp === CRUD.GET) {
        return Promise.resolve(self.getStichByKey(fbKey));
      } else if (crudOp === CRUD.DELETE) {
        return Promise.resolve(this.getStichByKey(fbKey)).then(st => {
          return self._fbRefStiche.remove(fbKey).then(() => st );
        });
      } else {
        return Promise.reject(new Error(`Tried to call FireBaseProvider#stich with instance set to ${(typeof instance)} but expected \Object\<\Stich\>, undefined or null and/or crud`));
      }
    }
  }

  public batchResultat(instances: Resultat[]|string[], crudOp:string): Promise<Observable<Resultat>[]> {
    const self = this;
    const result:Observable<Resultat>[] = [];
    if (typeof instances[0] === 'string') {
      (instances as string[]).map(() => {})
    } else {
      (instances as Resultat[]).forEach(i => this.resultat(i, crudOp).then(r => result.push(r)));
    }
    return Promise.resolve(result);
  }

  /**
   * CRUD method to update, delete, get, push.
   * The `crudOp` parameter might only be necessary upon deletion.
   * @param {Resultat | string} instance - Either instance object or reference key.
   * @param {string} crudOp
   * @returns {Promise<Observable<Resultat>>}
   */
  public resultat(instance: Resultat|string, crudOp?: string): Promise<Observable<Resultat>> {
    const fbKey:string = (typeof instance === 'object') ? instance._fbKey : instance;
    const self = this;
    if(typeof instance === 'object' && crudOp === undefined || crudOp === CRUD.UPDATE || crudOp === CRUD.PUSH) {

      return checkIfItemExists(FBREF_PATH_RESULTATE, fbKey).then(exists => {
        instance = (instance as Resultat).clone;
        if(exists && crudOp === undefined || exists && crudOp === CRUD.UPDATE) {
          return self._fbRefResultate.update(fbKey, instance).then(_ => {
            return self.getResultatByKey(fbKey);
          });

        } else if (!exists || !exists && crudOp === CRUD.PUSH) {
          return self._fbRefResultate.push(instance).once('value').then(item => {
            return self.getResultatByKey(item.key);
          });

        } else {
          return Promise.reject(new Error(`Internal state error. Failed with CRUD ${crudOp} on ${exists ? 'existing ' : 'missing'} instance ${fbKey}`));
        }
      });
    } else {
      if (crudOp === undefined || crudOp === CRUD.GET) {
        return Promise.resolve(self.getResultatByKey(fbKey));
      } else if (crudOp === CRUD.DELETE) {
        return Promise.resolve(this.getResultatByKey(fbKey)).then(st => {
          return self._fbRefResultate.remove(fbKey).then(() => st );
        });
      } else {
        return Promise.reject(new Error(`Tried to call FireBaseProvider#resultat with instance set to ${(typeof instance)} but expected \Object\<\Resultat\>, undefined or null and/or crud`));
      }
    }
  }

  public getSchuetzenfestByKey(key): Observable<Schuetzenfest> {
    return this.afd.object(`${FBREF_PATH_SCHUETZENFESTE}/${key}`)
      .snapshotChanges()
      .map(this.mapSchuetzenfestPayload);
  }

  public getSchuetzeByKey(key): Observable<Schuetze> {
    return this.afd.object(`${FBREF_PATH_SCHUETZEN}/${key}`)
      .snapshotChanges()
      .map(this.mapSchuetzePayload);
  }

  public getStichByKey(key): Observable<Stich> {
    return this.afd.object(`${FBREF_PATH_STICHE}/${key}`)
      .snapshotChanges()
      .map(this.mapStichPayload);
  }

  public getResultatByKey(key): Observable<Resultat> {
    return this.afd.object(`${FBREF_PATH_RESULTATE}/${key}`)
      .snapshotChanges()
      .map(this.mapResultatPayload);
  }

  public getSticheBySchuetzenfestKey(schuetzenfestKey: string) : Observable<Stich[]> {
    return this._stiche
      .map(stL =>
        stL.filter(st =>
          st._fbSchuetzenfestKey === schuetzenfestKey));
  }

  public getResultateBySchuetzeKey(schuetzeKey: string): Observable<Resultat[]> {
    return this._resultate
      .map(rL => rL.filter(r => r._fbSchuetzeKey === schuetzeKey));
  }

  private mapStichPayload(c:AngularFireAction<DatabaseSnapshotExists<Stich>>|AngularFireAction<DatabaseSnapshotDoesNotExist<Stich>>):Stich {
    const st = c.payload.val();
    st._fbKey = c.payload.key;
    return st;
  }

  private mapResultatPayload(c:AngularFireAction<DatabaseSnapshotExists<Resultat>>|AngularFireAction<DatabaseSnapshotDoesNotExist<Resultat>>):Resultat {
    const r = c.payload.val();
    r._fbKey = c.payload.key;
    r.stich = this.getStichByKey(r._fbStichKey);
    return r;
  }

  private mapSchuetzenfestPayload(c:AngularFireAction<DatabaseSnapshotExists<Schuetzenfest>>|AngularFireAction<DatabaseSnapshotDoesNotExist<Schuetzenfest>>):Schuetzenfest {
    const sf = c.payload.val();
    sf._fbKey = c.payload.key;
    sf.stiche = this.getSticheBySchuetzenfestKey(sf._fbKey);
    return sf;
  }

  private mapSchuetzePayload(c:AngularFireAction<DatabaseSnapshotExists<Schuetze>>|AngularFireAction<DatabaseSnapshotDoesNotExist<Schuetze>>):Schuetze {
    const s = c.payload.val();
    s._fbKey = c.payload.key;
    s.resultate = this.getResultateBySchuetzeKey(s._fbKey);
    return s;
  }
}

function checkIfItemExists(path: string, id:string): Promise<boolean> {
  if (!path) throw new Error(`[IllegalArgumentException] path must be a string to check for existence of '${id}' but was '${path}'`);

  if (!id) return Promise.resolve(false);

  var usersRef = this.afd(path);
  return usersRef.child(id).once('value', function(snapshot) {
    return (snapshot.val() !== null);
  }).toPromise();
}
