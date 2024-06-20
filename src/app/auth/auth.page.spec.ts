import { Router } from '@angular/router';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { IonicModule } from '@ionic/angular';

import { of } from 'rxjs';

import { AuthPage } from './auth.page';

import { AuthService } from './services/auth.service';
import { NewUser } from './models/newUser.interface';
import { User } from './models/user.interface';

let component: AuthPage;
let fixture: ComponentFixture<AuthPage>;

let routerSpy: jasmine.SpyObj<Router>;

const mockNewUser: NewUser = {
  firstName: 'Don',
  lastName: 'Huan',
  email: 'don@hotmail.com',
  password: 'password',
};

const mockUser: User = {
  id: 1,
  firstName: mockNewUser.firstName,
  lastName: mockNewUser.lastName,
  email: mockNewUser.email,
  role: 'user',
};

const mockAuthService: Partial<AuthService> = {
  registerUser: () => of(mockUser),
  login: () => of({ token: 'jwt' }),
};

describe('AuthPage', () => {
  beforeEach(waitForAsync(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    TestBed.configureTestingModule({
      imports: [FormsModule, IonicModule],
      declarations: [AuthPage],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: mockAuthService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.form = {
      value: mockNewUser,
      reset: jasmine.createSpy('reset'),
    } as unknown as NgForm;
    fixture.detectChanges();
  }));

  it('should create with form values', waitForAsync(() => {
    fixture.whenStable().then(() => {
      expect(component).toBeTruthy();
      expect(component.form.value).toEqual(mockNewUser);
    });
  }));

  it('should have initial submission type of login', () => {
    expect(component.submissionType).toEqual('login');
  });

  it('should toggle submission type to join', () => {
    component.toggleText();
    fixture.detectChanges();
    expect(component.submissionType).toEqual('join');
  });

  it('should toggle submission type to login after registering', () => {
    expect(component.submissionType).toEqual('login');
    component.toggleText();
    expect(component.submissionType).toEqual('join');
    component.onSubmit();
    expect(component.submissionType).toEqual('login');
  });
});
