import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StartPageComponent } from './components/start-page/start-page.component';
import { TodayLoggerComponent } from './components/today-logger/today-logger.component';

const routes: Routes = [
  { path: '', component: StartPageComponent },
  { path: 'today', component: TodayLoggerComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MoneyLoggerRoutingModule { }
