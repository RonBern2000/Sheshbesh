import { Component, OnInit, OnDestroy,ViewChild , AfterViewChecked, ElementRef} from '@angular/core';
import { SignalRService } from '../../../services/signal-r.service';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { AuthUserService } from '../../../services/auth-user.service';
import { UsersListComponent } from '../users-list/users-list.component';
import { ChatMessage } from '../../../shared/models/ChatMessage';
@Component({
  selector: 'chat-hub-component',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,UsersListComponent],
  templateUrl: './chat-hub.component.html',
  styleUrl: './chat-hub.component.css'
})
export class ChatHubComponent implements OnInit, OnDestroy, AfterViewChecked {

  messages: ChatMessage[] = [];
  newMessage: string = '';

  dmMessages: ChatMessage[] = [];
  newDmMessage: string = '';

  user: { id: string, username: string, email: string } | null = null;

  @ViewChild('messageList') private messageList!: ElementRef;

  clickedUsername:string = '';

  constructor(private authUser:AuthUserService,private signalRService: SignalRService){}

  ngOnInit(): void {
    this.authUser.getUser().subscribe(user=>{
      this.user = user;
    });

    this.signalRService.startConnection().subscribe(()=>{
      this.signalRService.receiveMessage().subscribe(({username ,message})=>{
        this.messages.push({username, message});
      })

      this.signalRService.receiveGroupMessage().subscribe(({username, message})=>{
        this.dmMessages.push({username, message});
      });
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    if(this.messageList){
        this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight;
    }
  }

  sendMessage(message:string):void{
    if(message.trim()){
      this.signalRService.sendMessage(this.user!.username,message);
      this.newMessage = '';
    }
  }

  onUsernameClicked(username: string) {
    this.clickedUsername = username;
  }

  sendDmMessage(message:string) {
    if(message.trim()){
      this.signalRService.sendGroupMessage(this.user!.username, this.clickedUsername, message);
      this.newDmMessage = '';
    }
  }

  ngOnDestroy(): void {
    this.signalRService.disconnect();
  }
}
