import { Component, OnInit } from '@angular/core';
import { Producto } from '../../models/producto';
import { ProductoService } from '../../services/producto.service';
import { CommonModule } from '@angular/common';  // Asegúrate de importar CommonModule
import { Router } from '@angular/router';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule],  // Importa CommonModule aquí
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit {

  productos: Producto[] = [];  // Lista de productos

  constructor(
    private productoService: ProductoService,  // Servicio para obtener productos
    private router: Router                    // Router para navegar entre páginas
  ) {}

  ngOnInit(): void {
    // Obtener los productos desde el servicio (ahora desde el backend)
    this.productoService.obtenerProducto().subscribe({
      next: (productos) => {
        this.productos = productos;  // Asignamos los productos obtenidos desde el backend
      },
      error: (err) => {
        console.error('Error al obtener los productos:', err);
      }
    });
  }

  irAlCarrito(): void {
    this.router.navigate(['/carrito']);  // Navegar al carrito
  }

  irAlInventario(): void {
    this.router.navigate(['/inventario']);  // Navegar al inventario
  }
}
