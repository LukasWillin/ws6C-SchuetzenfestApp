import { Injectable } from '@angular/core';
import {AngularFireDatabase, DatabaseSnapshot} from 'angularfire2/database';
import { AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';

import isObject from 'lodash/isObject';
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

    this.crudBatchResultat = this.crudBatchResultat.bind(this);
    this.crudResultat = this.crudResultat.bind(this);
    this.mapSchuetzePayload = this.mapSchuetzePayload.bind(this);
    this.mapSchuetzenfestPayload = this.mapSchuetzenfestPayload.bind(this);
    this.getResultateBySchuetzeKey = this.getResultateBySchuetzeKey.bind(this);
    this.checkIfItemExists = this.checkIfItemExists.bind(this);
    this.getSticheBySchuetzenfestKey = this.getSticheBySchuetzenfestKey.bind(this);
  }


  public crudSchuetze(instance: Schuetze, schuetzenfestKey:string, crudOp?: string) {
    const fbKey:string = instance.key;

    this.crudBatchResultat(instance.resultate, "", fbKey, crudOp);

    if (crudOp === CRUD.DELETE) {
      this._fbRefSchuetzen.remove(fbKey);
    } else {
      if (crudOp === CRUD.PUSH || _.isEmpty(fbKey)) {
        this._fbRefSchuetzen.push(instance);
      }

      if (crudOp === CRUD.UPDATE || !_.isEmpty(fbKey)) {
        this._fbRefSchuetzen.update(fbKey, instance);
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
  public crudSchuetzenfest(instance: Schuetzenfest, crudOp?: string) {

    const fbKey:string = instance.key;

    if (crudOp === CRUD.DELETE) {
      this._fbRefSchuetzenfeste.remove(fbKey);
    } else {
      if (crudOp === CRUD.PUSH || _.isEmpty(fbKey)) {
        this._fbRefSchuetzenfeste.push(instance);
      }

      if (crudOp === CRUD.UPDATE || !_.isEmpty(fbKey)) {
        this._fbRefSchuetzenfeste.update(fbKey, instance);
      }
    }
  }

  public crudBatchStich(instances: Stich[]|string[], crudOp?:string) {
    (instances as Stich[]).forEach(i => this.crudStich(i, crudOp));
  }

  public crudStich(instance: Stich, schuetzenfestKey:string, crudOp?: string) {
    const fbKey:string = instance.key;

    instance._fbSchuetzenfestKey = schuetzenfestKey;

    this.getResultateByStichKey(fbKey).forEach(rL => this.crudBatchResultat(rL, fbKey, "", crudOp));

    if (crudOp === CRUD.DELETE) {
      this._fbRefStiche.remove(fbKey);
    } else {
      if (crudOp === CRUD.PUSH || _.isEmpty(fbKey)) {
        this._fbRefStiche.push(instance);
      }

      if (crudOp === CRUD.UPDATE || !_.isEmpty(fbKey)) {
        this._fbRefStiche.update(fbKey, instance);
      }
    }
  }

  public crudBatchResultat(instances: Resultat[], stichKey:string, schuetzeKey, crudOp?:string) {
    instances.forEach(i => this.crudResultat(i, schuetzeKey, crudOp));
  }

  /**
   * CRUD method to update, delete, get, push.
   * The `crudOp` parameter might only be necessary upon deletion.
   * @param {Resultat | string} instance - Either instance object or reference key.
   * @param {string} crudOp
   * @returns {Promise<Observable<Resultat>>}
   */
  public crudResultat(instance: Resultat, stichKey:string, schuetzeKey:string, crudOp?: string) {

    const fbKey:string = instance.key;

    if(!_.isEmpty(schuetzeKey)) instance._fbSchuetzeKey = schuetzeKey;

    if(!_.isEmpty(stichKey)) instance._fbStichKey = stichKey;

    if (crudOp === CRUD.DELETE) {
      this._fbRefResultate.remove(fbKey);
    } else {
      if (crudOp === CRUD.PUSH || _.isEmpty(fbKey)) {
        this._fbRefResultate.push(instance);
      }

      if (crudOp === CRUD.UPDATE || !_.isEmpty(fbKey)) {
        this._fbRefResultate.update(fbKey, instance);
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

  public getSchuetzenBySchuetzenfestKey(key:string) {
    if (!_.isEmpty(key)) {
      return this.schuetzen.map(sL => sL.filter(s => _.includes(s.schuetzenfestKeyList, key)));
    } else {
      console.warn("Faulty key in #getSchuetzenBySchuetzenfestKey");
      return Observable.create(null);
    }
  }

  public getSchuetzeByKey(key:string): Observable<Schuetze> {
    if (!_.isEmpty(key)) {
      return this.schuetzen
        .map(sL => {
          console.log(`get by key schuetze ${sL} ${key}`);
          return Observable.create(sL.find(s => s.key === key));
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
        .map(c => this.mapStichPayload(c.payload));
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

  public getResultateBySchuetzeAndSchuetzenfestKey(schuetzenfestKey:string, schuetzeKey:string) {
    if (!_.isEmpty(schuetzeKey) && !_.isEmpty(schuetzenfestKey)) {
      return this.getResultateBySchuetzeKey(schuetzeKey).map(rL => rL.filter(r => {
        r.stich._fbSchuetzenfestKey === schuetzenfestKey;
      }));
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

    console.debug(`Check 1 ${path}/${id} exists`);

    if (_.isEmpty(path)) {
      let err = new Error(`[IllegalArgumentException] path must be a string to check for existence of '${id}' but was '${path}'`);
      console.error(err);
      throw err;
    }

    console.debug(`Check 2 ${path}/${id} exists`);

    if (_.isEmpty(id)) {
      return Observable.create(false);
    }

    console.debug(`Check 3 ${path}/${id} exists`);

    return Observable.create(this.afd.object(`${path}/${id}`)
      .snapshotChanges()
      .map(c => c.payload.val() !== null));
  }
}
