
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';

const GROUP_PATH_SEPERATOR : string = "/";

export class AboSubscription {
  private id : string;
  private group : string;
  public _unsubscribe : Function;
  public _unsubscribeAllInGroupWithId : Function;
  public onUnsubscribe : Function;

  /**
   * @NOTE: FOR INTERNAL USE ONLY. Use static #subscribeTo if you want to create a new subscription from outside.
   * Creates a new Abonnement subscription.
   * The subscriptions can be postponed for passed subscriber by calling #unsubscribe
   * or for one or many subscribers within same group and or with id by calling
   * #unsubscribeAllInGroup or #unsubscribeAllInGroupWithId respectively.
   * @param {Function} subscriber - The subscriber of the abonnement.
   */
  constructor(private subscriber/*:Function*/) {
    let groupThenId = (subscriber.groupThenId as string);
    let lastIndexOfSeperator = groupThenId.lastIndexOf(GROUP_PATH_SEPERATOR);
    if (lastIndexOfSeperator >= 0) {
      this.id = groupThenId.slice(groupThenId.lastIndexOf(GROUP_PATH_SEPERATOR) + 1);
      this.group = groupThenId.slice(0, groupThenId.lastIndexOf(GROUP_PATH_SEPERATOR) + 1);
    } else {
      this.id = groupThenId;
    }
  }

  /**
   * Creates a new Abonnement subscription.
   * The subscriptions can be postponed for passed subscriber by calling #unsubscribe
   * or for one or many subscribers within same group and or with id by calling
   * #unsubscribeAllInGroup or #unsubscribeAllInGroupWithId respectively.
   * @param {Abonnement} abo - The desired Abonnement instance.
   * @param {string} groupThenId - A group then id path. E.g. "pages/schuetzenfest/ds4321" or just "ds4321".
   * @param {Function} subscriber - The subscriber of the abonnement.
   * @param {number} numberOfIssues (optional) - A max. amount of issues this subscriber will receive.
   *    When remaining issues count reaches 0 it will automatically be unsubscribed.
   *    If set to `undefined` the subscriber will be subscribed indefinitely.
   * @param {boolean} immediately (optional) - Get the latest published issue immediately.
   *    Be aware that an early subscriber might get `undefined` as value.
   *    In such a case (or any other he does not want to accept - and where subscriber has defined a limited number of issues) the
   *    subscriber can increment its remainingIssues by one.
   *      mySubscriber.remainingIssues++ or mySubscriber.remainingIssues += 1;
   *    To be able to do this the subscriber should be a named anonymous function.
   *
   * @returns {AboSubscription}
   */
  public static subscribeTo(abo:Abonnement<any>, groupThenId:string, subscriber/*:Function*/, numberOfIssues?:number, immediately?:boolean) {
    return abo.subscribe(groupThenId, subscriber, numberOfIssues, immediately);
  }

  public unsubscribe() {
   if (this.onUnsubscribe) {
     this.onUnsubscribe(this.id);
   }
   this._unsubscribe(this.subscriber);
  }

  public unsubscribeAllInGroup() {
    this._unsubscribeAllInGroupWithId(this.group);
  }

  public unsubscribeAllInGroupWithId() {
    this._unsubscribeAllInGroupWithId(this.group, this.id);
  }
}

export class Abonnement<T> {

  private delayedPublication : number;
  private subscribers : Object = {};
  private previousIssue : T;
  public ownSubscription : AboSubscription;

  /**
   * Create an Abonnement instance.
   * Use Abonnement#publishNewIssue method to explicitly trigger a new publish.
   * The publishNewIssue method can also be used to handle events and subscribe to other types like Promise or Observables.
   *
   * @param {Function} publisher - Pass a function generating a new issue and/or mutating the input `fromValue` in #publishNewIssue.
   *    You might as well set this parameter to `undefined` to pass `fromValue` directly to all subscribers.
   *    A publisher must call the passed resolve function. If he wants to delay publishing his work he can invoke
   *    resolve with a second argument `delay`.
   * @param {any} initialIssue - This can be used set an initial issue for early subscribers opting to be immediately notified.
   * @param {number} debounceByMilliseconds - Will debounce #publishNewIssue by `debounceByMilliseconds`.
   *    But only if specified. See 'https://lodash.com/docs/4.17.10#debounce' for further documentation.
   * @param {object} debounceOptions - Will apply these `debounceOptions` to the debounce of #publishNewIssue.
   *    But only when `debounceByMilliseconds` has been sepcified.
   */
  constructor(private publisher:Function, initialIssue?:any, debounceByMilliseconds?:number, debounceOptions?:any) {
    this.previousIssue = initialIssue;
    this.publishNewIssue =this.publishNewIssue.bind(this);
    if (debounceByMilliseconds !== undefined) {
      this.publishNewIssue = debounce(this.publishNewIssue
        , debounceByMilliseconds
        , (debounceOptions) ? debounceOptions : {leading:false, trailing:true});
    }
    this.resolve = this.resolve.bind(this);
    this.unsubscribeAllInGroupWithId = this.unsubscribeAllInGroupWithId.bind(this);
    this.removeIssueFrom = this.removeIssueFrom.bind(this);
    this.notifySubscriber = this.notifySubscriber.bind(this);
  }

  /**
   * Subscribe to published issues.
   * @param {string} groupThenId - A path string with group and id.
   *    E.g. "pages/schuetzenfest/ab1234" or just an id "ab1234".
   *    The only character which is required to separate groups and id is the forward slash "/".
   *    This can be later used to remove all subscribers within the same subgroup via the
   *    explicit method AboSubscription#unsubscribeAllInGroup.
   * @param subscriber - The subscriber function/lambda. Use a named anonymous function to
   *    manage remaining issues (see numberOfIssues).
   * @param {number} numberOfIssues (optional) - The number of issues the subscriber will receive.
   *    When remaining issues count reaches 0 it will automatically be unsubscribed.
   *    If set to `undefined` the subscriber will be subscribed indefinitely.
   * @param {boolean} immediately (optional) - Get the latest published issue immediately.
   *    Be aware that an early subscriber might get `undefined` as value.
   *    In such a case (and where subscriber has defined a limited number of issues) the
   *    subscriber can increment its remainingIssues by one.
   *      mySubscriber.remainingIssues += 1;
   */
  public subscribe(groupThenId:string, subscriber/*:Function*/, numberOfIssues?:number, immediately?:boolean) {
    subscriber.groupThenId = groupThenId;
    subscriber.remainingIssues = numberOfIssues;
    this.subscribers[groupThenId] = subscriber;
    if(immediately) {
      this.notifySubscriber(subscriber, this.previousIssue)
    }
    let subscription = new AboSubscription(subscriber);
    subscription._unsubscribe = this.unsubscribe;
    subscription._unsubscribeAllInGroupWithId = this.unsubscribeAllInGroupWithId;
    return subscription;
  }

  /**
   * Unsubscribes all other subscribers in specified group and/or with id.
   * @param {string} group - A group path.
   * @param {string} id (optional) - Id of subscriber(s).
   */
  public unsubscribeAllInGroupWithId(group:string, id?:string) {
    for (let groupThenId in this.subscribers) {
      let subscriber = this.subscribers[groupThenId];
      if ((subscriber.groupThenId as string).includes(GROUP_PATH_SEPERATOR)
        && (subscriber.groupThenId as string).startsWith(group)) {
        if (id !== undefined && id !== "") {
          if (subscriber.groupThenId.endsWith(id))
            this.unsubscribe(subscriber);
        } else {
          this.unsubscribe(subscriber);
        }
      }
    }
  }

  /**
   * Unsubscribes the given subscriber.
   * @param subscriber - The subscriber function instance.
   */
  public unsubscribe(subscriber/*:Function*/) {
    subscriber.remainingIssues = 0;
  }

  /**
   * Publishes a new issue from `fromValue`.
   * The publish might not be immediately if either the method is debounced or
   * the publisher opts to delay his work.
   * @param fromValue - A value which can be mutated or ignored by a set publisher.
   */
  public publishNewIssue(fromValue?:any) {
    if (this.publisher !== undefined) {
      clearTimeout(this.delayedPublication);
      this.delayedPublication = undefined;
      this.publisher(this.resolve, fromValue);
    } else {
      this.release(fromValue);
    }
  }

  private resolve(newIssue:T, delay?:number) {
    if(delay !== undefined && delay >= 0) {
      this.delayedPublication = setTimeout(() => this.publishNewIssue(newIssue), delay);
    } else {
      this.release(newIssue);
    }
  }

  private release(newIssue:any) {
    for (let groupThenId in this.subscribers) {
      let subscriber = this.subscribers[groupThenId];
      this.notifySubscriber(subscriber, newIssue);
    }
    this.previousIssue = newIssue;
  }

  private notifySubscriber(subscriber/*:Function*/, newIssue:T) {
    if (subscriber.remainingIssues === undefined || subscriber.remainingIssues > 0) {
      subscriber(newIssue);
    }
    this.removeIssueFrom(subscriber);
  }

  private removeIssueFrom(subscriber/*:Function*/) {
    if (subscriber.remainingIssues !== undefined) {
      subscriber.remainingIssues -= 1;
      if (subscriber.remainingIssues <= 0) {
        delete this.subscribers[subscriber.groupThenId];
      }
    }
    if (isEmpty(this.subscribers) && !isEmpty(this.ownSubscription)) {
      this.ownSubscription.unsubscribe();
    }
  }
}
