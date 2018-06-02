import { Injectable } from '@angular/core';
import {AngularFireDatabase, DatabaseSnapshot} from 'angularfire2/database';
import { AngularFireList } from 'angularfire2/database';
import { DatabaseSnapshotDoesNotExist, DatabaseSnapshotExists } from "angularfire2/database/interfaces";
import { AngularFireAction } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';

import isObject from 'lodash/isObject';
import isString from 'lodash/isString';

import { Schuetze } from "./entities/Schuetze";
import { Schuetzenfest } from "./entities/Schuetzenfest";
import { Resultat } from "./entities/Resultat";
import { Stich } from "./entities/Stich";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ConnectableObservable} from "rxjs/observable/ConnectableObservable";

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

    // this.batchResultat = this.batchResultat.bind(this);
    // this.resultat = this.resultat.bind(this);
    this.mapSchuetzePayload = this.mapSchuetzePayload.bind(this);
    this.mapSchuetzenfestPayload = this.mapSchuetzenfestPayload.bind(this);
    this.getResultateBySchuetzeKey = this.getResultateBySchuetzeKey.bind(this);
    this.checkIfItemExists = this.checkIfItemExists.bind(this);
    this.getSticheBySchuetzenfestKey = this.getSticheBySchuetzenfestKey.bind(this);
  }


  public schuetze(instance: Schuetze|string, crudOp?: string): BehaviorSubject<Schuetze> {
    const self = this;

    const fbKey:string = (typeof instance === 'object') ? instance._fbKey : instance;

    let schuetze:Schuetze;
    let resultatBatch: Resultat[];
    let resultatBatchKeys: string[];

    if (crudOp !== CRUD.GET) {
      let asyncBatch:Promise<Schuetze>;
      if (typeof instance === 'object') asyncBatch = Promise.resolve(instance);
      else asyncBatch = this.getSchuetzeByKey(fbKey).toPromise();
      if(asyncBatch) {
        asyncBatch.then(s => {
          if (s.resultate && !s.resultate.isEmpty()) {
            schuetze.resultate.subscribe(rL => {
                rL.forEach(r => {
                  r._fbSchuetzeKey = fbKey;
                });
                resultatBatch = rL;
                resultatBatchKeys = rL.map(r => r._fbKey);
                // self.batchResultat(resultatBatch, crudOp).then(_ => {});
              })
              .unsubscribe();
          }
        })
      }
    }

    if(typeof instance === 'object' && crudOp === undefined || crudOp === CRUD.UPDATE || crudOp === CRUD.PUSH) {
      return BehaviorSubject.create(Observable.fromPromise(this.checkIfItemExists(FBREF_PATH_SCHUETZEN, fbKey).then( exists => {

        instance = new Schuetze(instance);
        instance.resultate = null;

        if (exists && crudOp === undefined || crudOp === CRUD.UPDATE) {
          return self._fbRefSchuetzen.update(fbKey, instance).then(_ => {
            return self.getSchuetzeByKey(fbKey);
          });

        } else if (!exists || !exists && crudOp === CRUD.PUSH) {
          return self._fbRefSchuetzen.push(instance).once('value').then(item => {
            return self.getSchuetzeByKey(item.key);
          });

        } else {
          return Observable.create(new Error(`Internal state error. Failed with CRUD ${crudOp} on ${exists ? 'existing ' : 'missing'} instance ${fbKey}`));
        }
      })).first().flatMap(o => {
        if (o._fbKey) {
          return o;
        } else {
          return o.first().map(s => s);
        }
      }));

    } else {
      if (crudOp === undefined || crudOp === CRUD.GET) {
        return self.getSchuetzeByKey(fbKey);
      } else if (crudOp === CRUD.DELETE) {
        return BehaviorSubject.create(Promise.resolve(this.getSchuetzeByKey(fbKey)).then(s => {
          return self._fbRefSchuetzen.remove(fbKey).then(() => s );
        })).first().flatMap(o => o.first().map(s => s));
      } else {
        return Observable.create(new Error(`Tried to call FireBaseProvider#schuetzen with instance set to ${(typeof instance)} but expected \Object\<\Schuetzenfest\>, undefined or null and/or crud`));
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
  public schuetzenfest(instance: Schuetzenfest|string, crudOp?: string): BehaviorSubject<Schuetzenfest> {
    const fbKey:string = (typeof instance === 'object') ? instance._fbKey : instance;
    const self = this;
    if(typeof instance === 'object' && crudOp === undefined || crudOp === CRUD.UPDATE || crudOp === CRUD.PUSH) {

      let stichBatch: Stich[];
      let stichBatchKeys: string[];
      let schuetzenfest:Schuetzenfest;

      if (crudOp !== CRUD.GET) {
        if (typeof instance === 'object') schuetzenfest = instance;
        else this.getSchuetzenfestByKey(fbKey).subscribe(s => schuetzenfest = s).unsubscribe();
        if(!schuetzenfest.stiche.isEmpty()) {
          schuetzenfest.stiche.subscribe(stL => {
              stL.forEach(r => {
                r._fbSchuetzenfestKey = fbKey;
              });
              stichBatch = stL;
              stichBatchKeys = stL.map(r => r._fbKey);
              this.batchStich(stichBatch, crudOp);
            })
            .unsubscribe();
        }
      }

      return BehaviorSubject.create(Observable.fromPromise(this.checkIfItemExists(FBREF_PATH_SCHUETZENFESTE, fbKey).then(exists => {

        instance = new Schuetzenfest(instance);
        instance.stiche = null;

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
      })).first().flatMap(o => { return o.first().map(s => s); }));
    } else {
      if (crudOp === undefined || crudOp === CRUD.GET) {
        return self.getSchuetzenfestByKey(fbKey);
      } else if (crudOp === CRUD.DELETE) {
        return BehaviorSubject.create(Promise.resolve(this.getSchuetzenfestByKey(fbKey)).then(sf => {
          self._fbRefSchuetzenfeste.remove(fbKey);
          return sf;
        })).first().flatMap(o => { return o.first().map(s => s); });
      } else {
        return Observable.create(new Error(`Tried to call FireBaseProvider#schuetzenfest with instance set to ${(typeof instance)} but expected \Object\<\Schuetzenfest\>, undefined or null and/or crud`));
      }
    }
  }

  public batchStich(instances: Stich[]|string[], crudOp:string): BehaviorSubject<Stich[]> {
    let result:BehaviorSubject<Stich[]> = new BehaviorSubject<Stich[]>([]);

    if (isString(instances[0])) {
      (instances as string[]).forEach(i => {
        if (isString(i)) {
          const cobs : ConnectableObservable<Stich> = this.stich(i, crudOp).publish();
          cobs.subscribe(r => {
            const val = result.value;
            val.push(r);
            result.next(val);
          });
          cobs.connect();
        }
      });

    } else {
      (instances as Stich[]).forEach(i => {
        if (isObject(i)) {
          const cobs : ConnectableObservable<Stich> = this.stich(i, crudOp).publish();
          cobs.subscribe(r => {
            const val = result.value;
            val.push(r);
            result.next(val);
          });
          cobs.connect();
        }
      });
    }

    return result;
  }

  public stich(instance: Stich|string, crudOp?: string): BehaviorSubject<Stich> {
    const fbKey:string = (typeof instance === 'object') ? instance._fbKey : instance;
    const self = this;
    if(typeof instance === 'object' && crudOp === undefined || crudOp === CRUD.UPDATE || crudOp === CRUD.PUSH) {

      return BehaviorSubject.create(Observable.fromPromise(this.checkIfItemExists(FBREF_PATH_STICHE, fbKey).then(exists => {

        instance = new Stich(instance);

        if(exists && crudOp === undefined || exists && crudOp === CRUD.UPDATE) {
          return self._fbRefStiche.update(fbKey, instance).then(_ => {
            return self.getStichByKey(fbKey);
          });

        } else if (!exists || !exists && crudOp === CRUD.PUSH) {
          return self._fbRefStiche.push(instance).once('value').then(item => {
            return self.getStichByKey(item.key);
          });

        } else {
          return BehaviorSubject.create(new Error(`Internal state error. Failed with CRUD ${crudOp} on ${exists ? 'existing ' : 'missing'} instance ${fbKey}`));
        }
      })).first().flatMap(o => o.first().map(s => s)));

    } else {
      if (crudOp === undefined || crudOp === CRUD.GET) {
        return self.getStichByKey(fbKey);
      } else if (crudOp === CRUD.DELETE) {
        return BehaviorSubject.create(Promise.resolve(this.getStichByKey(fbKey)).then(st => {
          return self._fbRefStiche.remove(fbKey).then(() => st );
        })).first().flatMap(o => o.first().map(st => st));
      } else {
        return Observable.create(new Error(`Tried to call FireBaseProvider#stich with instance set to ${(typeof instance)} but expected \Object\<\Stich\>, undefined or null and/or crud`));
      }
    }
  }


  public batchResultat(instances: Resultat[]|string[], crudOp:string): BehaviorSubject<Resultat[]> {
    let result:BehaviorSubject<Resultat[]> = new BehaviorSubject<Resultat[]>([]);
    if (isString(instances[0])) {
      (instances as string[]).forEach(i => {
        if (isString(i)) {
          const cobs : ConnectableObservable<Resultat> = this.resultat(i, crudOp).publish();
          cobs.subscribe(r => {
            const val = result.value;
            val.push(r);
            result.next(val);
          });
          cobs.connect();
        }
      });
    } else {
      (instances as Resultat[]).forEach(i => {
        if (isObject(i)) {
          const cobs : ConnectableObservable<Resultat> = this.resultat(i, crudOp).publish();
          cobs.subscribe(r => {
            const val = result.value;
            val.push(r);
            result.next(val);
          });
          cobs.connect();
        }
      });
    }
    return result;
  }

  /**
   * CRUD method to update, delete, get, push.
   * The `crudOp` parameter might only be necessary upon deletion.
   * @param {Resultat | string} instance - Either instance object or reference key.
   * @param {string} crudOp - Import CRUD to easily access available CRUD Operations.
   * @returns {Promise<Observable<Resultat>>}
   */
  public resultat(instance: Resultat|string, crudOp?: string): BehaviorSubject<Resultat> {
    const bhs : BehaviorSubject<Resultat> = new BehaviorSubject<Resultat>(new Resultat(true));

    const fbKey:string = (typeof instance === 'object') ? instance._fbKey : instance;
    const self = this;

    let obs : ConnectableObservable<Resultat>;

    if(typeof instance === 'object' && crudOp === undefined || crudOp === CRUD.UPDATE || crudOp === CRUD.PUSH) {

      obs = Observable.fromPromise(this.checkIfItemExists(FBREF_PATH_RESULTATE, fbKey).then(exists => {
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
          console.error(new Error(`Internal state error. Failed with CRUD ${crudOp} on ${exists ? 'existing ' : 'missing'} instance ${fbKey}`));
        }
      })).flatMap(o => o.map(r => new Resultat(r))).publish();
    } else {
      if (crudOp === undefined || crudOp === CRUD.GET) {
        obs = self.getResultatByKey(fbKey).publish();
      } else if (crudOp === CRUD.DELETE) {
        obs = Observable.fromPromise(Promise.resolve(this.getResultatByKey(fbKey)).then(r => {
          self._fbRefResultate.remove(fbKey);
          return r;
        })).flatMap(o => { return o.map(r => r); }).publish();
      } else {
        console.error(new Error(`Tried to call FireBaseProvider#resultat with instance set to ${(typeof instance)} but expected \Object\<\Resultat\>, undefined or null and/or crud`));
      }
    }

    obs.subscribe((r) => bhs.next(new Resultat(r)));
    obs.connect();

    return bhs;
  }

  public getSchuetzenfestByKey(key): BehaviorSubject<Schuetzenfest> {
    const bhS = new BehaviorSubject(new Schuetzenfest(true));
    const cobs : ConnectableObservable<Schuetzenfest> = this.afd.object(`${FBREF_PATH_SCHUETZENFESTE}/${key}`)
      .snapshotChanges()
      .map(this.mapSchuetzenfestPayload)
      .publish();
    cobs.subscribe(sf => {
      bhS.next(new Schuetzenfest(sf));
    });
    cobs.connect();
    return bhS;
  }

  public getSchuetzeByKey(key): BehaviorSubject<Schuetze> {
    return BehaviorSubject.create(this.afd.object<Schuetze>(`${FBREF_PATH_SCHUETZEN}/${key}`)
      .snapshotChanges()
      .map(c => this.mapSchuetzePayload(c)));
  }

  public getStichByKey(key): BehaviorSubject<Stich> {
    return BehaviorSubject.create(this.afd.object(`${FBREF_PATH_STICHE}/${key}`)
      .snapshotChanges()
      .map(this.mapStichPayload));
  }

  public getResultatByKey(key): BehaviorSubject<Resultat> {
    return BehaviorSubject.create(this.afd.object(`${FBREF_PATH_RESULTATE}/${key}`)
      .snapshotChanges()
      .map(this.mapResultatPayload));
  }

  public getSticheBySchuetzenfestKey(schuetzenfestKey: string) : BehaviorSubject<Stich[]> {
    return BehaviorSubject.create(this._stiche
      .map(stL =>
        stL.filter(st =>
          st._fbSchuetzenfestKey === schuetzenfestKey)));
  }

  public getResultateBySchuetzeKey(schuetzeKey: string): BehaviorSubject<Resultat[]> {
    return BehaviorSubject.create(this._resultate
      .map(rL => rL.filter(r => r._fbSchuetzeKey === schuetzeKey)));
  }

  private mapStichPayload(c:AngularFireAction<DatabaseSnapshotExists<Stich>>|AngularFireAction<DatabaseSnapshotDoesNotExist<Stich>>):Stich {
    const st = c.payload.val();
    if (isObject) {
      st._fbKey = c.payload.key;
      return new Stich(st);
    } else {
      console.warn("A given key was probably faulty or not existing in firebase");
      return st;
    }
  }

  private mapResultatPayload(c:AngularFireAction<DatabaseSnapshotExists<Resultat>>|AngularFireAction<DatabaseSnapshotDoesNotExist<Resultat>>):Resultat {
    const r = c.payload.val();
    if (isObject) {
      r._fbKey = c.payload.key;
      r.stich = this.getStichByKey(r._fbStichKey);
      return new Resultat(r)
    } else {
      console.warn("A given key was probably faulty or not existing in firebase");
      return r;
    }
  }

  private mapSchuetzenfestPayload(c:AngularFireAction<DatabaseSnapshotExists<Schuetzenfest>>|AngularFireAction<DatabaseSnapshotDoesNotExist<Schuetzenfest>>):Schuetzenfest {
    const sf = c.payload.val();
    if (isObject(sf)) {
      sf._fbKey = c.payload.key;
      sf.stiche = this.getSticheBySchuetzenfestKey(sf._fbKey);
      return new Schuetzenfest(sf);
    } else {
      console.warn("A given key was probably faulty or not existing in firebase");
      return sf;
    }
  }

  private mapSchuetzePayload(c:AngularFireAction<DatabaseSnapshot<Schuetze>>|AngularFireAction<DatabaseSnapshotExists<Schuetze>>|AngularFireAction<DatabaseSnapshotDoesNotExist<Schuetze>>):Schuetze {
    const s = c.payload.val();
    if (s) {
      s._fbKey = c.payload.key;
      s.resultate = this.getResultateBySchuetzeKey(s._fbKey);
      return new Schuetze(s);
    } else {
      console.warn("A given key was probably faulty or not existing in firebase");
      return s;
    }
  }
  private checkIfItemExists(path: string, id:string): Promise<boolean> {
    if (!path) {
      let err = new Error(`[IllegalArgumentException] path must be a string to check for existence of '${id}' but was '${path}'`);
      console.error(err);
      throw err;
    }

    if (!id) return Promise.resolve(false);

    return this.afd.object(`${path}/${id}`)
      .snapshotChanges()
      .first()
      .map(c => c.payload.val() !== null)
      .toPromise();
  }
}
