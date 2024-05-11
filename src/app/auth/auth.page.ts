import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  @ViewChild('form') form!: NgForm;
  submissionType: 'login' | 'join' = 'login';
  isSubmitted: boolean = false;

  constructor() {}

  ngOnInit() {}

  onSubmit() {
    if (this.form.invalid) return;
    this.isSubmitted = true;

    if (this.submissionType === 'login') {
      console.log('submit login');
    } else {
      console.log('submit join');
    }

    this.form.reset();
    this.isSubmitted = false;
  }

  toggleText() {
    this.submissionType = this.submissionType === 'login' ? 'join' : 'login';
  }
}
