import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Books } from './pages/books/books';
import { MyLoans } from './pages/my-loans/my-loans';
import { Account } from './pages/account/account';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';

export const routes: Routes = [

    { path: '', redirectTo: '/home', pathMatch: 'full' },

    { path: 'home', component: Home },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'books', component: Books },
    { path: 'my-loans', component: MyLoans },
    { path: 'account', component: Account },

    { path: 'admin', component: AdminDashboard },

    { path: '**', redirectTo: '/home' }
];