import { TestBed } from '@angular/core/testing';

import { GameSignalRService } from './game-signal-r.service';

describe('GameSignalRService', () => {
  let service: GameSignalRService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameSignalRService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
