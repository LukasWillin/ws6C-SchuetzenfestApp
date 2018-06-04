import { Injectable } from '@angular/core';
import {AngularFireDatabase, DatabaseSnapshot} from 'angularfire2/database';
import { AngularFireList } from 'angularfire2/database';
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

export class CRUD {
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
        return changes.map(c => this.mapStichPayload(c.payload));
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


  public crudSchuetze(instance: Schuetze|string, crudOp?: string): Observable<Schuetze> {
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
          if (s.resultate && !_.isEmpty(s.resultate)) {
            schuetze.resultate.forEach(r => {
              r._fbSchuetzeKey = fbKey;
            });
            this.crudBatchResultat(schuetze.resultate);
          }
        })
      }
    }

    if(typeof instance === 'object' && crudOp === undefined || crudOp === CRUD.UPDATE || crudOp === CRUD.PUSH) {
      return this.checkIfItemExists(FBREF_PATH_SCHUETZEN, fbKey).map( exists => {

        instance = new Schuetze(instance);
        instance.resultate = null;

        if (exists && crudOp === undefined || crudOp === CRUD.UPDATE) {
          return Observable.create(self._fbRefSchuetzen.update(fbKey, instance).then(_ => {
            return self.getSchuetzeByKey(fbKey);
          }));

        } else if (!exists || !exists && crudOp === CRUD.PUSH) {
          return Observable.create(self._fbRefSchuetzen.push(instance).once('value').then(item => {
            return Observable.create(self.getSchuetzeByKey(item.key));
          }));

        } else {
          return Observable.create(new Error(`Internal state error. Failed with CRUD ${crudOp} on ${exists ? 'existing ' : 'missing'} instance ${fbKey}`));
        }
      });
    } else {
      if (crudOp === undefined || crudOp === CRUD.GET) {

        return self.getSchuetzeByKey(fbKey);

      } else if (crudOp === CRUD.DELETE) {

        return Observable.create(this.checkIfItemExists(FBREF_PATH_SCHUETZEN, fbKey).map( exists => {
          if (exists) {
            return self.getSchuetzeByKey(fbKey).map(s => {
                self._fbRefSchuetzen.remove(fbKey);
                return new Schuetze(s);
              });
          } else {
            return null;
          }
        }));
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
  public crudSchuetzenfest(instance: Schuetzenfest|string, crudOp?: string): Observable<Schuetzenfest> {
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

      return this.checkIfItemExists(FBREF_PATH_SCHUETZENFESTE, fbKey).map(exists => {
        instance = new Schuetzenfest(instance);
        instance.stiche = null;

        if(exists && crudOp === undefined || exists && crudOp === CRUD.UPDATE) {

          return Observable.create(self._fbRefSchuetzenfeste.update(fbKey, instance).then(_ => {
            return self.getSchuetzenfestByKey(fbKey);
          }));

        } else if (!exists || !exists && crudOp === CRUD.PUSH) {
          return Observable.create(self._fbRefSchuetzenfeste.push(instance).once('value'))
            .then(item => {
              return self.getSchuetzenfestByKey(item.key);});

        } else {
          return Observable.create(new Error(`Internal state error. Failed with CRUD ${crudOp} on ${exists ? 'existing ' : 'missing'} instance ${fbKey}`));
        }
      });
    } else {
      if (crudOp === undefined || crudOp === CRUD.GET) {
        return self.getSchuetzenfestByKey(fbKey);
      } else if (crudOp === CRUD.DELETE) {
        return this.getSchuetzenfestByKey(fbKey).map(sf => {
          self._fbRefSchuetzenfeste.remove(fbKey);
          return sf;
        });
      } else {
        return Observable.create(new Error(`Tried to call FireBaseProvider#schuetzenfest with instance set to ${(typeof instance)} but expected \Object\<\Schuetzenfest\>, undefined or null and/or crud`));
      }
    }
  }

  public crudBatchStich(instances: Stich[]|string[], crudOp?:string) {
    const self = this;
    if (typeof instances[0] === 'string') {
      (instances as string[]).map(() => {})
    } else {
      (instances as Stich[]).forEach(i => this.crudStich(i, crudOp));
    }
  }

  public crudStich(instance: Stich|string, crudOp?: string): Observable<Stich> {
    const fbKey:string = (typeof instance === 'object') ? instance._fbKey : instance;
    const self = this;

    if(typeof instance === 'object' && crudOp === undefined || crudOp === CRUD.UPDATE || crudOp === CRUD.PUSH) {

      return this.checkIfItemExists(FBREF_PATH_STICHE, fbKey).map(exists => {

        instance = new Stich(instance);
        instance._field_schuetzenfest = null;

        if(exists && crudOp === undefined || exists && crudOp === CRUD.UPDATE) {
          return Observable.create(self._fbRefStiche.update(fbKey, instance).then(_ => {
            return self.getStichByKey(fbKey);
          }));

        } else if (!exists || !exists && crudOp === CRUD.PUSH) {
          return Observable.create(self._fbRefStiche.push(instance)
            .then(p => {
              return this.getStichByKey(p.key).map(st => {
                return this.getSchuetzenfestByKey(st._fbSchuetzenfestKey)
                  .map(sf => {
                    st._field_schuetzenfest = sf;
                    return st;
                  });
              });
            }));

        } else {
          return Observable.create(new Error(`Internal state error. Failed with CRUD ${crudOp} on ${exists ? 'existing ' : 'missing'} instance ${fbKey}`));
        }
      });

    } else {
      if (crudOp === undefined || crudOp === CRUD.GET) {
        return self.getStichByKey(fbKey);
      } else if (crudOp === CRUD.DELETE) {
        return this.getStichByKey(fbKey).map(st => {
          return Observable.create(self._fbRefStiche.remove(fbKey).then(() => st ));
        });
      } else {
        return Observable.create(new Error(`Tried to call FireBaseProvider#stich with instance set to ${(typeof instance)} but expected \Object\<\Stich\>, undefined or null and/or crud`));
      }
    }
  }

  public crudBatchResultat(instances: Resultat[]|string[], crudOp?:string) {
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
  public crudResultat(instance: Resultat|string, crudOp?: string): Observable<Resultat> {
    const fbKey:string = (typeof instance === 'object') ? instance._fbKey : instance;
    const self = this;
    if(typeof instance === 'object' && crudOp === undefined || crudOp === CRUD.UPDATE || crudOp === CRUD.PUSH) {

      return this.checkIfItemExists(FBREF_PATH_RESULTATE, fbKey).map(exists => {

        instance = new Resultat(instance);
        instance._field_stich = null;

        if(exists && crudOp === undefined || exists && crudOp === CRUD.UPDATE) {
          return Observable.create(self._fbRefResultate.update(fbKey, instance).then(_ => {
            return self.getResultatByKey(fbKey);
          }));

        } else if (!exists || !exists && crudOp === CRUD.PUSH) {
          return Observable.create(self._fbRefResultate.push(instance).once('value').then(item => {
            return self.getResultatByKey(item.key);
          }));

        } else {
          return Observable.create(new Error(`Internal state error. Failed with CRUD ${crudOp} on ${exists ? 'existing ' : 'missing'} instance ${fbKey}`));
        }
      });
    } else {
      if (crudOp === undefined || crudOp === CRUD.GET) {
        return self.getResultatByKey(fbKey);
      } else if (crudOp === CRUD.DELETE) {
        return this.getResultatByKey(fbKey).map(st => {
          return Observable.create(self._fbRefResultate.remove(fbKey).then(() => Observable.create(st) ));
        });
      } else {
        return Observable.create(new Error(`Tried to call FireBaseProvider#resultat with instance set to ${(typeof instance)} but expected \Object\<\Resultat\>, undefined or null and/or crud`));
      }
    }
  }

  public getSticheBySchuetzeKey(key:string) : Observable<Stich[]> {
    if (!_.isEmpty(key)) {
      return this.getResultateBySchuetzeKey(key).map(rL => {
        return _.map(rL, r => (r as Resultat).stich);
      });
    } else {
      console.warn("Faulty key in #getSticheBySchuetzeKey");
      return Observable.create([]);
    }
  }

  public getResultateByStichKey(key:string) : Observable<Resultat[]> {
    if (!_.isEmpty(key)) {
      return this.resultate.map(rL => {
        return _.filter(rL, r => (r as Resultat)._fbStichKey === key);
      });
    } else {
      console.warn("Faulty key in #getResultateByStichKey");
      return Observable.create([]);
    }
  }

  public getSchuetzenfestByKey(key:string): Observable<Schuetzenfest> {
    if (!_.isEmpty(key)) {
      return this.afd.object(`${FBREF_PATH_SCHUETZENFESTE}/${key}`)
        .snapshotChanges()
        .map(c => this.mapSchuetzenfestPayload(c.payload))
        .map(sf => {
          if (!_.isEmpty(sf)) {
            return Observable.create(this.stiche.map(stL => {
                  return _.filter(stL, st => (st as Stich)._fbSchuetzenfestKey === sf.key);
                })
                .map(stL => {
                  sf.stiche = stL;
                  return sf;
                }));
          } else {
            return sf;
          }
        });
    } else {
      console.warn("Faulty key in #getSchuetzenfestByKey");
      return Observable.create(null);
    }
  }

  public getSchuetzeByKey(key:string): Observable<Schuetze> {
    if (!_.isEmpty(key)) {
      return this.schuetzen
        .map(sL => {
          return sL.find(s => s.key === key);
        });
    } else {
      console.warn("Faulty key in #getSchuetzeByKey");
      return Observable.create(null);
    }
  }

  public getStichByKey(key:string): Observable<Stich> {
    if (!_.isEmpty(key)) {
      return this.afd.object(`${FBREF_PATH_STICHE}/${key}`)
        .snapshotChanges()
        .map(c => this.mapStichPayload(c.payload))
        .map(st => {
          if (!_.isEmpty(st) && !_.isEmpty(st._fbSchuetzenfestKey)) {
            return Observable.create(this.getSchuetzenfestByKey(st._fbSchuetzenfestKey).map(sf => {
              const index = _.findIndex(sf.stiche, stSf => stSf.key === st.key);
              if (index < 0) {
                sf.stiche.push(st);
                this.crudSchuetzenfest(sf);
              }
              st._field_schuetzenfest = sf;
              return st;
            }));
          } else {
            return st;
          }
        });
    } else {
      console.warn("Faulty key in #getStichByKey");
      return Observable.create(null);
    }
  }

  public getResultatByKey(key:string): Observable<Resultat> {
    if (!_.isEmpty(key)) {
      return this.afd.object(`${FBREF_PATH_RESULTATE}/${key}`)
        .snapshotChanges()
        .map(c => this.mapResultatPayload(c.payload))
        .map(r => {
          return Observable.create(this.getStichByKey(r._fbStichKey).map(st => {
            r._field_stich = st;
            return r;
          }));
        });
    } else {
      console.warn("Faulty key in #getResultatByKey");
      return Observable.create(null);
    }
  }

  public getSticheBySchuetzenfestKey(schuetzenfestKey:string) : Observable<Stich[]> {
    if (_.isEmpty(schuetzenfestKey)) {
      return this.stiche
        .map(stL =>
          stL.filter(st =>
            st._fbSchuetzenfestKey === schuetzenfestKey));
    } else {
      console.warn("Faulty key in #getSticheBySchuetzenfestKey");
      return Observable.create([]);
    }
  }

  public getResultateBySchuetzeKey(schuetzeKey:string): Observable<Resultat[]> {
    if (!_.isEmpty(schuetzeKey)) {
      return this._resultate
        .map(rL => rL.filter(r => r._fbSchuetzeKey === schuetzeKey));
    } else {
      console.warn("Faulty key in #getResultateBySchuetzeKey");
      return Observable.create([]);
    }
  }

  private mapStichPayload(c:DatabaseSnapshot) : Stich {
    const st = c.val();
    if (isObject(st)) {
      st._fbKey = c.key;
      return new Stich(st);
    } else {
      console.warn("A given key was probably faulty or not existing in firebase");
      return st;
    }
  }

  private mapResultatPayload(c:DatabaseSnapshot) : Resultat {
    const r = c.val();
    if (isObject(r)) {
      r._fbKey = c.key;
      return new Resultat(r)
    } else {
      console.warn("A given key was probably faulty or not existing in firebase");
      return r;
    }
  }

  private mapSchuetzenfestPayload(c:DatabaseSnapshot) : Schuetzenfest {
    const sf = c.val();
    if (isObject(sf)) {
      sf._fbKey = c.key;
      return new Schuetzenfest(sf);
    } else {
      console.warn("A given key was probably faulty or not existing in firebase");
      return sf;
    }
  }

  private mapSchuetzePayload(c:DatabaseSnapshot) : Schuetze {
    const s = c.val();
    if (isObject(s)) {
      s._fbKey = c.key;
      return new Schuetze(s);
    } else {
      console.warn("A given key was probably faulty or not existing in firebase");
      return s;
    }
  }

  private checkIfItemExists(path:string, id:string) : Observable<boolean> {
    if (!path) {
      let err = new Error(`[IllegalArgumentException] path must be a string to check for existence of '${id}' but was '${path}'`);
      console.error(err);
      throw err;
    }

    if (!id) return Observable.create(false);

    return this.afd.object(`${path}/${id}`)
      .snapshotChanges()
      .map(c => c.payload.val() !== null);
  }
}
