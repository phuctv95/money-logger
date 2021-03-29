import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { WindowComponent } from './components/window/window.component';



@NgModule({
  declarations: [SpinnerComponent, WindowComponent],
  imports: [
    CommonModule
  ],
  exports: [
    SpinnerComponent,
    WindowComponent
  ]
})
export class SharedModule { }
