import { Component, OnInit, OnDestroy} from '@angular/core';
import { SignalRService } from '../../../services/signal-r.service';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'chat-hub-component',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './chat-hub.component.html',
  styleUrl: './chat-hub.component.css'
})
export class ChatHubComponent implements OnInit, OnDestroy {
  messages: string[] = [];
  newMessage: string = '';

  constructor(private signalRService: SignalRService){}

  ngOnInit(): void {
    this.signalRService.startConnection().subscribe(()=>{
      this.signalRService.receiveMessage().subscribe((message)=>{
        this.messages.push(message);
      })
    });
  }

  sendMessage(message:string):void{
    if(message.trim()){
      this.signalRService.sendMessage(message);
      this.newMessage = '';
    }
  }

  ngOnDestroy(): void {
    this.signalRService.disconnect();
  }
  
}
