import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface CarritoResponse {
  productos: any[];
  total: number | string;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  obtenerCarrito(): Observable<any> {
    const usuarioString = localStorage.getItem('usuario');
    if (!usuarioString) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    try {
      const usuario = JSON.parse(usuarioString);
      const usuarioId = usuario.id;

      return this.http.get<any>(`${this.apiUrl}/obtener-carrito/${usuarioId}`).pipe(
        catchError(error => {
          console.error('Error en la petición:', error);
          let errorMessage = 'Error al obtener el carrito';
          
          if (error.error instanceof ErrorEvent) {
            errorMessage = `Error: ${error.error.message}`;
          } else {
            errorMessage = error.error?.message || error.message || error.statusText;
          }
          
          return throwError(() => new Error(errorMessage));
        })
      );
    } catch (e) {
      return throwError(() => new Error('Error al procesar datos de usuario'));
    }
  }

  actualizarCantidad(detalleId: number, nuevaCantidad: number): Observable<any> {
    if (!detalleId || !nuevaCantidad || nuevaCantidad < 1) {
      return throwError(() => new Error('Parámetros inválidos para actualizar cantidad'));
    }

    return this.http.put(`${this.apiUrl}/actualizar-cantidad/${detalleId}`, { 
      cantidad: nuevaCantidad 
    }).pipe(
      catchError(error => {
        console.error('Error en actualizarCantidad:', error);
        
        let errorMessage = 'Error al actualizar cantidad';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return throwError(() => ({
          success: false,
          message: errorMessage,
          error: error.error || error
        }));
      })
    );
  }

  eliminarProducto(detalleId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar-producto/${detalleId}`).pipe(
      catchError(error => {
        console.error('Error en eliminarProducto:', error);
        return throwError(() => error.error || new Error('Error al eliminar producto'));
      })
    );
  }

  obtenerPedidoActivo(usuarioId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pedido-activo/${usuarioId}`).pipe(
      catchError(error => {
        console.error('Error al obtener pedido activo:', error);
        return throwError(() => error.error || new Error('Error al obtener pedido activo'));
      })
    );
  }

  limpiarCarrito(pedidoId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/limpiar-carrito/${pedidoId}`).pipe(
      catchError(error => {
        console.error('Error al limpiar carrito:', error);
        return throwError(() => error.error || new Error('Error al limpiar carrito'));
      })
    );
  }
}