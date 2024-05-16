import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit, OnDestroy {
  @ViewChild('form') form!: NgForm;
  submissionType: 'login' | 'join' = 'login';
  isSubmitted: boolean = false;
  registerUserSub!: Subscription;
  loginSub!: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit() {}

  onSubmit() {
    if (this.form.invalid) return;
    this.isSubmitted = true;

    const { firstName, lastName, email, password } = this.form.value;

    if (this.submissionType === 'login') {
      this.loginSub = this.authService.login(email, password).subscribe({
        next: (res) => {
          this.form.reset();
          console.log(res);
        },
        // добавить логику для мэсэджа юзеру
        error: (err) => console.log(err),
      });
    } else {
      this.registerUserSub = this.authService
        .registerUser({ firstName, lastName, email, password })
        .subscribe({
          next: (res) => {
            console.log(res);
            this.toggleText();
          },
          // добавить логику для мэсэджа юзеру
          error: (err) => console.log(err),
        });
    }

    this.isSubmitted = false;
  }

  toggleText() {
    this.submissionType = this.submissionType === 'login' ? 'join' : 'login';
  }

  ngOnDestroy(): void {
    this.registerUserSub ? this.registerUserSub.unsubscribe() : null;
    this.loginSub ? this.loginSub.unsubscribe() : null;
  }
}
