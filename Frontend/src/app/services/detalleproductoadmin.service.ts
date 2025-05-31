import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface TallaProducto {
  ID: number;
  Nombre: string;
  Cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class DetalleProductoService {
  private baseUrl = 'http://localhost:3000/api'; // URL base común

  constructor(private http: HttpClient) { }

  obtenerTallasPorProducto(productoId: number): Observable<TallaProducto[]> {
    // Endpoint: /api/tallas-producto/:productoId
    return this.http.get<TallaProducto[]>(`${this.baseUrl}/tallas-producto/${productoId}`);
  }

  actualizarStock(tallaProductoId: number, nuevaCantidad: number): Observable<any> {
    // Endpoint: /api/actualizar-stock
    return this.http.put(`${this.baseUrl}/actualizar-stock`, {
      tallaProductoId,  // Asegúrate que coincida con el nombre en el servidor
      nuevaCantidad
    });
  }
}