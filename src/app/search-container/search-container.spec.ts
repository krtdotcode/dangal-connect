import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchContainer } from './search-container';

describe('SearchContainer', () => {
  let component: SearchContainer;
  let fixture: ComponentFixture<SearchContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
