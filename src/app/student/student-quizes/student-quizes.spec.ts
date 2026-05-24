import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentQuizes } from './student-quizes';

describe('StudentQuizes', () => {
  let component: StudentQuizes;
  let fixture: ComponentFixture<StudentQuizes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentQuizes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentQuizes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
