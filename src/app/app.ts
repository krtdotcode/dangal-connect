import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('dangal-connect');

  // Mock connected user data - in real app this would come from auth service
  connectedUser = {
    department: 'College of Computing Studies',
    program: 'Bachelor of Science in Computer Science',
    year: '3rd Year'
  };

  messages = [
    { id: 1, text: 'Hey there! Welcome to Dangal Connect 👋', sender: 'system', timestamp: new Date() },
    { id: 2, text: 'Feel free to share your thoughts or ask questions!', sender: 'system', timestamp: new Date() }
  ];

  newMessage = '';

  sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.push({
        id: this.messages.length + 1,
        text: this.newMessage.trim(),
        sender: 'user',
        timestamp: new Date()
      });
      this.newMessage = '';
    }
  }
}
