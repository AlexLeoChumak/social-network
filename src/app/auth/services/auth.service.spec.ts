import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { NewUser } from '../models/newUser.interface';
import { User } from '../models/user.interface';

let httpClientSpy: { post: jasmine.Spy };
let routerSpy: Partial<Router>;
let authService: AuthService;

const mockNewUser: NewUser = {
  firstName: 'Don',
  lastName: 'Huan',
  email: 'don@hotmail.com',
  password: 'password',
};

beforeEach(() => {
  httpClientSpy = jasmine.createSpyObj('HttpClient', ['post']);
  routerSpy = jasmine.createSpyObj('Router', ['navigate']);

  authService = new AuthService(
    httpClientSpy as any,
    routerSpy as any,
    null as any
  );
});

describe('AuthService', () => {
  describe('register', () => {
    it('should return the user', (done: DoneFn) => {
      const expectedUser: User = {
        id: 2,
        firstName: 'Don',
        lastName: 'Huan',
        email: 'don@hotmail.com',
        role: 'user',
      };

      httpClientSpy.post.and.returnValue(of(expectedUser));

      authService.registerUser(mockNewUser).subscribe((user: User) => {
        expect(typeof user.id).toBe('number');
        expect(user.firstName).toEqual(mockNewUser.firstName);
        expect(user.lastName).toEqual(mockNewUser.lastName);
        expect(user.email).toEqual(mockNewUser.email);
        expect((user as any).password).toBeUndefined();
        expect(user.role).toEqual('user');

        done();
      });

      expect(httpClientSpy.post.calls.count()).toBe(1, 'one call');
    });

    it('should return an error if email already exists', (done: DoneFn) => {
      const errorResponse = new HttpErrorResponse({
        error: 'A user had already been created with this email address',
        status: 400,
      });

      httpClientSpy.post.and.returnValue(throwError(() => errorResponse));

      authService.registerUser(mockNewUser).subscribe({
        next: () => {
          done.fail('expected a bad request error');
        },
        error: (httpErrorResponse: HttpErrorResponse) => {
          expect(httpErrorResponse.error).toContain('already been created');
          done();
        },
      });
    });
  });
});
