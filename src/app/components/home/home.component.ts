import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button'; 

import {
  Form,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

export interface ChatMessage {
  sender: 'me' | 'ai';
  message: string;
  timestamp: Date;
}

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    MatButtonModule,
  ],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnDestroy, OnInit {
  showChat = false;
  showHideName = true;
  loading = false;
  form!: FormGroup;
  newForm = new FormControl('Hi', [Validators.required]);
  messages: ChatMessage[] = [];
  newMessage: string = '';
  modes = [
    { name: 'Motivational ⏰🏋🏽‍♀️', value: 'motivational' },
    { name: 'Flirty 😉', value: 'flirty' },
    { name: 'Sexual 💦 ', value: 'sexual' },
    { name: 'Funny 🤣', value: 'funny' },
    { name: 'Dynamic ✔️', value: 'dynamic' },
    { name: 'Regular ✅', value: 'regular' },
  ];
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  ngOnInit(): void {}
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private clipboard: Clipboard
  ) {
    this.form = this.fb.group({
      prompt: [null, [Validators.required]],
      name: [null, [Validators.required]],
      mode: [null, [Validators.required]],
    });
  }

  textFormControl() {}

  showChatWindow() {
    if (this.form.get('name')?.value == null) {
      return;
    } else {
      this.showHideName = false;
      this.showChat = true;
    }
  }

  copyText(text: string) {
    this.clipboard.copy(text);
  }

  onChange(mode: string) {
    this.form.get('mode')?.setValue(mode);
    this.messages = [];
  }

  sendMessage() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log(this.form.get('prompt')?.value.trim());

    this.messages.push({
      sender: 'me',
      message: this.form.get('prompt')?.value.trim(),
      timestamp: new Date(),
    });
    this.scrollToBottom();
    this.apiResponse();

    this.form.get('prompt')?.reset();
  }

  clearChat() {}
  apiResponse() {
    this.loading = true;
    const prompt = this.form.get('prompt')?.value;
    let url = 'https://flirty-agent-767526d49ff9.herokuapp.com/api/v1/chat';
    // let url = 'http://localhost:8000/api/v1/chat';
    let reqBody = {
      user_id: this.form.get('name')?.value,
      message: prompt,
      mode: this.form.get('mode')?.value,
    };

    this.http.post(url, reqBody).subscribe(
      (data: any) => {
        this.loading = false;
        this.messages.push({
          sender: 'ai',
          message: data.response,
          timestamp: new Date(),
        });
        this.scrollToBottom();
      },
      (error) => {
        console.error('Error submitting prompt:', error);
      }
    );
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  ngOnDestroy() {}
}
