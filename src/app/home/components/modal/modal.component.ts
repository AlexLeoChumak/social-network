import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit {
  @ViewChild('form') form!: NgForm;

  constructor(private modalController: ModalController) {}

  ngOnInit() {}

  onPost() {
    if (this.form.invalid) return;

    const body = this.form.value['body'];
    this.modalController.dismiss(body, 'post');
  }

  onDismiss() {
    this.modalController.dismiss(null);
  }
}
