import { Injectable, ɵbypassSanitizationTrustResourceUrl } from '@angular/core';

import { Storage } from '@ionic/storage';

import { HTTP } from '@awesome-cordova-plugins/http/ngx';

import { Badge } from '@awesome-cordova-plugins/badge/ngx';

export interface Settings {
  firstRun: boolean;

  liste_id: number;
  wort_id: number;
  wort: string;
  finished: boolean;
  text_1: string;
  worte: string[];
  aktives_wort: number;
}
 
export interface StatisticData {

  words: number;
  currentStreak: number;
  longestStreak: number;

  tries: number[];
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private _liste: string[];
  
  constructor(private _storage: Storage, private _http: HTTP, private _badge: Badge) { 
  }

  public async init() {

    this._liste = JSON.parse(await this._storage.get('liste') ?? '[]');

    console.log(`${this._liste.length} words loaded`);
  }

  public isValid(word: string): boolean {

    for(let i = 0; i < this._liste.length; i++) {
      if (word == this._liste[i]) return true;
    }

    return false;
  }

  /**
   * Zeigt an, dass das aktuelle Rätsel beendet wurde oder noch keines ermittelt werden konnte.
   */
  public async isFinished(): Promise<boolean> {
    return (await this.getSettings()).finished;
  }

  public async getSettings(): Promise<Settings> {
    
    let current_settings = JSON.parse(await this._storage.get('settings') ?? JSON.stringify({
      'liste_id': 0,
      'wort_id': 0,
      'wort': '',
      'finished': true,
      'firstRun': true,
      'text_1': 'Ein Spiel mit Worten',
      'worte': ['', '', '', '', '', ''],
      'aktives_wort': 0,
    }));

    return current_settings;
  }

  public async getStatistics(): Promise<StatisticData> {

    let current_statistics = JSON.parse(await this._storage.get('statistics') ?? JSON.stringify({ 
      words: 0, 
      currentStreak: 0, 
      longestStreak: 0, 
      tries: [0, 0, 0, 0, 0, 0] 
    }));

    return current_statistics;
  }

  public async updateWinStatistics(tries: number) {

    let current_statistics = await this.getStatistics();

    current_statistics.words += 1;
    current_statistics.tries[tries] += 1;
    current_statistics.currentStreak += 1;
    if(current_statistics.currentStreak > current_statistics.longestStreak) {
      current_statistics.longestStreak = current_statistics.currentStreak;
    }

    await this._storage.set('statistics', JSON.stringify(current_statistics));
  }

  public async updateLooseStatistics() {

    let current_statistics = await this.getStatistics();

    current_statistics.currentStreak = 0;

    await this._storage.set('statistics', JSON.stringify(current_statistics));
  }


  public async setSettings(settings: Settings) {

    await this._storage.set('settings', JSON.stringify(settings));
  }

  public async load(): Promise<boolean> {

    try {

      let currentSetings = await this.getSettings();

      console.log(`looking for new word (${currentSetings.wort_id})`);


      let url = 'FIXMEFORPRODUCTION';
      let header = {'x-none': 'fixme'};

      let result = await this._http.get(url,  
        {}, header);

      if (result.status !== 200) {
        return false;
      }

      let data = JSON.parse(result.data);

      if (data.liste_id > currentSetings.liste_id) {

        await this._storage.set('liste', JSON.stringify(data.liste));
        this._liste = data.liste;
        
        currentSetings.liste_id = data.liste_id;

        await this.setSettings(currentSetings);

        console.log(`retrieved new wordlist(${data.liste_id}): ${data.liste.length} items`);
      }

      if (data.wort_id > currentSetings.wort_id) {

        console.log(`new word received (${data.wort_id})`);

        currentSetings.wort_id = data.wort_id;
        currentSetings.wort = data.wort;
        currentSetings.text_1 = data.text_1;
        currentSetings.finished = false;
        currentSetings.worte = ['', '', '', '', '', ''];
        currentSetings.aktives_wort = 0;

        this.setSettings(currentSetings);

        return true;
      }

      return false;
    }
    catch(error) {

      console.log(error);

      return false;
    };
  }

}
