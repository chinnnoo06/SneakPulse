import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderService } from '../../services/header.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-header-cliente',
  standalone: true,
  imports: [RouterModule, CommonModule, NgIf],
  templateUrl: './headercliente.component.html',
  styleUrls: ['./headerfooter.component.css']
})
export class HeaderClientComponent implements OnInit, OnDestroy {
  tieneCarrito: boolean = false;
  cargandoCarrito: boolean = true;
  private intervalo: any;

  constructor(
    private router: Router,
    private headerService: HeaderService
  ) {}

  ngOnInit(): void {
    this.verificarCarrito();
    // Configurar intervalo para verificar cada segundo
    this.intervalo = setInterval(() => {
      this.verificarCarrito();
    }, 1000);
  }

  ngOnDestroy(): void {
    // Limpiar el intervalo cuando el componente se destruye
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  verificarCarrito(): void {
    try {
      const usuarioData = localStorage.getItem('usuario');
      
      if (!usuarioData) {
        this.cargandoCarrito = false;
        this.tieneCarrito = false;
        return;
      }

      const usuario = JSON.parse(usuarioData);
      
      if (!usuario || !usuario.id) {
        this.cargandoCarrito = false;
        this.tieneCarrito = false;
        return;
      }

      this.headerService.verificarCarritoActivo(usuario.id).subscribe({
        next: (tieneItems: boolean) => {
          this.tieneCarrito = tieneItems;
          this.cargandoCarrito = false;
        },
        error: (err: any) => {
          console.error('Error al verificar carrito:', err);
          this.tieneCarrito = false;
          this.cargandoCarrito = false;
        }
      });
    } catch (error: any) {
      console.error('Error al parsear datos de usuario:', error);
      this.tieneCarrito = false;
      this.cargandoCarrito = false;
    }
  }
}