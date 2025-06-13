import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private apiUrl = 'http://localhost:3000/api/obtener-perfil';

  constructor(private http: HttpClient) { }

  obtenerPerfil(usuarioId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${usuarioId}`).pipe(
      catchError(error => {
        console.error('Error en obtenerPerfil:', error);
        return throwError(() => new Error('Error al obtener el perfil del usuario'));
      })
    );
  }

  actualizarPerfil(usuarioId: number, datosActualizados: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${usuarioId}`, datosActualizados).pipe(
      catchError(error => {
        console.error('Error en actualizarPerfil:', error);
        return throwError(() => new Error('Error al actualizar el perfil'));
      })
    );
  }
}