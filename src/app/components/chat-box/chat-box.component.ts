import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { finalize, Subscription } from 'rxjs';
import { ChatData } from '../../models/chatModel';
import { ChatService } from '../../services/chat-service';
import { LoadingService } from '../../services/loading-service';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-chat-box',
  standalone: true, 
  imports: [CommonModule, FormsModule], 
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css']
})
export class ChatBoxComponent {
  private userService = inject(UserService);
  private chatService = inject(ChatService);
  private toastService = inject(ToastrService);
  private loadingService = inject(LoadingService);

  messages = signal<ChatData[]>([]);
  isLoading = signal<boolean>(false);
  userPrompt: string = '';
  botStatus = signal<string>('');
  subscriptions = new Subscription();

  ngOnInit(){
    this.loadingService.isLoading$.next(true);
    this.chatService.checBotStatus().subscribe(s=>{
      this.botStatus.set(s.result);
      if(s.message){
        this.toastService.warning(s.message);
      }
      this.loadingService.isLoading$.next(false);
      if(s.result==='online'){
        this.isLoading.set(true);
        this.userService.activeUser$.subscribe(user=>{
          this.messages.update(marr=>[...marr, new ChatData('user', [{text:`this is userDetails by system name=${user?.name}, role=${user?.role}`}])]);
          this.subscriptions = this.chatService.getChatResponse(this.messages())
          .pipe(
            finalize(()=>{
              this.isLoading.set(false);
              this.subscriptions.unsubscribe();
            })
          )
          .subscribe({
            next:resultData=>{
              this.messages().push(new ChatData('model', [{text:resultData.result}]))
            },
            error: _=>{
              this.messages.update(marr=>{
                marr.pop();
                return marr;
              })
              this.toastService.error("Error while connecting with bot");
            }
          })
        })
      }
    });
  }

  sendMessage(){
    if(this.botStatus()!=='online'){
      this.toastService.error("Bot is now ofline please try again later.");
      return;
    }
    this.isLoading.set(true);
    this.messages.update(marr=>[...marr, new ChatData('user', [{text:this.userPrompt}])]);
    this.chatService.getChatResponse(this.messages())
    .pipe(
      takeUntilDestroyed(),
      finalize(()=>this.isLoading.set(false))
    )
    .subscribe({
      next:resultData=>{
          this.messages().push(new ChatData('model', [{text:resultData.result}]));
          this.userPrompt="";
        },
        error: err=>{
          this.messages.update(marr=>{
            marr.pop();
            return marr;
          })
          this.toastService.error(err?.error?.message??"Error while connecting with bot");
        }
    })
  }


  ngOnDestroy(){
    this.botStatus.set('');
  }

}