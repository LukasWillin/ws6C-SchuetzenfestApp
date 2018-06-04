import { Injectable } from '@angular/core';
import {AngularFireDatabase, DatabaseSnapshot} from 'angularfire2/database';
import { AngularFireList } from 'angularfire2/database';
import { DatabaseSnapshotDoesNotExist, DatabaseSnapshotExists } from "angularfire2/database/interfaces";
import { AngularFireAction } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';

import isObject from 'lodash/isObject';
import filter from 'lodash/filter';
import _ from 'lodash';

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
      console.log("Pulled stiche from FBdb");
      return changes.map(c => self.mapStichPayload(c.payload));
    });
    this._resultate = this._fbRefResultate.snapshotChanges().map(changes => {
      return changes.map(c => self.mapResultatPayload(c.payload));
    });
    this._schuetzenfeste = this._fbRefSchuetzenfeste.snapshotChanges().map(changes => {
      return changes.map(c => self.mapSchuetzenfestPayload(c.payload));
    });
    this._schuetzen = this._fbRefSchuetzen.snapshotChanges().map(changes => {
      return changes.map(c => self.mapSchuetzePayload(c.payload));
    });

    // this.batchResultat = this.batchResultat.bind(this);
    // this.crudResultat = this.crudResultat.bind(this);
    this.mapSchuetzePayload = this.mapSchuetzePayload.bind(this);
    this.mapSchuetzenfestPayload = this.mapSchuetzenfestPayload.bind(this);
    this.getResultateBySchuetzeKey = this.getResultateBySchuetzeKey.bind(this);
    this.checkIfItemExists = this.checkIfItemExists.bind(this);
    this.getSticheBySchuetzenfestKey = this.getSticheBySchuetzenfestKey.bind(this);
  }


  public crudSchuetze(instance: Schuetze|string, crudOp?: string): Promise<Schuetze> {
    const self = this;

    const fbKey:string = (typeof instance === 'object') ? instance._fbKey : instance;

    /*let schuetze:Schuetze;
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
    }*/

    if(typeof instance === 'object' && crudOp === undefined || crudOp === CRUD.UPDATE || crudOp === CRUD.PUSH) {
      return this.checkIfItemExists(FBREF_PATH_SCHUETZEN, fbKey).then( exists => {
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
          return Promise.reject(new Error(`Internal state error. Failed with CRUD ${crudOp} on ${exists ? 'existing ' : 'missing'} instance ${fbKey}`));
        }
      });
    } else {
      if (crudOp === undefined || crudOp === CRUD.GET) {
        return self.getSchuetzeByKey(fbKey);
      } else if (crudOp === CRUD.DELETE) {
        return this.checkIfItemExists(FBREF_PATH_SCHUETZEN, fbKey).then( exists => {
          if (exists) {
            return self.getSchuetzeByKey(fbKey).then(s => {
              self._fbRefSchuetzen.remove(fbKey);
                return new Schuetze(s);
              });
          } else {
            return null;
          }
        });
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
  public crudSchuetzenfest(instance: Schuetzenfest|string, crudOp?: string): Promise<Schuetzenfest> {
    const fbKey:string = (typeof instance === 'object') ? instance._fbKey : instance;
    const self = this;

    if(typeof instance === 'object' && crudOp === undefined || crudOp === CRUD.UPDATE || crudOp === CRUD.PUSH) {

      let stichBatch: Stich[];
      let stichBatchKeys: string[];
      let schuetzenfest:Schuetzenfest;

      /*if (crudOp !== CRUD.GET) {
        if (typeof instance === 'object') schuetzenfest = instance;
        else this.getSchuetzenfestByKey(fbKey).then(s => schuetzenfest = s).unsubscribe();
        if(!schuetzenfest.stiche.isEmpty()) {
          schuetzenfest.stiche.subscribe(stL => {
            stL.forEach(r => {
              r._fbSchuetzenfestKey = fbKey;
            });
            stichBatch = stL;
            stichBatchKeys = stL.map(r => r._fbKey);
            // this.batchStich(stichBatch, crudOp).then(_ => {});
          })
            .unsubscribe();
        }
      }*/

      return this.checkIfItemExists(FBREF_PATH_SCHUETZENFESTE, fbKey).then(exists => {
        instance = new Schuetzenfest(instance);
        instance.stiche = null;

        if(exists && crudOp === undefined || exists && crudOp === CRUD.UPDATE) {

          return Promise.resolve(self._fbRefSchuetzenfeste.update(fbKey, instance).then(_ => {
            return self.getSchuetzenfestByKey(fbKey);
          }));

        } else if (!exists || !exists && crudOp === CRUD.PUSH) {
          return Promise.resolve(self._fbRefSchuetzenfeste.push(instance).once('value'))
            .then(item => {
              return self.getSchuetzenfestByKey(item.key);});

        } else {
          return Promise.reject(new Error(`Internal state error. Failed with CRUD ${crudOp} on ${exists ? 'existing ' : 'missing'} instance ${fbKey}`));
        }
      });
    } else {
      if (crudOp === undefined || crudOp === CRUD.GET) {
        return self.getSchuetzenfestByKey(fbKey);
      } else if (crudOp === CRUD.DELETE) {
        return this.getSchuetzenfestByKey(fbKey).then(sf => {
          self._fbRefSchuetzenfeste.remove(fbKey);
          return sf;
        });
      } else {
        return Observable.create(new Error(`Tried to call FireBaseProvider#schuetzenfest with instance set to ${(typeof instance)} but expected \Object\<\Schuetzenfest\>, undefined or null and/or crud`));
      }
    }
  }

  public crudBatchStich(instances: Stich[]|string[], crudOp:string) {
    const self = this;
    const result : Stich[] = [];
    if (typeof instances[0] === 'string') {
      (instances as string[]).map(() => {})
    } else {
      (instances as Stich[]).forEach(i => this.crudStich(i, crudOp).then(r => result.push(r)));
    }
  }

  public crudStich(instance: Stich|string, crudOp?: string): Promise<Stich> {
    const fbKey:string = (typeof instance === 'object') ? instance._fbKey : instance;
    const self = this;

    if(typeof instance === 'object' && crudOp === undefined || crudOp === CRUD.UPDATE || crudOp === CRUD.PUSH) {

      return this.checkIfItemExists(FBREF_PATH_STICHE, fbKey).then(exists => {

        instance = new Stich(instance);
        instance._field_schuetzenfest = null;

        if(exists && crudOp === undefined || exists && crudOp === CRUD.UPDATE) {
          return self._fbRefStiche.update(fbKey, instance).then(_ => {
            return Promise.resolve(self.getStichByKey(fbKey));
          });

        } else if (!exists || !exists && crudOp === CRUD.PUSH) {
          return Promise.resolve(self._fbRefStiche.push(instance).once('value'))
            .then(p => {
              return Promise.resolve(this.getStichByKey(p.key));
            });/*
            .then(st => {
              return Promise.resolve(this.getSchuetzenfestByKey(st._fbSchuetzenfestKey).then(sf => {
                st._field_schuetzenfest = sf;
                return Promise.resolve(st);
              }));
            });*/

        } else {
          return Promise.reject(new Error(`Internal state error. Failed with CRUD ${crudOp} on ${exists ? 'existing ' : 'missing'} instance ${fbKey}`));
        }
      });

    } else {
      if (crudOp === undefined || crudOp === CRUD.GET) {
        return self.getStichByKey(fbKey);
      } else if (crudOp === CRUD.DELETE) {
        return this.getStichByKey(fbKey).then(st => {
          return self._fbRefStiche.remove(fbKey).then(() => st );
        });
      } else {
        return Promise.reject(new Error(`Tried to call FireBaseProvider#stich with instance set to ${(typeof instance)} but expected \Object\<\Stich\>, undefined or null and/or crud`));
      }
    }
  }

  public crudBatchResultat(instances: Resultat[]|string[], crudOp:string) {
    const self = this;
    if (isObject(instances)) {
      (instances as Resultat[]).forEach(i => this.crudResultat(i, crudOp));
    } else {
      (instances as string[]).forEach(i => this.crudResultat(i, crudOp));
    }
  }

  /**
   * CRUD method to update, delete, get, push.
   * The `crudOp` parameter might only be necessary upon deletion.
   * @param {Resultat | string} instance - Either instance object or reference key.
   * @param {string} crudOp
   * @returns {Promise<Observable<Resultat>>}
   */
  public crudResultat(instance: Resultat|string, crudOp?: string): Promise<Resultat> {
    const fbKey:string = (typeof instance === 'object') ? instance._fbKey : instance;
    const self = this;
    if(typeof instance === 'object' && crudOp === undefined || crudOp === CRUD.UPDATE || crudOp === CRUD.PUSH) {

      return this.checkIfItemExists(FBREF_PATH_RESULTATE, fbKey).then(exists => {
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
        return self.getResultatByKey(fbKey);
      } else if (crudOp === CRUD.DELETE) {
        return this.getResultatByKey(fbKey).then(st => {
          return Promise.resolve(self._fbRefResultate.remove(fbKey).then(() => Promise.resolve(st) ));
        });
      } else {
        return Promise.reject(new Error(`Tried to call FireBaseProvider#resultat with instance set to ${(typeof instance)} but expected \Object\<\Resultat\>, undefined or null and/or crud`));
      }
    }
  }

  public getSticheBySchuetzeKey(key:string) : Promise<Stich[]> {
    if (!_.isEmpty(key)) {
      return this.getResultateBySchuetzeKey(key).then(rL => {
        return Promise.resolve(_.map(rL, r => (r as Resultat).stich));
      });
    } else {
      console.warn("Faulty key in #getSticheBySchuetzeKey");
      return Promise.resolve([]);
    }
  }

  public getResultateByStichKey(key:string) : Promise<Resultat[]> {
    if (!_.isEmpty(key)) {
      return this.resultate.first().map(rL => {
        return _.filter(rL, r => (r as Resultat)._fbStichKey === key);
      }).toPromise();
    } else {
      console.warn("Faulty key in #getResultateByStichKey");
      return Promise.resolve([]);
    }
  }

  public getSchuetzenfestByKey(key:string): Promise<Schuetzenfest> {
    if (!_.isEmpty(key)) {
      return this.afd.object(`${FBREF_PATH_SCHUETZENFESTE}/${key}`)
        .snapshotChanges()
        .first()
        .map(c => this.mapSchuetzenfestPayload((c as AngularFireAction<DatabaseSnapshot<Schuetzenfest>>).payload))
        .toPromise()
        .then(sf => {
          if (!_.isEmpty(sf)) {
            return Promise.resolve(
              this.stiche.last()
                .map(stL => {
                  return _.filter(stL, st => (st as Stich)._fbSchuetzenfestKey === sf.key);
                })
                .toPromise()
                .then(stL => {
                  sf.stiche = stL;
                  return Promise.resolve(sf);
                })
            );
          } else {
            return Promise.resolve(sf);
          }
        });
    } else {
      console.warn("Faulty key in #getSchuetzenfestByKey");
      return Promise.resolve(null);
    }
  }

  public getSchuetzeByKey(key:string): Promise<Schuetze> {
    if (!_.isEmpty(key)) {
      return this.afd.object<Schuetze>(`${FBREF_PATH_SCHUETZEN}/${key}`)
        .snapshotChanges()
        .map(c => this.mapSchuetzePayload((c as AngularFireAction<DatabaseSnapshot<Schuetze>>).payload))
        .toPromise();
    } else {
      console.warn("Faulty key in #getSchuetzeByKey");
      return Promise.resolve(null);
    }
  }

  public getStichByKey(key:string): Promise<Stich> {
    if (!_.isEmpty(key)) {
      return this.afd.object(`${FBREF_PATH_STICHE}/${key}`)
        .snapshotChanges()
        .first()
        .map(c => this.mapStichPayload((c as AngularFireAction<DatabaseSnapshot<Stich>>).payload))
        .toPromise()
        .then(st => {
          // console.log("st was " + st);
          if (!_.isEmpty(st) && !_.isEmpty(st._fbSchuetzenfestKey)) {
            return Promise.resolve(this.getSchuetzenfestByKey(st._fbSchuetzenfestKey).then(sf => {
              const index = _.findIndex(sf.stiche, stSf => stSf.key === st.key);
              if (index < 0) {
                sf.stiche.push(st);
                //this.crudSchuetzenfest(sf);
              }
              st._field_schuetzenfest = sf;
              return Promise.resolve(st);
            }));
          } else {
            return Promise.resolve(st);
          }
        });
    } else {
      console.warn("Faulty key in #getStichByKey");
      return Promise.resolve(null);
    }
  }

  public getResultatByKey(key:string): Promise<Resultat> {
    if (!_.isEmpty(key)) {
      return this.afd.object(`${FBREF_PATH_RESULTATE}/${key}`)
        .snapshotChanges()
        .last()
        .map(c => this.mapResultatPayload((c as AngularFireAction<DatabaseSnapshot<Resultat>>).payload))
        .toPromise();
    } else {
      console.warn("Faulty key in #getResultatByKey");
      return Promise.resolve(null);
    }
  }

  public getSticheBySchuetzenfestKey(schuetzenfestKey:string) : Promise<Stich[]> {
    if (_.isEmpty(schuetzenfestKey)) {
      return this.stiche
        .last()
        .map(stL =>
          stL.filter(st =>
            st._fbSchuetzenfestKey === schuetzenfestKey))
        .toPromise();
    } else {
      console.warn("Faulty key in #getSticheBySchuetzenfestKey");
      return Promise.resolve([]);
    }
  }

  public getResultateBySchuetzeKey(schuetzeKey:string): Promise<Resultat[]> {
    if (!_.isEmpty(schuetzeKey)) {
      return this._resultate
        .last()
        .map(rL => rL.filter(r => r._fbSchuetzeKey === schuetzeKey))
        .toPromise();
    } else {
      console.warn("Faulty key in #getResultateBySchuetzeKey");
      return Promise.resolve([]);
    }
  }

  private mapStichPayload(c:DatabaseSnapshot<Stich>|DatabaseSnapshotExists<Stich>|DatabaseSnapshotDoesNotExist<Stich>) : Stich {
    const st = c.val();
    if (isObject(st)) {
      st._fbKey = c.key;
      return new Stich(st);
    } else {
      console.warn("A given key was probably faulty or not existing in firebase");
      return st;
    }
  }

  private mapResultatPayload(c:DatabaseSnapshot<Resultat>|DatabaseSnapshotExists<Resultat>|DatabaseSnapshotDoesNotExist<Resultat>) : Resultat {
    const r = c.val();
    if (isObject(r)) {
      r._fbKey = c.key;
      return new Resultat(r)
    } else {
      console.warn("A given key was probably faulty or not existing in firebase");
      return r;
    }
  }

  private mapSchuetzenfestPayload(c:DatabaseSnapshot<Schuetzenfest>|DatabaseSnapshotExists<Schuetzenfest>|DatabaseSnapshotDoesNotExist<Schuetzenfest>) : Schuetzenfest {
    const sf = c.val();
    if (isObject(sf)) {
      sf._fbKey = c.key;
      return new Schuetzenfest(sf);
    } else {
      console.warn("A given key was probably faulty or not existing in firebase");
      return sf;
    }
  }

  private mapSchuetzePayload(c:DatabaseSnapshot<Schuetze>|DatabaseSnapshotExists<Schuetze>|DatabaseSnapshotDoesNotExist<Schuetze>) : Schuetze {
    const s = c.val();
    if (isObject(s)) {
      s._fbKey = c.key;
      return new Schuetze(s);
    } else {
      console.warn("A given key was probably faulty or not existing in firebase");
      return s;
    }
  }

  private checkIfItemExists(path:string, id:string) : Promise<boolean> {
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
