import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionPreferences } from './connection-preferences';

describe('ConnectionPreferences', () => {
  let component: ConnectionPreferences;
  let fixture: ComponentFixture<ConnectionPreferences>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectionPreferences]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectionPreferences);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
