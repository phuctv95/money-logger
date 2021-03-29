import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss']
})
export class WindowComponent implements OnInit {

  @Input() header = '';

  @Input() width = '400px';

  constructor() { }

  ngOnInit(): void {
  }

}
