import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';


import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(public storage: Storage) {}

  async ngOnInit() {

    console.log('yeah');
    await this.storage.defineDriver(CordovaSQLiteDriver);
    await this.storage.create();

    console.log('storage created');

  } 
}
