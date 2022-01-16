import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';

import { StatisticComponent } from '../components/statistic/statistic.component';
import { GameComponent } from '../components/game/game.component';
import { AboutComponent } from '../components/about/about.component';
import { RulesComponent } from '../components/rules/rules.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,

    HomePageRoutingModule,
  ],
  declarations: [HomePage, StatisticComponent, AboutComponent, GameComponent, RulesComponent]
})
export class HomePageModule {}
