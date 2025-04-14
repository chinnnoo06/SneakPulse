import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';  // Importamos HttpClient
import { Observable } from 'rxjs';
import { Producto } from '../models/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private apiUrl = 'http://localhost:3000/api/productos'; // URL de la API

  constructor(private http: HttpClient) { }

  // Método para obtener los productos desde el servidor (backend)
  obtenerProducto(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);  // Solicitud GET a la API
  }
}
