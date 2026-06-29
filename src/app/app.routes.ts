import { Routes } from '@angular/router';

import { PublicLayout } from './layout/public-layout/public-layout';
import { AuthenticatedLayout } from './layout/authenticated-layout/authenticated-layout';

import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { Books } from './pages/books/books';
import { MyLoans } from './pages/my-loans/my-loans';
import { Account } from './pages/account/account';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';

import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { adminGuard } from './guards/admin.guard';

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
            component: Login,
            canActivate: [guestGuard]
        },
        {
            path: 'register',
            component: Register,
            canActivate: [guestGuard]
        }
        ]
    },

    {
        path: 'dashboard',
        component: AuthenticatedLayout,
        canActivateChild: [authGuard],
        children: [
        {
            path: '',
            component: Dashboard
        },
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
            component: AdminDashboard,
            canActivate: [adminGuard]
        }
        ]
    },

    {
        path: '**',
        redirectTo: 'home'
    }
];