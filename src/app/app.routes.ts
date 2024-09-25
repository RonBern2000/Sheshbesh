import { Routes } from '@angular/router';
import { LoginComponentComponent } from './components/main/login-component/login-component.component';
import { SignupComponent } from './components/main/signup/signup.component';
import { ChatHubComponent } from './components/main/chat-hub/chat-hub.component';

export const routes: Routes = [
    { path: '', component:LoginComponentComponent, title: 'Login Page'},
    { path: 'signup', component: SignupComponent, title: 'Signup Page'},
    { path: 'chatHub', component: ChatHubComponent, title: 'Chat Hub'}
];
