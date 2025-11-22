import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatEndedModal } from './chat-ended-modal';

describe('ChatEndedModal', () => {
  let component: ChatEndedModal;
  let fixture: ComponentFixture<ChatEndedModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatEndedModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatEndedModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
