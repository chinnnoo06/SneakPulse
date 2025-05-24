import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RecuperarService } from '../../services/recuperar.service';

@Component({
  selector: 'app-recuperar',
  standalone: true,
  templateUrl: './recuperar.component.html',
  styleUrls: ['./logincrearcuenta.component.css'],
  imports: [FormsModule, CommonModule]
})
export class RecuperarComponent {
  pasoActual: number = 1;
  email: string = '';
  preguntaSeguridad: string = '';
  respuestaSeguridad: string = ''; // Respuesta correcta de la BD
  respuestaUsuario: string = '';   // Respuesta que ingresa el usuario
  nuevaContrasenia: string = '';
  confirmarContrasenia: string = '';
  mensaje: string = '';
  exito: boolean = false;
  cargando: boolean = false;

  constructor(
    private router: Router,
    private recuperarService: RecuperarService
  ) {}

  siguientePaso() {
    if (this.pasoActual === 1) {
      this.verificarEmail();
    } else if (this.pasoActual === 2) {
      this.verificarRespuesta();
    }
  }

  verificarEmail() {
    if (!this.email) {
      this.mensaje = 'Por favor ingresa tu email';
      return;
    }

    this.cargando = true;
    this.mensaje = '';
    this.respuestaUsuario = ''; // Limpiamos la respuesta del usuario al cambiar de paso

    this.recuperarService.obtenerDatosRecuperacion(this.email).subscribe({
      next: (datos) => {
        this.cargando = false;
        this.preguntaSeguridad = datos.preguntaSeguridad;
        this.respuestaSeguridad = datos.respuestaSeguridad; // Guardamos la respuesta correcta
        this.pasoActual++;
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error al obtener datos:', error);
        
        if (error.error && error.error.message === 'Usuario no encontrado') {
          this.mensaje = 'No existe un usuario con ese email';
        } else {
          this.mensaje = 'Error al conectar con el servidor';
        }
      }
    });
  }

  verificarRespuesta() {
    if (!this.respuestaUsuario) {
      this.mensaje = 'Por favor ingresa tu respuesta';
      return;
    }

    // Comparamos las respuestas (en producción esto debería hacerse en el backend)
    if (this.respuestaUsuario.trim().toLowerCase() === this.respuestaSeguridad.trim().toLowerCase()) {
      this.mensaje = '';
      this.pasoActual++;
    } else {
      this.mensaje = 'Respuesta incorrecta';
    }
  }

  anteriorPaso() {
    if (this.pasoActual > 1) {
      this.pasoActual--;
      this.mensaje = '';
      this.respuestaUsuario = ''; // Limpiamos la respuesta al volver atrás
    }
  }

  cambiarContrasenia() {
    if (this.nuevaContrasenia !== this.confirmarContrasenia) {
      this.mensaje = 'Las contraseñas no coinciden';
      this.exito = false;
      return;
    }

    if (this.nuevaContrasenia.length < 6) {
      this.mensaje = 'La contraseña debe tener al menos 6 caracteres';
      this.exito = false;
      return;
    }

    this.cargando = true;
    this.recuperarService.cambiarContrasenia(this.email, this.nuevaContrasenia).subscribe({
      next: () => {
        this.cargando = false;
        this.mensaje = 'Contraseña cambiada exitosamente';
        this.exito = true;
        
        setTimeout(() => {
          this.irIniciarSesion();
        }, 2000);
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error al cambiar contraseña:', error);
        this.mensaje = 'Error al cambiar la contraseña';
        this.exito = false;
      }
    });
  }


  irIniciarSesion() {
    this.router.navigate(['/iniciarsesion']);
  }
}