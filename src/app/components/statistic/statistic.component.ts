import { Component, OnInit } from '@angular/core';
import { StorageService, StatisticData } from '../../services/storage.service';

@Component({
  selector: 'statistic',
  templateUrl: './statistic.component.html',
  styleUrls: ['./statistic.component.scss'],
})
export class StatisticComponent implements OnInit {

  public data: StatisticData

  constructor(private _storage: StorageService) { 

    this.data = {
      words: 0,
      currentStreak: 0,
      longestStreak: 0,
      tries: [0, 0, 0, 0, 0, 0],
    };
  }

  async ngOnInit() {
    this.data = await this._storage.getStatistics();
  }

  async ionViewDidEnter() {
    this.data = await this._storage.getStatistics();
  }

  public getLength(tryIndex: number): string {

    let sum = this.data.tries.reduce((a, b) => a + b);

    if (sum === 0) return '0%';

    let v = this.data.tries[tryIndex] / sum * 100;

    return v + '%';
  }


}
