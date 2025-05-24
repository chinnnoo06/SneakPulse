import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
  nombre: string;
  apellido: string;
  correo: string;
  direccion: string;
  password: string;
  preguntaSeguridad: string;
  respuestaSeguridad: string;
}

@Injectable({
  providedIn: 'root'
})
export class CrearCuentaService {
  private apiUrl = 'http://localhost:3000/api/crearcuenta';

  constructor(private http: HttpClient) { }

  crearCuenta(usuario: Usuario): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    return this.http.post(this.apiUrl, usuario, { headers });
  }
}