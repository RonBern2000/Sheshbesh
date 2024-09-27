import { Component, OnInit, Renderer2} from '@angular/core';
import {
  FormsModule,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormBuilder
} from '@angular/forms';
import { UserHttpApiService } from '../../../services/user-http-api.service';
import { LoginUser } from '../../../shared/models/LoginUser';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthUserService } from '../../../services/auth-user.service';

@Component({
  selector: 'login-component',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule,CommonModule],
  templateUrl: './login-component.component.html',
  styleUrl: './login-component.component.css'
})
export class LoginComponentComponent implements OnInit{

  loginForm!: FormGroup;

  loginUser:LoginUser = new LoginUser();

  loginFail: boolean = false;

  constructor(private authUser: AuthUserService,private userHttpService:UserHttpApiService, private renderer: Renderer2, private fb: FormBuilder, private router: Router){}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: new FormControl<string>('', [
        Validators.required,
        Validators.minLength(2),
      ]),
      password: new FormControl<string>('', [
        Validators.required,
        Validators.minLength(4)
      ]),
    });

    const rootElement = document.querySelector('login-component');
    this.renderer.addClass(rootElement, 'loginComponent');
  }

  login():void{
    this.loginUser.username = this.loginForm.value.username;
    this.loginUser.password = this.loginForm.value.password;

    this.userHttpService.login(this.loginUser).subscribe({
      next: (res) =>  {
        this.authUser.setUser({
          id: res.id,
          username: res.username,
          email: res.email
        });
        if(this.loginFail)
          this.loginFail = !this.loginFail;
        this.router.navigate(['/chatHub']);
        this.resetFrom();
      },
      error: () => {
        // TODO: do logging
        this.loginFail = !this.loginFail;
        this.resetFrom();
      }
    });
  }
  
  private resetFrom():void{
    this.loginForm.reset({
          username: '',
          password: ''
        });
  }
}
