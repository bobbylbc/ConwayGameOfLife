import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {RADIO_GROUP_DIRECTIVES} from "ng2-radio-group";

import { Mod1Component } from './mod1.component';

describe('Mod1Component', () => {
  let component: Mod1Component;
  let fixture: ComponentFixture<Mod1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Mod1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Mod1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
