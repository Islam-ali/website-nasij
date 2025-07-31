import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { MessageService } from 'primeng/api';
import { IUser, IAuthResponse, ILoginCredentials, IRegisterData } from '../models/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = '/api/auth';
  private readonly TOKEN_KEY = 'auth_token';
  private currentUserSubject: BehaviorSubject<IUser | null>;
  public currentUser$: Observable<IUser | null>;
  private jwtHelper = new JwtHelperService();
  redirectUrl: string = '';
  isAuthenticated$: Observable<boolean>;
  constructor(
    private http: HttpClient,
    private router: Router,
    private messageService: MessageService
  ) {
    this.currentUserSubject = new BehaviorSubject<IUser | null>(this.getUserFromToken());
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isAuthenticated$ = this.currentUser$.pipe(map(user => !!user));
  }

  get currentUserValue(): IUser | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  get isAdmin(): boolean {
    return this.currentUserValue?.role === 'admin';
  }

  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  login(credentials: ILoginCredentials): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => this.handleAuthentication(response))
    );
  }

  register(userData: IRegisterData): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.API_URL}/register`, userData).pipe(
      tap(response => this.handleAuthentication(response))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
    this.messageService.add({
      severity: 'success',
      summary: 'Logged Out',
      detail: 'You have been successfully logged out.'
    });
  }

  private handleAuthentication(response: IAuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    this.currentUserSubject.next(response.user);
  }

  private getUserFromToken(): IUser | null {
    const token = this.token;
    if (!token || this.jwtHelper.isTokenExpired(token)) {
      return null;
    }
    
    try {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return {
        _id: decodedToken.sub,
        email: decodedToken.email,
        firstName: decodedToken.firstName,
        lastName: decodedToken.lastName,
        role: decodedToken.role,
        createdAt: new Date(decodedToken.createdAt),
        updatedAt: new Date(decodedToken.updatedAt)
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}
