import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PerfilService } from '../../services/perfil.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, NgIf],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  usuario: any = {
    Nombre: '',
    Apellido: '',
    Email: '',
    Direccion: '',
    Pregunta_Seguridad: '',
    Respuesta_Seguridad: ''
  };
  modoEdicion = false;
  mensajeExito = '';
  mensajeError = '';
  cargando = true;

  constructor(
    private router: Router,
    private perfilService: PerfilService
  ) {}

  ngOnInit(): void {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario(): void {
    try {
      const usuarioData = localStorage.getItem('usuario');
      
      if (!usuarioData) {
        this.mensajeError = 'No se encontró sesión activa';
        this.cargando = false;
        return;
      }

      const usuario = JSON.parse(usuarioData);
      
      if (!usuario || !usuario.id) {
        this.mensajeError = 'Datos de usuario incompletos';
        this.cargando = false;
        return;
      }

      this.cargarPerfil(usuario.id);
    } catch (error) {
      console.error('Error al parsear datos de usuario:', error);
      this.mensajeError = 'Error al cargar los datos de sesión';
      this.cargando = false;
    }
  }

cargarPerfil(usuarioId: number): void {
  this.perfilService.obtenerPerfil(usuarioId).subscribe({
    next: (response) => {
    const data = response.data; // accede a la propiedad "data" interna

    this.usuario = {
        Nombre: data.Nombre || '',
        Apellido: data.Apellido || '',
        Email: data.Email || '',
        Direccion: data.Direccion || '',
        Pregunta_Seguridad: data.Pregunta_Seguridad || '',
        Respuesta_Seguridad: data.Respuesta_Seguridad || ''
    };

    this.cargando = false;
    }
  });
}

  toggleEdicion(): void {
    this.modoEdicion = !this.modoEdicion;
    this.mensajeExito = '';
    this.mensajeError = '';
  }

  guardarCambios(): void {
    try {
      const usuarioData = localStorage.getItem('usuario');
      
      if (!usuarioData) {
        this.mensajeError = 'No se encontró sesión activa';
        return;
      }

      const usuario = JSON.parse(usuarioData);
      
      if (!usuario || !usuario.id) {
        this.mensajeError = 'Datos de usuario incompletos';
        return;
      }

      this.perfilService.actualizarPerfil(usuario.id, this.usuario).subscribe({
        next: () => {
          this.mensajeExito = 'Perfil actualizado correctamente';
          this.modoEdicion = false;
          setTimeout(() => this.mensajeExito = '', 3000);
          
          // Actualizar localStorage
          const usuarioActualizado = {
            ...usuario,
            nombre: this.usuario.Nombre,
            apellido: this.usuario.Apellido,
            email: this.usuario.Email
          };
          localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
        },
        error: (err) => {
          console.error('Error al actualizar perfil:', err);
          this.mensajeError = 'Error al actualizar el perfil';
        }
      });
    } catch (error) {
      console.error('Error al parsear datos de usuario:', error);
      this.mensajeError = 'Error al procesar la solicitud';
    }
  }

  cerrarSesion(): void {
    localStorage.removeItem('usuario');
    this.router.navigate(['/iniciarsesion']);
  }
}