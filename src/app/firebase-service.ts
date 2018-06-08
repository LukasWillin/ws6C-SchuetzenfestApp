import { Injectable } from '@angular/core';
import { AngularFireDatabase, DatabaseSnapshot } from 'angularfire2/database';
import { AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';

import isObject from 'lodash/isObject';
import _ from 'lodash';

import { Schuetze } from "./entities/Schuetze";
import { Schuetzenfest } from "./entities/Schuetzenfest";
import { Resultat } from "./entities/Resultat";
import { Stich } from "./entities/Stich";
import { Abonnement } from "./Abonnement";

const FBREF_PATH_SCHUETZEN = '/schuetzen';
const FBREF_PATH_SCHUETZENFESTE = '/schuetzenfeste';
const FBREF_PATH_RESULTATE = '/resultate';
const FBREF_PATH_STICHE = '/stiche';

const STR_DELETE = 'delete';
const STR_UPDATE = 'update';
const STR_PUSH = 'push';

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
}

@Injectable()
export class FirebaseServiceProvider {

  private _fbRefSchuetzenfeste:AngularFireList<Schuetzenfest>;
  private _fbRefSchuetzen:AngularFireList<Schuetze>;
  private _fbRefResultate:AngularFireList<Resultat>;
  private _fbRefStiche:AngularFireList<Stich>;

  private _schuetzenfeste: Schuetzenfest[] = [];
  get schuetzenfeste(): Schuetzenfest[] {
    return this._schuetzenfeste;
  }
  private _schuetzen: Schuetze[] = [];
  get schuetzen(): Schuetze[] {
    return this._schuetzen;
  }
  private _resultate: Resultat[] = [];
  get resultate(): Resultat[] {
    return this._resultate;
  }
  private _stiche: Stich[] = [];
  get stiche(): Stich[] {
    return this._stiche;
  }

  private _schuetzenfesteAbo : Abonnement<Schuetzenfest[]>;
  get schuetzenfesteAbo(): Abonnement<Schuetzenfest[]> {
    return this._schuetzenfesteAbo;
  }
  private _schuetzenAbo : Abonnement<Schuetze[]>;
  get schuetzenAbo() : Abonnement<Schuetze[]> {
    return this._schuetzenAbo;
  }
  private _sticheAbo : Abonnement<Stich[]>;
  get sticheAbo() : Abonnement<Stich[]> {
    return this._sticheAbo;
  }
  private _resultateAbo : Abonnement<Resultat[]>;
  get resultateAbo() : Abonnement<Resultat[]> {
    return this._resultateAbo;
  }

  public constructor(public afd: AngularFireDatabase) {
    this._fbRefSchuetzen = this.afd.list(FBREF_PATH_SCHUETZEN);
    this._fbRefSchuetzenfeste = this.afd.list(FBREF_PATH_SCHUETZENFESTE);
    this._fbRefResultate = this.afd.list(FBREF_PATH_RESULTATE);
    this._fbRefStiche = this.afd.list(FBREF_PATH_STICHE);

    this._sticheAbo = new Abonnement<Stich[]>(function publisher(resolve, stL) {
      if (stL) {
        resolve(stL);
      } else {
        resolve(stL, 250);
      }
    }.bind(this), [], 100);

    this._resultateAbo = new Abonnement<Resultat[]>(function publisher(resolve, rL) {
      rL = this._resultate;
      if (rL) {
        for (let i = 0; i < rL.length; i++) {
          let r = rL[i];
          r._field_stich = _.find(this._stiche, st => st.key === r._fbStichKey);
        }
        resolve(rL);
      } else {
        resolve(rL, 250);
      }
    }.bind(this), [], 100);

    this._sticheAbo.subscribe(
      "providers/firebase-service/resultateAbo"
      ,this._resultateAbo.publishNewIssue
      ,undefined
      ,true
    );

    this._schuetzenfesteAbo = new Abonnement<Schuetzenfest[]>(function publisher(resolve, sfL) {
      if (sfL) {
        resolve(sfL);
      } else {
        resolve(sfL, 250);
      }
    }.bind(this), [], 100);

    this._schuetzenAbo = new Abonnement<Schuetze[]>(function publisher(resolve, sL) {
      sL = this._schuetzen;
      if (sL) {
        for (let i = 0; i < sL.length; i++) {
          let s : Schuetze = sL[i];
          s._field_resultate = _.filter(this._resultate, r => r._fbSchuetzeKey === s.key);
        }
        resolve(sL);
      } else {
        resolve(sL, 250);
      }
    }.bind(this), [], 100);

    this._resultateAbo.subscribe(
      "providers/firebase-service/schuetzeAbo"
      , this._schuetzenAbo.publishNewIssue
      ,undefined
      ,true
    );

    this._fbRefStiche.snapshotChanges().map(changes => {
        return changes.map(c => this.mapStichPayload(c.payload));
      })
      .subscribe(stL => {
        this._stiche = stL;
        this.sticheAbo.publishNewIssue(stL);
      });
    this._fbRefResultate.snapshotChanges()
      .map(changes => {
        return changes.map(c => this.mapResultatPayload(c.payload));
      })
      .subscribe(rL => {
        this._resultate = rL;
        this.resultateAbo.publishNewIssue(rL);
      });
    this._fbRefSchuetzenfeste.snapshotChanges().map(changes => {
        return changes.map(c => this.mapSchuetzenfestPayload(c.payload));
      })
      .subscribe(sfL => {
        this._schuetzenfeste = sfL;
        this.schuetzenfesteAbo.publishNewIssue(sfL);
      });
    this._fbRefSchuetzen.snapshotChanges().map(changes => {
        return changes.map(c => this.mapSchuetzePayload(c.payload));
      })
      .subscribe(sL => {
        this._schuetzen = sL;
        this.schuetzenAbo.publishNewIssue(sL);
      });

    this.crudBatchResultat = this.crudBatchResultat.bind(this);
    this.crudResultat = this.crudResultat.bind(this);
    this.mapSchuetzePayload = this.mapSchuetzePayload.bind(this);
    this.mapSchuetzenfestPayload = this.mapSchuetzenfestPayload.bind(this);
    this.checkIfItemExists = this.checkIfItemExists.bind(this);
  }

  /**
   * CRUD method to update, delete, push.
   * The `crudOp` parameter might only be necessary upon deletion.
   * @param {Schuetzenfest} instance - A Schuetzenfest instance object.

   * @param {Schuetze} instance - A Schuetze instance object.
   * @param {string} schuetzenfestKey - Key of another associated Schuetzenfest.
   *    If you don't want to add any association pass an empty string("").
   * @param {string} crudOp (optional) - The CRUD operation.
   */
  public crudSchuetze(instance: Schuetze, schuetzenfestKey:string, crudOp?: string) {
    let fbKey:string = instance.key;
    if (_.isUndefined(crudOp)) crudOp = _.isEmpty(fbKey) ? CRUD.PUSH : CRUD.UPDATE;

    if (!_.isEmpty(schuetzenfestKey) && !_.includes(instance._fb_list_schuetzenfestKey, schuetzenfestKey)) {
      instance._fb_list_schuetzenfestKey.push(schuetzenfestKey);
      this.updateLastChanged(FBREF_PATH_SCHUETZENFESTE, schuetzenfestKey);
    }

    const resultate = instance.resultate;
    if (_.isUndefined(resultate))
      throw new Error(`Property Resultate on Schuetze is required`);
    if (crudOp !== CRUD.PUSH)
      this.crudBatchResultat(resultate, "", fbKey, crudOp);
    instance._field_resultate = null;

    if (crudOp === CRUD.DELETE) {
      this._fbRefSchuetzen.remove(fbKey);
    } else {
      if (crudOp === CRUD.PUSH || _.isEmpty(fbKey)) {
        this._fbRefSchuetzen.push(instance).then(s => {
          fbKey = s.key;
          this.crudBatchResultat(resultate, "", fbKey, crudOp);
        });
      }

      if (crudOp === CRUD.UPDATE || !_.isEmpty(fbKey)) {
        this._fbRefSchuetzen.update(fbKey, instance);
      }
    }
  }

  /**
   * CRUD method to update, delete, push.
   * The `crudOp` parameter might only be necessary upon deletion.
   * @param {Schuetzenfest} instance - A Schuetzenfest instance object.
   * @param {string} crudOp (optional) - The CRUD operation.
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

  public crudBatchStich(instances: Stich[], schuetzenfestKey:string, crudOp?:string) {
    (instances as Stich[]).forEach(i => this.crudStich(i, schuetzenfestKey, crudOp));
  }

  /**
   * CRUD method to update, delete, push.
   * The `crudOp` parameter might only be necessary upon deletion.
   * @param {Stich} instance - A Stich instance object.
   * @param {string} schuetzenfestKey - Key of associated Schuetzenfest.
   *    If you dont want to alter Schuetzenfest pass an empty string("").
   * @param {string} crudOp (optional) - The CRUD operation.
   */
  public crudStich(instance: Stich, schuetzenfestKey:string, crudOp?: string) {
    const fbKey:string = instance.key;

    instance._fbSchuetzenfestKey = schuetzenfestKey;

    this.updateLastChanged(FBREF_PATH_SCHUETZENFESTE, instance._fbSchuetzenfestKey);

    if (crudOp === CRUD.DELETE) {
      this._fbRefStiche.remove(fbKey);
      this.getResultateAboByStichKey(fbKey)
        .subscribe("providers/firebase-service/crudStich/crudBatchResultat"
          , rL => this.crudBatchResultat(rL, fbKey, "", crudOp)
          , 1
          , true);
    } else {
      if (crudOp === CRUD.PUSH || _.isEmpty(fbKey)) {
        this._fbRefStiche.push(instance);
      }

      if (crudOp === CRUD.UPDATE || !_.isEmpty(fbKey)) {
        this._fbRefStiche.update(fbKey, instance);
      }
    }
  }

  /**
   * CRUD method to update, delete, push.
   * The `crudOp` parameter might only be necessary upon deletion.
   * @param {Resultat[]} instance - One or more Resultat instances.
   * @param {string} stichKey - Key of associated Stich.
   *    If you dont want to alter the Stich pass an empty string("").
   * @param {string} schuetzeKey - Key of owning Schuetze.
   *    If you dont want to alter Schuetze pass an empty string("").
   * @param {string} crudOp (optional) - The CRUD operation.
   */
  public crudBatchResultat(instances: Resultat[], stichKey:string, schuetzeKey:string, crudOp?:string) {
    instances.forEach(i => this.crudResultat(i, stichKey, schuetzeKey, crudOp));
  }

  /**
   * CRUD method to update, delete, push.
   * The `crudOp` parameter might only be necessary upon deletion.
   * Make sure there is at least an existing association to a Schuetze.
   * Otherwise this Resultat will be deleted.
   * @param {Resultat} instance - A Resultat instance object.
   * @param {string} stichKey - Key of associated Stich.
   *    If you dont want to alter associated Stich pass an empty string("").
   * @param {string} schuetzeKey - Key of Schuetze.
   *    If you dont want to alter associated Schuetze pass an empty string("").
   * @param {string} crudOp optional - The CRUD operation.
   */
  public crudResultat(instance: Resultat, stichKey:string, schuetzeKey:string, crudOp?: string) {

    const fbKey:string = instance.key;
    if (_.isEmpty(schuetzeKey)) {
      schuetzeKey = instance._fbSchuetzeKey;
    } else {
      instance._fbSchuetzeKey = schuetzeKey;
    }

    // Try to find an association to a Schuetze
    // IF you cant find any do DELETE or we pollute the db.
    if (_.isEmpty(schuetzeKey)) {
      console.error(new Error(`The Resultat(${instance}) could not be associated to a Schuetze and will be removed. schuetzeKey was ${schuetzeKey}@CRUD.${crudOp}`));
      this._fbRefResultate.remove(fbKey);
      return;
    } else {
      this.updateLastChanged(FBREF_PATH_SCHUETZEN, schuetzeKey);
    }

    if (_.isEmpty(stichKey) && isObject(instance._field_stich)) stichKey = instance._field_stich.key;
    if (!_.isEmpty(stichKey)) instance._fbStichKey = stichKey;
    instance._field_stich = null;


    if (crudOp === CRUD.PUSH || _.isEmpty(fbKey)) {
      this._fbRefResultate.push(instance);
    }
    if (crudOp === CRUD.UPDATE || !_.isEmpty(fbKey)) {
      this._fbRefResultate.update(fbKey, instance);
    }
  }

  public getSticheAboBySchuetzeKey(key:string) : Abonnement<Stich[]> {
    if (!_.isEmpty(key)) {
      let abo = new Abonnement<Stich[]>((function publisher(resolve, rL) {
        if (rL) {
          resolve(_.map(rL, r => (r as Resultat).stich));
        } else {
          resolve(rL, 250);
        }
      }).bind(this), [], 100);

      abo.ownSubscription = this.getResultateAboBySchuetzeKey(key).subscribe(
        `providers/firebase-service/sticheBySchuetzeKey/${key}`
        , abo.publishNewIssue
        , undefined
        , true);

      return abo;
    } else {
      console.error(new Error(`Faulty key(${key}) in #getSticheBySchuetzeKey`));
    }
  }

  public getResultateAboByStichKey(key:string) : Abonnement<Resultat[]> {
    if (!_.isEmpty(key)) {
      let abo = new Abonnement<Resultat[]>(function publisher(resolve, rL) {
        if (rL) {
          resolve(_.filter(rL, r => (r as Resultat)._fbStichKey === key));
        } else {
          resolve(rL, 250);
        }
      }.bind(this), [], 100);

      abo.ownSubscription = this.resultateAbo.subscribe(
        `providers/firebase-service/resultateByStichKey/${key}`
        , abo.publishNewIssue
        , undefined
        , true);

      return abo;
    } else {
      console.error(new Error(`Faulty key(${key}) in #getResultateByStichKey`));
    }
  }

  public getSchuetzenfestByKey(key:string): Abonnement<Schuetzenfest> {
    if (!_.isEmpty(key)) {
      let abo = new Abonnement<Schuetzenfest>(function publisher(resolve, sfL) {
        if (sfL) {
          resolve(_.find(sfL, sf => sf.key === key));
        } else {
          resolve(sfL, 250);
        }
      }.bind(this), [], 100);

      abo.ownSubscription = this.schuetzenfesteAbo.subscribe(
        `providers/firebase-service/schuetzenfestByKey/${key}`
        , abo.publishNewIssue
        , undefined
        , true);

      return abo;
    } else {
      console.error(new Error(`Faulty key(${key}) in #getSchuetzenfestByKey`));
    }
  }

  public getSchuetzenAboBySchuetzenfestKey(key:string) : Abonnement<Schuetze[]> {
    if (!_.isEmpty(key)) {
      let abo = new Abonnement<Schuetze[]>(
        function publisher(resolve, sL) {
          if (sL) {
            resolve(_.filter(sL, s => _.includes((s as Schuetze).schuetzenfestKeyList, key)));
          } else {
            resolve(sL, 250);
          }
        }.bind(this)
        ,[]
        ,100);

      abo.ownSubscription = this.schuetzenAbo.subscribe(
        `providers/firebase-service/schuetzenBySchuetzenfestKey/${key}`
        , abo.publishNewIssue
        ,undefined
        ,true);

      return abo;
    } else {
      console.error(new Error(`Faulty key(${key}) in #getSchuetzenBySchuetzenfestKey`));
    }
  }

  public getSchuetzeAboByKey(key:string): Abonnement<Schuetze> {
    if (!_.isEmpty(key)) {
      let abo = new Abonnement<Schuetze>(function publisher(resolve, sL) {
        if (sL) {
          resolve(_.find(sL, s => s.key === key));
        } else {
          resolve(sL, 250);
        }
      }.bind(this), [], 100);

      abo.ownSubscription = this.schuetzenAbo.subscribe(
        `providers/firebase-service/schuetzeByKey/${key}`
        , abo.publishNewIssue
        , undefined
        , true);

      return abo;
    } else {
      console.error(new Error(`Faulty key(${key}) in #getSchuetzeByKey`));
    }
  }

  public getStichByKey(key:string): Abonnement<Stich> {
    if (!_.isEmpty(key)) {
      let abo = new Abonnement<Stich>(function publisher(resolve, stL) {
        if (stL) {
          resolve(_.find(stL, st => st.key === key));
        } else {
          resolve(stL, 250);
        }
      }.bind(this), [], 100);

      abo.ownSubscription = this.schuetzenAbo.subscribe(
        `providers/firebase-service/stichByKey/${key}`
        , abo.publishNewIssue
        , undefined
        , true);

      return abo;
    } else {
      console.error(new Error(`Faulty key(${key}) in #getStichByKey`));
    }
  }

  /*public getResultatByKey(key:string): Observable<Resultat> {
    if (!_.isEmpty(key)) {
      /*return this.afd.object(`${FBREF_PATH_RESULTATE}/${key}`)
        .snapshotChanges()
        .map(c => this.mapResultatPayload(c.payload))
        .map(r => {
          return Observable.create(this.getStichByKey(r._fbStichKey).map(st => {
            r._field_stich = st;
            return r;
          }));
        });
    } else {
      console.error(new Error(`Faulty key(${key}) in #getResultatByKey`));
    }
  }*/

  public getSticheAboBySchuetzenfestKey(schuetzenfestKey:string) : Abonnement<Stich[]> {
    if (!_.isEmpty(schuetzenfestKey)) {
      let abo = new Abonnement<Stich[]>(function publisher(resolve, stL) {
        if (stL) {
          resolve(stL.filter(st => st._fbSchuetzenfestKey === schuetzenfestKey));
        } else {
          resolve(stL, 250);
        }
      }.bind(this), [], 100);

      abo.ownSubscription = this.sticheAbo.subscribe(
        `providers/firebase-service/stichBySchuetzenfestKey/${schuetzenfestKey}`
        , abo.publishNewIssue
        , undefined
        , true);

      return abo;
    } else {
      console.error(new Error(`Faulty key(${schuetzenfestKey}) in #getSticheBySchuetzenfestKey`));
    }
  }

  public getResultateAboBySchuetzeKey(schuetzeKey:string): Abonnement<Resultat[]> {
    if (!_.isEmpty(schuetzeKey)) {
      let abo = new Abonnement<Resultat[]>(function publisher(resolve, rL) {
        if (rL) {
          resolve(_.filter(rL, r => r._fbSchuetzeKey === schuetzeKey));
        } else {
          resolve(rL, 250);
        }
      }.bind(this), [], 100);

      abo.ownSubscription = this.resultateAbo.subscribe(
        `providers/firebase-service/resultateBySchuetzeKey/${schuetzeKey}`
        , abo.publishNewIssue
        , undefined
        , true);

      return abo;
    } else {
      console.error(new Error(`Faulty key(${schuetzeKey}) in #getResultateBySchuetzeKey`));
    }
  }

  public getResultateAboBySchuetzeAndSchuetzenfestKey(schuetzenfestKey:string, schuetzeKey:string) {
    if (!_.isEmpty(schuetzeKey) && !_.isEmpty(schuetzenfestKey)) {
      let abo = new Abonnement<Resultat[]>(function publisher(resolve, rL) {
        if (rL) {
          resolve(rL.filter(r =>
            r.stich._fbSchuetzenfestKey === schuetzenfestKey
          ));
        } else {
          resolve(rL, 250);
        }
      }.bind(this), [], 100);

      abo.ownSubscription = this.getResultateAboBySchuetzeKey(schuetzeKey).subscribe(
        `providers/firebase-service/resultateBySchuetzeAndSchuetzenfestKey/${schuetzeKey}${schuetzenfestKey}`
        , abo.publishNewIssue
        , undefined
        , true);

      return abo;
    } else {
      console.error(new Error(`Faulty keys(schuetzenfestKey:${schuetzenfestKey}, schuetzeKey:${schuetzeKey}) in #getResultateBySchuetzeKey`));
    }
  }

  private mapStichPayload(c:DatabaseSnapshot) : Stich {
    const st = c.val();
    if (isObject(st)) {
      st._fbKey = c.key;
      return new Stich(st);
    } else {
      console.error(new Error("A given key was probably faulty or not existing in firebase"));
      return st;
    }
  }

  private mapResultatPayload(c:DatabaseSnapshot) : Resultat {
    const r = c.val();
    if (isObject(r)) {
      r._fbKey = c.key;
      return new Resultat(r);
    } else {
      console.error(new Error("A given key was probably faulty or not existing in firebase"));
      return r;
    }
  }

  private mapSchuetzenfestPayload(c:DatabaseSnapshot) : Schuetzenfest {
    const sf = c.val();
    if (isObject(sf)) {
      sf._fbKey = c.key;
      return new Schuetzenfest(sf);
    } else {
      console.error(new Error("A given key was probably faulty or not existing in firebase"));
      return sf;
    }
  }

  private mapSchuetzePayload(c:DatabaseSnapshot) : Schuetze {
    const s = c.val();
    if (isObject(s)) {
      s._fbKey = c.key;
      return new Schuetze(s);
    } else {
      console.error(new Error("A given key was probably faulty or not existing in firebase"));
      return s;
    }
  }

  private updateLastChanged(path:string, id:string) {
    /*return this.afd.object(`${path}/${id}`)
      .snapshotChanges()
      .toPromise()
      .then(c => {
        const payload = c.payload;
        let mappedPayload: Schuetze | Schuetzenfest | Resultat | Stich;
        switch (path) {
          case FBREF_PATH_STICHE:
            this.crudStich(this.mapStichPayload(payload), "", CRUD.UPDATE);
            break;
          case FBREF_PATH_SCHUETZEN:
            this.crudSchuetze(this.mapSchuetzePayload(payload), "", CRUD.UPDATE);
            break;
          case FBREF_PATH_RESULTATE:
            this.crudResultat(this.mapResultatPayload(payload), "", "", CRUD.UPDATE);
            break;
          case FBREF_PATH_SCHUETZENFESTE:
            this.crudSchuetzenfest(this.mapSchuetzenfestPayload(payload), CRUD.UPDATE);
            break;
          default:
            throw new Error(`Given path(${path}) must be one of ${FBREF_PATH_STICHE}${FBREF_PATH_SCHUETZEN}${FBREF_PATH_RESULTATE}${FBREF_PATH_SCHUETZENFESTE}`);
        }
      });*/
  }


  private checkIfItemExists(path:string, id:string) : Observable<boolean> {

    console.debug(`Check 1 ${path}/${id} exists`);

    if (_.isEmpty(path)) {
      let err = new Error(`[IllegalArgumentException] path must be a string to check for existence of '${id}' but was '${path}'`);
      console.error(err);
      throw err;
    }

    return Observable.create(this.afd.object(`${path}/${id}`)
      .snapshotChanges()
      .map(c => c.payload.val() !== null && !_.isEmpty(id)));
  }
}
