import { TestBed } from '@angular/core/testing';

import { TicketUploadService } from './ticket-upload.service';

describe('TicketUploadService', () => {
  let service: TicketUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TicketUploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
