import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndChatModal } from './end-chat-modal';

describe('EndChatModal', () => {
  let component: EndChatModal;
  let fixture: ComponentFixture<EndChatModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EndChatModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EndChatModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
