import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MoneyLoggerRoutingModule } from './money-logger-routing.module';
import { StartPageComponent } from './start-page/start-page.component';


@NgModule({
  declarations: [StartPageComponent],
  imports: [
    CommonModule,
    MoneyLoggerRoutingModule
  ]
})
export class MoneyLoggerModule { }
