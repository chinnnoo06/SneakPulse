import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Credenciales {
  email: string;
  password: string;
}

export interface RespuestaLogin {
  success: boolean;
  message?: string;
  token?: string;
  usuario?: {
    id: number;
    nombre: string;
    email: string;
     tipoUsuario: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = 'http://localhost:3000/api/iniciarsesion';

  constructor(private http: HttpClient) { }

  iniciarSesion(credenciales: Credenciales): Observable<RespuestaLogin> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    return this.http.post<RespuestaLogin>(this.apiUrl, credenciales, { headers });
  }
}