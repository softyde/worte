import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {

  public version: string = '0';

  constructor(private _modal: ModalController, private _appVersion: AppVersion) { 

    _appVersion.getVersionNumber().then(value => {
      this.version = value;
    })
  }

  ngOnInit() {}

  public async dismiss() {
    await this._modal.dismiss();
  }

}
