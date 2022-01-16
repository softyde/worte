import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {

  constructor(private _modal: ModalController) { }

  ngOnInit() {}

  public async dismiss() {
    await this._modal.dismiss();
  }

}
