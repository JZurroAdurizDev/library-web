import { Routes } from '@angular/router';

import { PublicLayout } from './layout/public-layout/public-layout';
import { AuthenticatedLayout } from './layout/authenticated-layout/authenticated-layout';

import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Books } from './pages/books/books';
import { MyLoans } from './pages/my-loans/my-loans';
import { Account } from './pages/account/account';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';

export const routes: Routes = [

    {
        path: '',
        component: PublicLayout,
        children: [
            {
                path: '',
                redirectTo: 'home',
                pathMatch: 'full'
            },
            {
                path: 'home',
                component: Home
            },
            {
                path: 'login',
                component: Login
            },
            {
                path: 'register',
                component: Register
            }
        ]
    },

    {
        path: '',
        component: AuthenticatedLayout,
        children: [
            {
                path: 'books',
                component: Books
            },
            {
                path: 'my-loans',
                component: MyLoans
            },
            {
                path: 'account',
                component: Account
            },
            {
                path: 'admin',
                component: AdminDashboard
            }
        ]
    },

    {
        path: '**',
        redirectTo: 'home'
    }
];