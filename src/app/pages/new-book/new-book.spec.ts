import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewBook } from './new-book';

describe('NewBook', () => {
  let component: NewBook;
  let fixture: ComponentFixture<NewBook>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewBook],
    }).compileComponents();

    fixture = TestBed.createComponent(NewBook);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
