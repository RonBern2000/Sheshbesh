import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { UserHttpApiService } from '../../../services/user-http-api.service';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { CommonModule } from '@angular/common';
import { SignalRService } from '../../../services/signal-r.service';
import { AuthUserService } from '../../../services/auth-user.service';

@Component({
  selector: 'users-list',
  standalone: true,
  imports: [InfiniteScrollModule,CommonModule],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css'
})
export class UsersListComponent implements OnInit {

  data: any[] = [];
  page = 1;
  pageSize = 5;
  loading = false;

  user: { id: string, username: string, email: string } | null = null;

  prevUser:string = '';

  @Output() usernameClicked = new EventEmitter<string>();

  constructor(private authUser:AuthUserService,private userHttp: UserHttpApiService, private signalRService: SignalRService){}

  ngOnInit(): void {
    this.authUser.getUser().subscribe(user=>{
      this.user = user;
    });
    this.loadUsers();
  }

  loadUsers(){
    if (this.loading) return;

  this.loading = true;
  this.userHttp.getAllUsers(this.page, this.pageSize).subscribe(
    (newData) => {
      const filteredData = newData.filter(newUser => 
        !this.data.some(existingUser => existingUser.id === newUser.id) &&
        newUser.id !== this.user?.id
      );

      this.data = [...this.data, ...filteredData];

      if (filteredData.length > 0) {
        this.page++;
      }

      this.loading = false;
    },
    (error) => {
      console.error('Error fetching users', error);
      this.loading = false;
    }
  );
  }

   onScroll(): void {
    this.loadUsers();
  }

  joinRoom(clickedUsername: string){
    this.signalRService.leaveRoom(this.user!.username, this.prevUser);
    this.prevUser = clickedUsername;
    this.usernameClicked.emit(clickedUsername);
    this.signalRService.joinRoom(this.user!.username,clickedUsername);
  }
}
