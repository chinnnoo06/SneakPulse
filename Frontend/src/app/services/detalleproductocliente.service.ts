import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

interface TallaProducto {
  ID: number;
  Nombre: string;
  Cantidad: number;
}

interface PedidoActivo {
  ID: number;
}

interface DetallePedido {
  cantidad: number;
  producto_id: number;
  talla_producto_id: number;
  precio_unitario: number;
  pedido_id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DetalleProductoService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  obtenerTallasPorProducto(productoId: number): Observable<TallaProducto[]> {
    return this.http.get<TallaProducto[]>(`${this.baseUrl}/tallas-producto/${productoId}`).pipe(
      catchError(error => {
        console.error('Error al obtener tallas:', error);
        return throwError(() => new Error('Error al cargar las tallas disponibles'));
      })
    );
  }

  agregarAlCarrito(detalle: DetallePedido): Observable<any> {
    // Obtener usuario del localStorage
    const usuarioString = localStorage.getItem('usuario');
    if (!usuarioString) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const usuario = JSON.parse(usuarioString);
    const usuarioId = usuario.id;

    // Primero obtenemos el pedido activo del usuario
    return this.http.get<PedidoActivo>(`${this.baseUrl}/pedido-activo/${usuarioId}`).pipe(
      switchMap((pedido: PedidoActivo) => {
        if (!pedido || !pedido.ID) {
          return throwError(() => new Error('No se pudo obtener el carrito del usuario'));
        }

        // Agregamos el ID del pedido al detalle
        const detalleConPedido: DetallePedido = {
          ...detalle,
          pedido_id: pedido.ID
        };

        // Llamamos al endpoint para agregar el detalle
        return this.http.post(`${this.baseUrl}/agregar-detalles-pedido`, [detalleConPedido]);
      }),
      catchError(error => {
        console.error('Error en agregarAlCarrito:', error);
        return throwError(() => error.error || new Error('Error al agregar producto al carrito'));
      })
    );
  }
}