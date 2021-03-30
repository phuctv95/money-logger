import { TestBed } from '@angular/core/testing';

import { MoneyLoggerService } from './money-logger.service';

describe('MoneyLoggerService', () => {
  let service: MoneyLoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MoneyLoggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
