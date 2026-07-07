import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { User } from '../../models/user/user.model';
import { UserRequest } from '../../models/user/user.request.model';
import { UserSearchParams } from '../../models/user/user.search.params.model';
import { UpdateUserRequest } from '../../models/user/update.user.request.model';
import { PatchUserRequest } from '../../models/user/patch.user.request.model';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {

  private readonly usersUrl: string = `${environment.apiUrl}/users`;

  constructor(private readonly _http: HttpClient) {}

  public getAllUsers(): Observable<User[]> {
    return this._http.get<User[]>(this.usersUrl);
  }

  public getUserById(userId: number): Observable<User> {
    return this._http.get<User>(`${this.usersUrl}/${userId}`);
  }

  public searchUsers(searchParams: UserSearchParams): Observable<User[]> {
    let queryParams = new HttpParams();

    if (searchParams.dni) {
      queryParams = queryParams.set('dni', searchParams.dni);
    }

    if (searchParams.firstName) {
      queryParams = queryParams.set('firstName', searchParams.firstName);
    }

    if (searchParams.lastName) {
      queryParams = queryParams.set('lastName', searchParams.lastName);
    }

    if (searchParams.email) {
      queryParams = queryParams.set('email', searchParams.email);
    }

    if (queryParams.keys().length === 0) {
      return this.getAllUsers();
    }

    return this._http.get<User[]>(`${this.usersUrl}/search`, {
      params: queryParams,
    });
  }

  public createUser(userData: UserRequest): Observable<User> {
    return this._http.post<User>(this.usersUrl, userData);
  }

  public updateUser(userId: number, userData: UpdateUserRequest): Observable<User> {
    return this._http.put<User>(`${this.usersUrl}/${userId}`, userData);
  }

  public patchUser(userId: number, userData: PatchUserRequest): Observable<User> {
    return this._http.patch<User>(`${this.usersUrl}/${userId}`, userData);
  }

  public deleteUser(userId: number): Observable<void> {
    return this._http.delete<void>(`${this.usersUrl}/${userId}`);
  }
}