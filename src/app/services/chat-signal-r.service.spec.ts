import { TestBed } from '@angular/core/testing';

import { ChatSignalRService } from './chat-signal-r.service';

describe('SignalRService', () => {
  let service: ChatSignalRService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatSignalRService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
