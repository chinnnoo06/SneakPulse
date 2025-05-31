import { Component } from '@angular/core';
import { Producto } from '../../models/producto';
import { InventarioService } from '../../services/inventario.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  terminoBusqueda: string = '';

  constructor(
    private inventarioService: InventarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.inventarioService.obtenerProducto().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.productosFiltrados = [...productos]; // Copia inicial para filtrado
      },
      error: (err) => {
        console.error('Error al obtener los productos:', err);
      }
    });
  }

  verDetalles(producto: Producto) {
    this.router.navigate(['/detallesproducto-admin', producto.ID], {
      state: { producto: producto }
    });
  }

  filtrarProductos() {
    if (!this.terminoBusqueda) {
      this.productosFiltrados = [...this.productos];
      return;
    }

    const termino = this.terminoBusqueda.toLowerCase();
    this.productosFiltrados = this.productos.filter(producto =>
      producto.Nombre.toLowerCase().includes(termino)
    );
  }
}