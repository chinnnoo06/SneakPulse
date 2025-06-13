import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  private apiUrl = 'http://localhost:3000/api/verificar-carrito';

  constructor(private http: HttpClient) { }

  verificarCarritoActivo(usuarioId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${usuarioId}`);
  }
}