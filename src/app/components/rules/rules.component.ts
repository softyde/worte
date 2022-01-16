import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss'],
})
export class RulesComponent implements OnInit {

  constructor(private _modal: ModalController) { }

  ngOnInit() {}

  public async dismiss() {
    await this._modal.dismiss();
  }

}
