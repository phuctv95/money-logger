import { animate, animateChild, group, query, state, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('routeAnimation', [
      transition('* <=> *', [
        style({
          position: 'relative',
        }),
        query(':enter, :leave', [
          style({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%'
          })
        ], { optional: true }),
        query(':enter', [
          style({ opacity: 0 })
        ], { optional: true }),
        query(':leave', animateChild(), { optional: true }),
        query(':leave', [
          animate('500ms', style({ opacity: 0 }))
        ], { optional: true }),
        query(':enter', [
          animate('500ms', style({ opacity: 1 }))
        ], { optional: true }),
        query(':enter', animateChild(), { optional: true }),
      ]),
    ]),
  ]
})
export class AppComponent {

  getState(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.depth;
  }
  
}
