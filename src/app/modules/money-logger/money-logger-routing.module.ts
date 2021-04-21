import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StartPageComponent } from './components/start-page/start-page.component';
import { TodayLoggerComponent } from './components/today-logger/today-logger.component';

const routes: Routes = [
  { path: '', component: StartPageComponent, data: { depth: 1 } },
  { path: 'today', component: TodayLoggerComponent, data: { depth: 2 } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MoneyLoggerRoutingModule { }
