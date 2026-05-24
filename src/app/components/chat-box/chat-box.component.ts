import { Component, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';     
import { HttpClientModule, HttpClient } from '@angular/common/http';

interface Message {
  sender: 'You' | 'Bot';
  text: string;
  time: string;
}

@Component({
  selector: 'app-chat-box',
  standalone: true, 
  imports: [CommonModule, FormsModule, HttpClientModule], 
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css']
})
export class ChatBoxComponent {
  userPrompt: string = '';
  messages: Message[] = [
    { sender: 'Bot', text: 'Hello Student! Static Bot is ready. Ask me anything!', time: this.getCurrentTime() }
  ];
  isLoading: boolean = false;

  private backendUrl = 'http://localhost:8000/api/chatBox/stream';

  
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  sendMessage() {
    if (!this.userPrompt.trim() || this.isLoading) return;

    const currentPrompt = this.userPrompt;
    const messageTime = this.getCurrentTime(); 
    
    
    this.messages.push({
      sender: 'You',
      text: currentPrompt,
      time: messageTime
    });

    this.userPrompt = ''; 
    this.isLoading = true;
    this.cdr.detectChanges(); 

    
    this.http.post<any>(this.backendUrl, { prompt: currentPrompt }).subscribe({
      next: (res) => {
        if (res && res.reply) {
          this.messages.push({
            sender: 'Bot',
            text: res.reply,
            time: messageTime
          });
        } else {
          this.messages.push({
            sender: 'Bot',
            text: 'Response received but reply format is empty.',
            time: messageTime
          });
        }
        this.isLoading = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error("Frontend HTTP Error Block:", err);
        this.messages.push({
          sender: 'Bot',
          text: `Error ${err.status}: Backend drop request block.`,
          time: messageTime
        });
        this.isLoading = false;
        this.cdr.detectChanges(); 
      }
    });
  }

  private getCurrentTime(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}