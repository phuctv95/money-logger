import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodayLoggerComponent } from './today-logger.component';

describe('TodayLoggerComponent', () => {
  let component: TodayLoggerComponent;
  let fixture: ComponentFixture<TodayLoggerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TodayLoggerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TodayLoggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
