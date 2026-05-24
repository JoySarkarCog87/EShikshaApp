import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityForumComponent } from './community-forum';

describe('CommunityForumComponent', () => {
  let component: CommunityForumComponent;
  let fixture: ComponentFixture<CommunityForumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityForumComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunityForumComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
