import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Producto } from '../../models/producto';
import { CommonModule } from '@angular/common';
import { DetalleProductoService } from '../../services/detalleproductocliente.service';

interface TallaProducto {
  ID: number;
  Nombre: string;
  Cantidad: number;
}

@Component({
  selector: 'app-detallesproducto-cliente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalleproductocliente.component.html',
  styleUrls: ['./detalleproducto.component.css']
})
export class DetallesproductoClienteComponent implements OnInit {
  producto: Producto | null = null;
  tallas: TallaProducto[] = [];
  tallaSeleccionada: TallaProducto | null = null;
  cantidad: number = 1;
  loading = true;
  error = '';
  intentoAgregar = false;
  agregandoAlCarrito = false;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;

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

  seleccionarTalla(talla: TallaProducto): void {
    if (talla.Cantidad > 0) {
      this.tallaSeleccionada = talla;
      this.cantidad = 1;
      this.intentoAgregar = false;
    }
  }

  incrementarCantidad(): void {
    if (this.tallaSeleccionada && this.cantidad < this.tallaSeleccionada.Cantidad) {
      this.cantidad++;
    }
  }

  decrementarCantidad(): void {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  agregarAlCarrito(): void {
    // Resetear mensajes
    this.mensajeExito = null;
    this.mensajeError = null;

    // Validar que haya una talla seleccionada
    if (!this.tallaSeleccionada) {
      this.intentoAgregar = true;
      return;
    }

    // Validar que haya un producto
    if (!this.producto) {
      console.error('No hay producto seleccionado');
      return;
    }

    this.agregandoAlCarrito = true;

    try {
      // Obtener usuario del localStorage
      const usuarioString = localStorage.getItem('usuario');
      if (!usuarioString) {
        throw new Error('Debes iniciar sesión para agregar productos al carrito');
      }

      const usuario = JSON.parse(usuarioString);
      const usuarioId = usuario.id;

      // Crear objeto con los datos del detalle del pedido
      const detallePedido = {
        cantidad: this.cantidad,
        producto_id: this.producto.ID,
        talla_producto_id: this.tallaSeleccionada.ID,
        precio_unitario: this.producto.Precio
      };

      // Llamar al servicio para agregar al carrito
      this.detalleProductoService.agregarAlCarrito(detallePedido).subscribe({
        next: (response) => {
          console.log('Producto agregado al carrito:', response);
          this.mensajeExito = 'Producto agregado al carrito correctamente';
          this.agregandoAlCarrito = false;
          
          // Resetear selección
          this.tallaSeleccionada = null;
          this.cantidad = 1;
        },
        error: (err) => {
          console.error('Error al agregar al carrito:', err);
          this.mensajeError = err.error?.message || 'Error al agregar producto al carrito';
          this.agregandoAlCarrito = false;
        }
      });
    } catch (error) {
      console.error('Error:', error);
      this.mensajeError = error instanceof Error ? error.message : 'Ocurrió un error inesperado';
      this.agregandoAlCarrito = false;
    }
  }
}