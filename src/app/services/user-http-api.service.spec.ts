import { TestBed } from '@angular/core/testing';

import { UserHttpApiService } from './user-http-api.service';

describe('UserHttpApiService', () => {
  let service: UserHttpApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserHttpApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
