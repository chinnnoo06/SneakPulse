import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { CarritoService } from '../../services/carrito.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface ProductoCarritoServidor {
  id: number;
  producto_id: number;
  nombre: string;
  imagen_url: string;
  precio_unitario: number | string;
  cantidad: number;
  precio_total: number | string;
  talla_nombre: string;
  talla_producto_id: number;
}

interface ProductoCarrito {
  id: number;
  producto_id: number;
  nombre: string;
  imagen_url: string;
  precio_unitario: number;
  cantidad: number;
  precio_total: number;
  talla_nombre: string;
  talla_producto_id: number;
}

interface DetallesCompraXML {
  fecha: string;
  id_transaccion: string;
  comprador: {
    nombre: string;
    email: string;
  };
  productos: Array<{
    nombre: string;
    precio_unitario: number;
    cantidad: number;
    precio_total: number;
    talla: string;
  }>;
  total: number;
}

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DecimalPipe],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit, AfterViewInit {
  @ViewChild('paypalButtonContainer', { static: false }) paypalButtonContainer!: ElementRef;

  productos: ProductoCarrito[] = [];
  loading = true;
  error: string | null = null;
  totalCarrito: number = 0;
  actualizando: { [key: number]: boolean } = {};
  paypalButtonRendered = false;

  constructor(
    private carritoService: CarritoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.obtenerCarrito();
  }

  ngAfterViewInit(): void {
    const observer = new MutationObserver((mutations) => {
      if (this.paypalButtonContainer?.nativeElement && 
          this.productos.length > 0 && 
          this.totalCarrito > 0) {
        this.loadPayPalButton();
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      if (this.productos.length > 0 && this.totalCarrito > 0) {
        this.loadPayPalButton();
      }
    }, 1000);
  }

  obtenerCarrito(): void {
    this.loading = true;
    this.error = null;
    
    this.carritoService.obtenerCarrito().subscribe({
      next: (data) => {
        this.productos = data.productos.map((producto: ProductoCarritoServidor) => ({
          id: producto.id,
          producto_id: producto.producto_id,
          nombre: producto.nombre,
          imagen_url: producto.imagen_url,
          precio_unitario: this.parseDecimal(producto.precio_unitario),
          cantidad: producto.cantidad,
          precio_total: this.parseDecimal(producto.precio_total),
          talla_nombre: producto.talla_nombre,
          talla_producto_id: producto.talla_producto_id
        }));
        
        this.totalCarrito = this.parseDecimal(data.total);
        this.loading = false;
        this.loadPayPalButton();
      },
      error: (err) => {
        console.error('Error al obtener carrito:', err);
        this.error = err.error?.message || 'Error al cargar el carrito';
        this.loading = false;
      }
    });
  }

  loadPayPalButton(): void {
    if (this.loading || this.productos.length === 0 || this.totalCarrito <= 0) {
      return;
    }

    if (!this.paypalButtonContainer?.nativeElement) {
      console.warn('Contenedor de PayPal no disponible en el DOM');
      return;
    }

    const container = this.paypalButtonContainer.nativeElement;
    
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    if (typeof window === 'undefined' || !(window as any).paypal) {
      console.warn('PayPal SDK no está disponible');
      return;
    }

    try {
      if (!document.body.contains(container)) {
        console.error('El contenedor ya no está en el DOM');
        return;
      }

      (window as any).paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          tagline: false,
          height: 40
        },
        fundingSource: (window as any).paypal.FUNDING.PAYPAL,
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: this.totalCarrito.toFixed(2),
                currency_code: 'MXN',
                breakdown: {
                  item_total: {
                    value: this.totalCarrito.toFixed(2),
                    currency_code: 'MXN'
                  }
                }
              },
              items: this.productos.map(producto => ({
                name: producto.nombre,
                unit_amount: {
                  value: producto.precio_unitario.toFixed(2),
                  currency_code: 'MXN'
                },
                quantity: producto.cantidad.toString(),
                sku: producto.id.toString()
              }))
            }]
          });
        },
        onApprove: (data: any, actions: any) => {
          return actions.order.capture().then(async (details: any) => {
            const usuarioString = localStorage.getItem('usuario');
            if (!usuarioString) {
              throw new Error('Usuario no autenticado');
            }
            
            const usuario = JSON.parse(usuarioString);
            const usuarioId = usuario.id;

            try {
              const pedidoResponse: any = await this.carritoService.obtenerPedidoActivo(usuarioId).toPromise();
              const pedidoId = pedidoResponse.ID;
              await this.carritoService.limpiarCarrito(pedidoId).toPromise();
              
              // Generar y descargar XML del ticket
              this.generarYDescargarXML(details);
              
              alert(`Pago completado por ${details.payer.name.given_name}! ID de transacción: ${details.id}`);
              this.router.navigate(['/inicio-cliente']);
            } catch (error) {
              console.error('Error al limpiar el carrito después del pago:', error);
              alert('Pago completado, pero hubo un error al limpiar el carrito. Por favor contacta al soporte.');
            }
          });
        },
        onError: (err: any) => {
          console.error('Error en el pago con PayPal:', err);
          this.error = 'Ocurrió un error al procesar el pago con PayPal';
        },
        onCancel: (data: any) => {
          console.log('Pago cancelado por el usuario', data);
        }
      }).render(container);
      
      this.paypalButtonRendered = true;
    } catch (error) {
      console.error('Error al renderizar botón PayPal:', error);
      setTimeout(() => this.loadPayPalButton(), 500);
    }
  }

  generarYDescargarXML(detallesPayPal: any): void {
    const datosXML: DetallesCompraXML = {
      fecha: new Date().toISOString(),
      id_transaccion: detallesPayPal.id,
      comprador: {
        nombre: detallesPayPal.payer.name.given_name + ' ' + (detallesPayPal.payer.name.surname || ''),
        email: detallesPayPal.payer.email_address
      },
      productos: this.productos.map(producto => ({
        nombre: producto.nombre,
        precio_unitario: producto.precio_unitario,
        cantidad: producto.cantidad,
        precio_total: producto.precio_total,
        talla: producto.talla_nombre
      })),
      total: this.totalCarrito
    };

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<ticket_compra>\n`;
    xml += `  <fecha>${datosXML.fecha}</fecha>\n`;
    xml += `  <transaccion id="${datosXML.id_transaccion}"/>\n`;
    xml += `  <comprador>\n`;
    xml += `    <nombre>${this.escapeXml(datosXML.comprador.nombre)}</nombre>\n`;
    xml += `    <email>${this.escapeXml(datosXML.comprador.email)}</email>\n`;
    xml += `  </comprador>\n`;
    xml += `  <productos>\n`;
    
    datosXML.productos.forEach(producto => {
      xml += `    <producto>\n`;
      xml += `      <nombre>${this.escapeXml(producto.nombre)}</nombre>\n`;
      xml += `      <precio_unitario>${producto.precio_unitario.toFixed(2)}</precio_unitario>\n`;
      xml += `      <cantidad>${producto.cantidad}</cantidad>\n`;
      xml += `      <precio_total>${producto.precio_total.toFixed(2)}</precio_total>\n`;
      xml += `      <talla>${this.escapeXml(producto.talla)}</talla>\n`;
      xml += `    </producto>\n`;
    });
    
    xml += `  </productos>\n`;
    xml += `  <total>${datosXML.total.toFixed(2)}</total>\n`;
    xml += `</ticket_compra>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket_compra_${datosXML.id_transaccion}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }

  parseDecimal(value: any): number {
    if (typeof value === 'number') return value;
    
    const stringValue = String(value).trim();
    
    if (/^\d+\.\d{2}$/.test(stringValue)) {
      return parseFloat(stringValue);
    }
    
    if (/^\d{1,3}(,\d{3})*\.\d{2}$/.test(stringValue)) {
      return parseFloat(stringValue.replace(/,/g, ''));
    }
    
    const parsed = parseFloat(stringValue);
    return isNaN(parsed) ? 0 : parsed;
  }

  actualizarCantidad(producto: ProductoCarrito, nuevaCantidad: number): void {
    if (nuevaCantidad < 1) {
      return;
    }
    
    this.actualizando[producto.id] = true;
    
    this.carritoService.actualizarCantidad(producto.id, nuevaCantidad).subscribe({
      next: (response) => {
        producto.cantidad = nuevaCantidad;
        producto.precio_total = producto.precio_unitario * nuevaCantidad;
        this.calcularTotal();
        this.actualizando[producto.id] = false;
        this.loadPayPalButton();
      },
      error: (err) => {
        console.error('Error al actualizar cantidad:', err);
        this.actualizando[producto.id] = false;
        
        this.error = err.error?.message || 'Error al actualizar la cantidad';
        setTimeout(() => this.error = null, 5000);
        
        this.obtenerCarrito();
      }
    });
  }

  eliminarProducto(id: number): void {
    if (confirm('¿Estás seguro de eliminar este producto del carrito?')) {
      this.carritoService.eliminarProducto(id).subscribe({
        next: () => {
          this.productos = this.productos.filter(p => p.id !== id);
          this.calcularTotal();
          this.loadPayPalButton();
        },
        error: (err) => {
          console.error('Error al eliminar producto:', err);
          this.error = err.error?.message || 'Error al eliminar el producto';
          setTimeout(() => this.error = null, 5000);
        }
      });
    }
  }

  calcularTotal(): void {
    this.totalCarrito = this.productos.reduce(
      (total, producto) => total + (producto.precio_unitario * producto.cantidad), 
      0
    );
  }

  procederAPago(): void {
    if (this.productos.length === 0) {
      this.error = 'No hay productos en el carrito';
      return;
    }
    this.router.navigate(['/pago']);
  }
}