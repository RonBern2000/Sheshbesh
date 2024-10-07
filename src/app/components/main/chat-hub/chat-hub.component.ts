import { Component, OnInit, OnDestroy,ViewChild , AfterViewChecked, ElementRef} from '@angular/core';
import { ChatSignalRService } from '../../../services/chat-signal-r.service';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { AuthUserService } from '../../../services/auth-user.service';
import { UsersListComponent } from '../users-list/users-list.component';
import { ChatMessage } from '../../../shared/models/ChatMessage';
import { MessageService } from '../../../services/message.service';
import { DmMessage } from '../../../shared/models/DmMessage';
import { Router } from '@angular/router';
import { UserHttpApiService } from '../../../services/user-http-api.service';
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
  @ViewChild('dmMessageList') private dmMessageList!: ElementRef;
  
  clickedUsername:string = '';

  constructor(private userHttpService: UserHttpApiService,private router: Router, private messageService:MessageService, private authUser:AuthUserService,private signalRService: ChatSignalRService){}

  ngOnInit(): void {
    if(!sessionStorage.getItem('authUser')){
      this.userHttpService.isAuth().subscribe({
      next: (res) => {
        this.authUser.setUser({
          id: res.id,
          username: res.username,
          email: res.email
        });
      },
      error: (error) => {
        console.error('User is not authenticated', error);
      }
    });
    }
    this.authUser.getUser().subscribe(user=>{
      this.user = user;
    });

    this.signalRService.startConnection().subscribe(()=>{
      this.signalRService.receiveMessage().subscribe(({username ,message})=>{
        this.messages.push({username, message});
      });

      this.signalRService.receiveGroupMessage().subscribe(({username, message})=>{
        this.dmMessages.push({username, message});
      });
    });
  }

  navigateToGame(){
    this.router.navigate(["/sheshbeshHub"]);
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    if(this.messageList){
        this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight;
    }
    if(this.dmMessageList){
      this.dmMessageList.nativeElement.scrollTop = this.dmMessageList.nativeElement.scrollHeight;
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
    this.dmMessages = [];
    this.loadPastMessages();
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

  private loadPastMessages() {
      this.messageService.getPastMessages(this.user!.username, this.clickedUsername)
        .subscribe((messages: DmMessage[]) => {
          messages.forEach((msg: DmMessage) => {
            const formattedMsg: ChatMessage = {  
            username: msg.senderUsername,   
            message: msg.messageContent
          };
          this.dmMessages.push(formattedMsg);
        });
      });
    }
}
