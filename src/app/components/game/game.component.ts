import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {

  constructor(private _modal: ModalController) { }

  ngOnInit() {}

  public async dismiss() {
    await this._modal.dismiss();
  }

}
