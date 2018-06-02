import { Injectable } from '@angular/core';
import {AngularFireDatabase, DatabaseSnapshot} from 'angularfire2/database';
import { AngularFireList } from 'angularfire2/database';
import { DatabaseSnapshotDoesNotExist, DatabaseSnapshotExists } from "angularfire2/database/interfaces";
import { AngularFireAction } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';

import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import filter from 'lodash/filter';
import isEmpty from 'lodash/isEmpty';
import findIndex from 'lodash/findIndex';
import find from 'lodash/find';

import { Schuetze } from "./entities/Schuetze";
import { Schuetzenfest } from "./entities/Schuetzenfest";
import { Resultat } from "./entities/Resultat";
import { Stich } from "./entities/Stich";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { ConnectableObservable } from "rxjs/observable/ConnectableObservable";

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


  private _online_schuetzenfeste : BehaviorSubject<Schuetzenfest[]>;
  private _local_schuetzenfeste : BehaviorSubject<Schuetzenfest[]>;
  get schuetzenfeste() : BehaviorSubject<Schuetzenfest[]> {
    return this._local_schuetzenfeste;
  }

  private _online_schuetzen : BehaviorSubject<Schuetze[]>;
  private _local_schuetzen : BehaviorSubject<Schuetze[]>;
  get schuetzen(): BehaviorSubject<Schuetze[]> {
    return this._local_schuetzen;
  }

  private _online_resultate : BehaviorSubject<Resultat[]>;
  private _local_resultate : BehaviorSubject<Resultat[]>;
  get resultate() : BehaviorSubject<Resultat[]> {
    return this._local_resultate;
  }

  private _online_stiche : BehaviorSubject<Stich[]>;
  private _local_stiche : BehaviorSubject<Stich[]>;
  get stiche() : BehaviorSubject<Stich[]> {
    return this._local_stiche;
  }

  public constructor(public afd: AngularFireDatabase) {
    this._fbRefSchuetzen = this.afd.list(FBREF_PATH_SCHUETZEN);
    this._fbRefSchuetzenfeste = this.afd.list(FBREF_PATH_SCHUETZENFESTE);
    this._fbRefResultate = this.afd.list(FBREF_PATH_RESULTATE);
    this._fbRefStiche = this.afd.list(FBREF_PATH_STICHE);

    const self = this;
    this._local_stiche = new BehaviorSubject<Stich[]>([]);
    this._online_stiche = new BehaviorSubject<Stich[]>([]);
    this._fbRefStiche.snapshotChanges().map(changes => {
      return changes.map(self.mapStichPayload);
    }).do(stL => {
      const val = this._online_stiche.value;
      val.push.apply(val, stL);
      this._online_stiche.next(val);
    });

    this._local_resultate = new BehaviorSubject<Resultat[]>([]);
    this._online_resultate = new BehaviorSubject<Resultat[]>([]);
    this._fbRefResultate.snapshotChanges().map(changes => {
      return changes.map(self.mapResultatPayload);
    }).do(rL => {
      const val = this._online_resultate.value;
      val.push.apply(val, rL);
      this._online_resultate.next(val);
    });

    this._local_schuetzenfeste = new BehaviorSubject<Schuetzenfest[]>([]);
    this._online_schuetzenfeste = new BehaviorSubject<Schuetzenfest[]>([]);
    this._fbRefSchuetzenfeste.snapshotChanges().map(changes => {
      return changes.map(self.mapSchuetzenfestPayload);
    }).do(sfL => {
      const val = this._online_schuetzenfeste.value;
      val.push.apply(val, sfL);
      this._online_schuetzenfeste.next(val);
    });

    this._local_schuetzen = new BehaviorSubject<Schuetze[]>([]);
    this._online_schuetzen = new BehaviorSubject<Schuetze[]>([]);
    this._fbRefSchuetzen.snapshotChanges().map(changes => {
      return changes.map(self.mapSchuetzePayload);
    }).do(sL => {
      const val = this._online_schuetzen.value;
      val.push.apply(val, sL);
      this._online_schuetzen.next(val);
    });

    this.batchResultat = this.batchResultat.bind(this);
    this.resultat = this.resultat.bind(this);
    this.batchStich = this.batchStich.bind(this);
    this.stich = this.stich.bind(this);

    this.mapSchuetzePayload = this.mapSchuetzePayload.bind(this);
    this.mapSchuetzenfestPayload = this.mapSchuetzenfestPayload.bind(this);
    this.mapResultatPayload = this.mapResultatPayload.bind(this);
    this.mapStichPayload = this.mapStichPayload.bind(this);

    this.getResultateBySchuetzeKey = this.getResultateBySchuetzeKey.bind(this);
    this.checkIfItemExists = this.checkIfItemExists.bind(this);
    this.getSticheBySchuetzenfestKey = this.getSticheBySchuetzenfestKey.bind(this);
  }

  private syncBatchStich(instances:Stich[], fbKeySchuetzenfest?:string) {
    for (let i = 0; i < instances.length; i++) {
      const instance = instances[i];
      const oIIndex = findIndex(this._online_resultate.value, (oI) => oI.key === instance.key);
      if (isEmpty(instance._fbKey)) {
        this.stich(instance, CRUD.PUSH);

      } else if (oIIndex < 0) {
        this.stich(instance, CRUD.DELETE);

      } else if (this._online_resultate.value[oIIndex].lastChanged.getTime() <= instance.lastChanged.getTime()) {
        this.stich(instance, CRUD.UPDATE);
      }
    }
  }

  private syncBatchResultat(instances:Resultat[], fbKeySchuetze?:string) {
    for (let i = 0; i < instances.length; i++) {
      const instance = instances[i];
      const oIIndex = findIndex(this._online_resultate.value, (oI) => oI.key === instance.key);
      if (isEmpty(instance._fbKey)) {
        this.resultat(instance, CRUD.PUSH);

      } else if (oIIndex < 0) {
        this.resultat(instance, CRUD.DELETE);

      } else if (this._online_resultate.value[oIIndex].lastChanged.getTime() <= instance.lastChanged.getTime()) {
        this.resultat(instance, CRUD.UPDATE);
      }
    }
  }

  public schuetze(instance: Schuetze|string, crudOp?: string): BehaviorSubject<Schuetze> {
    const self = this;

    const bhs : BehaviorSubject<Schuetzenfest> = new BehaviorSubject<Schuetzenfest>(new Schuetzenfest(true));
    let cobs : ConnectableObservable<Schuetzenfest>;

    const fbKey : string = (isObject(instance)) ? (instance as Schuetze)._fbKey : (instance as string);

    if (isEmpty(crudOp)) {
      if (isString(instance)) {
        crudOp = CRUD.GET;
      }
      if (isObject(instance) && !isEmpty((instance as Schuetze).key)) {
        crudOp = CRUD.UPDATE;
      }
      if (isObject(instance) && isEmpty((instance as Schuetze).key)) {
        crudOp = CRUD.PUSH;
      }
    }

    if (crudOp === CRUD.DELETE) {
      this._fbRefResultate.snapshotChanges().map(changes => {
        return changes
          .map(self.mapResultatPayload)
          .filter(r => r._fbSchuetzeKey === fbKey);
      }).do(rL => {
        this.batchResultat(rL, crudOp);
      });
    }
    if (!isString(instance) && crudOp !== CRUD.GET) {
      this.syncBatchResultat((instance as Schuetze).resultate.value, fbKey);
    }

    if(isObject(instance) && crudOp === undefined || crudOp === CRUD.UPDATE || crudOp === CRUD.PUSH) {
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
    const bhs : BehaviorSubject<Schuetzenfest> = new BehaviorSubject<Schuetzenfest>(new Schuetzenfest(true));
    let cobs : ConnectableObservable<Schuetzenfest>;

    const fbKey : string = (isObject(instance)) ? (instance as Schuetzenfest)._fbKey : (instance as string);
    const self = this;

    if (isEmpty(crudOp)) {
      if (isString(instance)) {
        crudOp = CRUD.GET;
      }
      if (isObject(instance) && !isEmpty((instance as Schuetzenfest).key)) {
        crudOp = CRUD.UPDATE;
      }
      if (isObject(instance) && isEmpty((instance as Schuetzenfest).key)) {
        crudOp = CRUD.PUSH;
      }
    }

    // wenn crudOp delete _> delete all

    if (crudOp === CRUD.DELETE) {
      this._fbRefStiche.snapshotChanges().map(changes => {
        return changes
          .map(self.mapStichPayload)
          .filter(st => st._fbSchuetzenfestKey === fbKey);
      }).do(stL => {
        this.batchStich(stL, crudOp);
      });
    }
    if (!isString(instance) && crudOp !== CRUD.GET) {
      this.syncBatchStich((instance as Schuetzenfest).stiche.value, fbKey);
    }

    if(typeof instance === 'object' && crudOp === undefined || crudOp === CRUD.UPDATE || crudOp === CRUD.PUSH) {

      cobs = Observable.fromPromise(this.checkIfItemExists(FBREF_PATH_SCHUETZENFESTE, fbKey).then(exists => {

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
      })).flatMap(o => { return o.first().map(s => s); }).publish();
    } else {
      if (crudOp === undefined || crudOp === CRUD.GET) {
        return self.getSchuetzenfestByKey(fbKey);
      } else if (crudOp === CRUD.DELETE) {
        cobs = this.getSchuetzenfestByKey(fbKey).first().map(sf => {
          self._fbRefSchuetzenfeste.remove(fbKey);
          return sf;
        }).publish();

      } else {
        console.error(new Error(`Tried to call FireBaseProvider#schuetzenfest with instance set to ${(typeof instance)} but expected \Object\<\Schuetzenfest\>, undefined or null and/or crud`));
        cobs = Observable.create(null).publish();
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
    const bhs : BehaviorSubject<Stich> = new BehaviorSubject<Stich>(new Stich(true));
    let cobs : ConnectableObservable<Stich>;

    const fbKey:string = (typeof instance === 'object') ? instance._fbKey : instance;
    const self = this;

    if(typeof instance === 'object' && crudOp === undefined || crudOp === CRUD.UPDATE || crudOp === CRUD.PUSH) {

      cobs = Observable.fromPromise(this.checkIfItemExists(FBREF_PATH_STICHE, fbKey).then(exists => {

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
          console.error(new Error(`Internal state error. Failed with CRUD ${crudOp} on ${exists ? 'existing ' : 'missing'} instance ${fbKey}`));
          return null;
        }
      })).flatMap(o => o.map(st => new Stich(st))).publish();

    } else {
      if (crudOp === undefined || crudOp === CRUD.GET) {
        cobs = self.getStichByKey(fbKey).publish();
      } else if (crudOp === CRUD.DELETE) {
        cobs = this.getStichByKey(fbKey).first().map(st => {
          self._fbRefStiche.remove(fbKey);
          return st;
        }).publish();
      } else {
        console.error(new Error(`Tried to call FireBaseProvider#stich with instance set to ${(typeof instance)} but expected \Object\<\Stich\>, undefined or null and/or crud`));
        cobs = Observable.create(null).publish();
      }
    }

    cobs.subscribe(v => bhs.next(v));
    cobs.connect();

    return bhs;
  }


  public batchResultat(instances: Resultat[]|string[], crudOp:string): BehaviorSubject<Resultat[]> {
    let bhs:BehaviorSubject<Resultat[]> = new BehaviorSubject<Resultat[]>([]);

    if (isString(instances[0])) {
      (instances as string[]).forEach(i => {
        if (isString(i)) {
          const cobs : ConnectableObservable<Resultat> = this.resultat(i, crudOp).publish();
          cobs.subscribe(r => {
            const val = bhs.value;
            val.push(r);
            bhs.next(val);
          });
          cobs.connect();
        }
      });

    } else {
      (instances as Resultat[]).forEach(i => {
        if (isObject(i)) {
          const cobs : ConnectableObservable<Resultat> = this.resultat(i, crudOp).publish();
          cobs.subscribe(r => {
            const val = bhs.value;
            val.push(r);
            bhs.next(val);
          });
          cobs.connect();
        }
      });
    }
    return bhs;
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

    let cobs : ConnectableObservable<Resultat>;

    if(typeof instance === 'object' && crudOp === undefined || crudOp === CRUD.UPDATE || crudOp === CRUD.PUSH) {

      cobs = Observable.fromPromise(this.checkIfItemExists(FBREF_PATH_RESULTATE, fbKey).then(exists => {
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
          return null;
        }
      })).flatMap(o => o.map(r => new Resultat(r))).publish();

    } else {
      if (crudOp === undefined || crudOp === CRUD.GET) {
        cobs = self.getResultatByKey(fbKey).publish();
      } else if (crudOp === CRUD.DELETE) {
        cobs = this.getResultatByKey(fbKey).first().map(r => {
          self._fbRefResultate.remove(fbKey);
          return r;
        }).publish();
      } else {
        console.error(new Error(`Tried to call FireBaseProvider#resultat with instance set to ${(typeof instance)} but expected \Object\<\Resultat\>, undefined or null and/or crud`));
        cobs = Observable.create(null).publish();
      }
    }

    cobs.subscribe((r) => bhs.next(new Resultat(r)));
    cobs.connect();

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
    return BehaviorSubject.create(this._local_stiche
      .map(stL =>
        stL.filter(st =>
          st._fbSchuetzenfestKey === schuetzenfestKey)));
  }

  public getResultateBySchuetzeKey(schuetzeKey: string): BehaviorSubject<Resultat[]> {
    return BehaviorSubject.create(this._local_resultate
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
