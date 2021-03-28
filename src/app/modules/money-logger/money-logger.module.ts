import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MoneyLoggerRoutingModule } from './money-logger-routing.module';
import { StartPageComponent } from './components/start-page/start-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { TodayLoggerComponent } from './components/today-logger/today-logger.component';


@NgModule({
  declarations: [StartPageComponent, TodayLoggerComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MoneyLoggerRoutingModule,
    SharedModule
  ]
})
export class MoneyLoggerModule { }
