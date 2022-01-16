import { Component, NgZone } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { Platform, ToastController, ModalController } from '@ionic/angular';
import { AboutComponent } from '../components/about/about.component';
import { GameComponent } from '../components/game/game.component';
import { RulesComponent } from '../components/rules/rules.component';

import { Badge } from '@awesome-cordova-plugins/badge/ngx';



import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';

enum WordResult {
  InProgress,
  Guessed,
  Failed
}


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  private static readonly _refreshIntervalMs = 1000 * 60 * 10;

  private _words: string[] = ['', '', '', '', '', ''];

  private _status: number[][] =  [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
  private _invalid: boolean[] = [false, false, false, false, false, false];

  private _targetWord = 'worte';
  
  private _activeWord: number = 0;

  private _invalidTimeoutHandle = null;

  private _reloadTimerHandle = null;

  public finished: boolean = true;

  public showSuccessMessage: boolean = false;
  public showFailureMessage: boolean = false;

  public title: string = 'Ein Spiel mit Wörtern';

  private _keys = [['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'ü'], ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä'], ['y', 'x', 'c', 'v', 'b', 'n', 'm', 'back', 'enter']];

  constructor(public storage: StorageService, private _platform: Platform, 
    private _zone: NgZone, private _modal: ModalController,
    private _toast: ToastController,
    private _badge: Badge
    ) {
    
    this._platform.ready().then(() => {

      if (this._platform.is('cordova')) {

        console.log('cordova');

        //Subscribe on pause i.e. background
        this._platform.pause.subscribe(() => {
          
          if(this._reloadTimerHandle !== null) {
            clearInterval(this._reloadTimerHandle);
            this._reloadTimerHandle = null;

            console.log('timer cleared');
          }

        });

        //Subscribe on resume i.e. foreground 
        this._platform.resume.subscribe(() => {
          
          if(this._reloadTimerHandle === null) {
            this._reloadTimerHandle = setInterval(() => { this.onTimer(); }, HomePage._refreshIntervalMs);
            console.log('timer set');
          }

          this._zone.run(async () => {
        
            if(await this._badge.hasPermission()) {
              await this._badge.clear();
            } 
          });

          this.onTimer();

        });
       }
    });
  }

  async onTimer() {

    console.log('timer function called');

    let newDataAvailable = await this.storage.load();

    if(newDataAvailable) {
      this._zone.run(async () => {
        

          if(await this._badge.hasPermission()) {
            console.log('setting App Badge');
            await this._badge.set(1);
          } else {
            console.log('no permission for App Badge');
          }

          const toast = await this._toast.create({
            message: 'Ein neues Wort!',
            duration: 2000
          });
          await toast.present();

          await this.loadNewData();
        
    });
    }
  }

  async ngOnInit() {

    console.log('lade daten');

    await this.storage.init();

    this.finished = await this.storage.isFinished();

    console.log('timer set');
    this._reloadTimerHandle = setInterval(() => { this.onTimer(); }, HomePage._refreshIntervalMs);

    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        // Show some error
      }
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived',
      async (notification: PushNotificationSchema) => {

        console.log(notification);

        await this.onTimer();
      }
    );

  }

  async ionViewDidEnter() {

    console.log('ionViewDidEnter()');

    await this.storage.load();
    await this.loadNewData();

    let settings = await this.storage.getSettings();
    if(settings.firstRun !== false) {

      settings.firstRun = false;
      await this.storage.setSettings(settings);

      this.openRules();
    }
  }

  async ionViewDidLeave() {

    console.log('ionViewDidLeave()');

  // clearInterval(this._reloadTimerHandle);

  }

  async loadNewData() {

    console.log('loadNewData');

    const settings = await this.storage.getSettings();

    this.title = settings.text_1;

    this._targetWord = settings.wort;
    this._activeWord = settings.aktives_wort;
    this._words = settings.worte;
    
    for(let i = 0; i < 6; i++) {
      this.calcStatus(i);
    }

    this.clearInvalidWords();
    this.finished = settings.finished;
    this.showSuccessMessage = false; 
    this.showFailureMessage = false;
  }

  private setCharAt(str: string,index: number,chr: string) {
    if(index > str.length-1) return str;
    return str.substring(0,index) + chr + str.substring(index+1);
  }

  public getKeys() {
    return this._keys;
  }

  public getTarget(): string {
    return this._targetWord;
  }

  public isInvalidWord(word: number): boolean {
    return this._invalid[word];
  }

  private clearInvalidWords() {

    if (this._invalidTimeoutHandle) {
      clearTimeout(this._invalidTimeoutHandle);
      this._invalidTimeoutHandle = null;
    }

    for(let i = 0; i < 6; i++) {
      this._invalid[i] = false;
    }
  }

  private setInvalid(word: number) {
    this._invalid[word] = true;


    this._invalidTimeoutHandle = setTimeout(() => { this.clearInvalidWords(); this._invalidTimeoutHandle = null; }, 3000);
  }

  public isActiveCell(word: number, char: number): boolean {
    
    if (word !== this._activeWord) return false;
    
    return char === this._words[this._activeWord].length;
  }

  public isUsedChar(word: number, char: number): boolean {

    if (this._words[word].length === 0) return false;

    if (this.finished) return true;

    return this._words[word].charAt(char) !== '';
  }

  public isFullWord(word: number): boolean {

    return this.finished || this._activeWord > word;
  }


  public getContent(word: number, char: number): string {

    let a = this._words[word].charAt(char); 

    return a;
  }

  public getStatus(word: number, char: number): number {

    if (word >= this._activeWord && !this.finished) return 0;

    return this._status[word][char];
  }

  public createRange(number: Number) {
    return new Array(number);
  }

  private calcStatus(wordIndex: number) {

    let word = this._words[wordIndex];
    let target = this._targetWord;

    if (word === target) {
      for(let i = 0; i < 5; i++) {
        this._status[wordIndex][i] = 3;
      }

      return;
    }


    for(let i = 0; i < 5; i++) {

      if (target.charAt(i) === word.charAt(i)) {
        this._status[wordIndex][i] = 2;
        target = this.setCharAt(target, i, '.');
      } else {
        this._status[wordIndex][i] = 0;
      }
    }

    for(let i = 0; i < 5; i++) {

      if(this._status[wordIndex][i] == 2) continue;

      let c = word.charAt(i);

      if (c === '') {
        this._status[wordIndex][i] = 9;
      } else {
        let index = target.indexOf(c);
        if (index >= 0) {
          this._status[wordIndex][i] = 1;
          target = this.setCharAt(target, index, '.');
        }
      }
    }
  }

  private async enterWord(): Promise<WordResult> {

    let result = WordResult.InProgress;

    let word = this._words[this._activeWord];

    if (word.length !== 5) return WordResult.InProgress;

    if (!this.storage.isValid(word)) {
      this.setInvalid(this._activeWord);
      return WordResult.InProgress;
    }

    this.calcStatus(this._activeWord);
    
    if (word === this._targetWord) {

      await this.storage.updateWinStatistics(this._activeWord);
      this.finished = true;
      result = WordResult.Guessed;
    }

    if (this._activeWord < 5) {
      this._activeWord += 1;
    } else if (result !== WordResult.Guessed) {

      await this.storage.updateLooseStatistics();
      this.finished = true;
      result = WordResult.Failed;

    }

    return result;
  }

  public async enterKey(key: string) {

    if (this.finished) return;

    this.clearInvalidWords();
    
    if (key === 'back') {
    
      if (this._words[this._activeWord].length > 0) {
        this._words[this._activeWord] = this._words[this._activeWord].slice(0, -1);
      }
    } else if ((key === 'enter') && (this._words[this._activeWord].length === 5)) {

      let result = await this.enterWord();
      if(result === WordResult.Guessed) {
        this.showSuccessMessage = true;
      } else if(result === WordResult.Failed) {
        this.showFailureMessage = true;
      }

    } else {

      if (this._words[this._activeWord].length >= 5) return;
     
      this._words[this._activeWord] += key;
    }

    let settings = await this.storage.getSettings();
    settings.finished = this.finished;
    settings.worte = this._words;
    settings.aktives_wort = this._activeWord;
    await this.storage.setSettings(settings);
  }

  public isActiveKey(key: string): boolean {

    if (key === 'back') {
      return (this._words[this._activeWord].length > 0);
    }

    if (key === 'enter') {
      return (this._words[this._activeWord].length === 5);
    }

    return (this._words[this._activeWord].length < 5);;
  }
  
  public async openAbout() {

    console.log('open about');

    const modal = await this._modal.create({
      component: AboutComponent,
      initialBreakpoint: 0.5,
      breakpoints: [0, 0.5, 1]
    });

    await modal.present();
  }

  public async openGame() {

    console.log('open game');

    const modal = await this._modal.create({
      component: GameComponent,
      initialBreakpoint: 0.75,
      breakpoints: [0, 0.75]
    });

    await modal.present();
  }


  public async openRules() {

    console.log('open rules');

    const modal = await this._modal.create({
      component: RulesComponent,
      initialBreakpoint: 0.5,
      breakpoints: [0, 0.5, 1]
    });

    await modal.present();
  }
}
