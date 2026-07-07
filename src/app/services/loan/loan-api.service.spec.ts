import { TestBed } from '@angular/core/testing';

import { LoanApiService } from './loan-api.service';

describe('LoanApiService', () => {
  let service: LoanApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoanApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
