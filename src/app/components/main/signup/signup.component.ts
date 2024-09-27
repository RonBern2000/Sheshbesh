import { Component, OnInit,Renderer2 } from '@angular/core';
import {
  FormsModule,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormBuilder,
} from '@angular/forms';
import { SignupUser } from '../../../shared/models/SignupUser';
import { UserHttpApiService } from '../../../services/user-http-api.service';
import { CommonModule } from '@angular/common';
import { matchPasswordsValidator } from '../../../shared/validators/match-passwords.validator';
import { Router } from '@angular/router';
import { AuthUserService } from '../../../services/auth-user.service';

@Component({
  selector: 'signup-component',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule,CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent implements OnInit {

  signupForm!: FormGroup;

  passwordMatch:boolean = true;

  newUser: SignupUser = new SignupUser();

  constructor(private authUser: AuthUserService,private userHttpService:UserHttpApiService, private renderer:Renderer2, private fb: FormBuilder, private router:Router){}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      username: new FormControl<string>('',[
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(30),
        Validators.pattern(/^[a-zA-Z0-9_]+$/) // Allows only English letters, numbers, and underscores
      ]),
        password: new FormControl<string>('',[
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(30),
        Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).+$/) // Requires at least one digit, one lowercase, and one uppercase letter
      ]),
        cPassword: new FormControl<string>('',[
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(30)
      ]),
        email: new FormControl<string>('',[
        Validators.required,
        Validators.email,
        Validators.maxLength(70),
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/) // Valid email format
      ])
    });

    const rootElement = document.querySelector('signup-component');
    this.renderer.addClass(rootElement, 'loginComponent');
  }

  onChange() {
    if(!this.passwordMatch)
      this.passwordMatch = !this.passwordMatch;
  }

  signup():void{
    if(!matchPasswordsValidator(this.signupForm.value.password,this.signupForm.value.cPassword)){
      this.passwordMatch = !this.passwordMatch;
      return;
    }

    this.newUser.username = this.signupForm.value.username;
    this.newUser.password = this.signupForm.value.password;
    this.newUser.email = this.signupForm.value.email;

    this.userHttpService.createUser(this.newUser).subscribe({
      next: (res) =>  {
        this.authUser.setUser({
          id: res.id,
          username: res.username,
          email: res.email
        });
        this.passwordMatch = !this.passwordMatch;
        this.router.navigate(['/chatHub']);
        this.resetForm();
      },
      error: () => {
        // TODO: do logging
        this.passwordMatch = !this.passwordMatch;
        this.resetForm();
      }
    });
  }
  private resetForm():void{
    this.signupForm.reset({
          username: '',
          password: '',
          cPassword: '',
          email: ''
        });
  }
}
