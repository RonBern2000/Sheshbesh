import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SheshbeshGameComponent } from './sheshbesh-game.component';

describe('SheshbeshGameComponent', () => {
  let component: SheshbeshGameComponent;
  let fixture: ComponentFixture<SheshbeshGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SheshbeshGameComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SheshbeshGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
