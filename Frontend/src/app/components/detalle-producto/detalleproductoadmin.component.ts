import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Producto } from '../../models/producto';
import { CommonModule } from '@angular/common';
import { DetalleProductoService } from '../../services/detalleproductoadmin.service';

interface TallaProducto {
  ID: number;
  Nombre: string;
  Cantidad: number;
}

@Component({
  selector: 'app-detallesproducto-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalleproductoadmin.component.html',
  styleUrls: ['./detalleproducto.component.css']
})
export class DetallesproductoAdminComponent implements OnInit {
  producto: Producto | null = null;
  tallas: TallaProducto[] = [];
  loading = true;
  error = '';

  constructor(
    private router: Router,
    private detalleProductoService: DetalleProductoService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.producto = navigation.extras.state['producto'] as Producto;
    }
  }

  ngOnInit(): void {
    if (this.producto) {
      this.obtenerTallasProducto(this.producto.ID);
    }
  }

  obtenerTallasProducto(productoId: number): void {
    this.detalleProductoService.obtenerTallasPorProducto(productoId).subscribe({
      next: (tallas) => {
        this.tallas = tallas;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener tallas:', err);
        this.error = 'Error al cargar las tallas disponibles';
        this.loading = false;
      }
    });
  }

  aumentarCantidad(talla: TallaProducto): void {
    const nuevaCantidad = talla.Cantidad + 1;
    this.detalleProductoService.actualizarStock(talla.ID, nuevaCantidad).subscribe({
      next: () => {
        // Actualizar la vista localmente
        const tallaIndex = this.tallas.findIndex(t => t.ID === talla.ID);
        if (tallaIndex !== -1) {
          this.tallas[tallaIndex].Cantidad = nuevaCantidad;
        }
      },
      error: (err) => {
        console.error('Error al aumentar stock:', err);
        this.error = 'Error al actualizar el stock';
      }
    });
  }

  disminuirCantidad(talla: TallaProducto): void {
    if (talla.Cantidad <= 0) return;
    
    const nuevaCantidad = talla.Cantidad - 1;
    this.detalleProductoService.actualizarStock(talla.ID, nuevaCantidad).subscribe({
      next: () => {
        // Actualizar la vista localmente
        const tallaIndex = this.tallas.findIndex(t => t.ID === talla.ID);
        if (tallaIndex !== -1) {
          this.tallas[tallaIndex].Cantidad = nuevaCantidad;
        }
      },
      error: (err) => {
        console.error('Error al disminuir stock:', err);
        this.error = 'Error al actualizar el stock';
      }
    });
  }
}