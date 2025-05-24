import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CrearCuentaService, Usuario } from '../../services/crearcuenta.service';
import { CommonModule } from '@angular/common';
import 'bootstrap/dist/css/bootstrap.min.css';

@Component({
  selector: 'app-crear-cuenta',
  standalone: true,
  templateUrl: './crearcuenta.component.html',
  styleUrls: ['./logincrearcuenta.component.css'],
  imports: [FormsModule, CommonModule, RouterLink]
})
export class CrearCuentaComponent {
  nombre: string = '';
  apellido: string = '';
  correo: string = '';
  direccion: string = '';
  password: string = '';
  confirmPassword: string = '';
  preguntaSeguridad: string = '';
  respuestaSeguridad: string = '';
  mensajeError: string = '';
  mensajeExito: string = '';
  mostrarError: boolean = false;

  constructor(
    private router: Router,
    private crearCuentaService: CrearCuentaService
  ) {}

  onSubmit() {
    // Validación de contraseñas coincidentes
    if (this.password !== this.confirmPassword) {
      this.mostrarMensajeError('Las contraseñas no coinciden');
      return;
    }

    // Validación de campos obligatorios
    if (!this.preguntaSeguridad || !this.respuestaSeguridad) {
      this.mostrarMensajeError('Debes seleccionar una pregunta de seguridad y proporcionar una respuesta');
      return;
    }

    const usuario: Usuario = {
      nombre: this.nombre,
      apellido: this.apellido,
      correo: this.correo,
      direccion: this.direccion,
      password: this.password,
      preguntaSeguridad: this.preguntaSeguridad,
      respuestaSeguridad: this.respuestaSeguridad
    };

    this.crearCuentaService.crearCuenta(usuario).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.mensajeExito = 'Cuenta creada exitosamente!';
          this.mensajeError = '';
          this.mostrarError = false;
          setTimeout(() => {
            this.router.navigate(['/iniciarsesion']);
          }, 2000);
        } else {
          this.mostrarMensajeError(response.message || 'Error al crear cuenta');
        }
      },
      error: (error) => {
        console.error('Error completo:', error);
        
        if (error.error) {
          // Manejo específico de errores del backend
          switch (error.error.code) {
            case 'EMAIL_EXISTS':
              this.mostrarMensajeError(error.error.message);
              break;
            case 'VALIDATION_ERROR':
              this.mostrarMensajeError('Por favor completa todos los campos correctamente');
              break;
            default:
              this.mostrarMensajeError(error.error.message || 
                'Error al conectar con el servidor. Verifica tu conexión.');
          }
        } else {
          // Errores de red o otros
          if (error.status === 0) {
            this.mostrarMensajeError('No se pudo conectar al servidor. Verifica tu conexión a internet.');
          } else {
            this.mostrarMensajeError('Ocurrió un error inesperado. Por favor intenta nuevamente.');
          }
        }
      }
    });
  }

  private mostrarMensajeError(mensaje: string) {
    this.mensajeError = mensaje;
    this.mensajeExito = '';
    this.mostrarError = true;
    setTimeout(() => this.mostrarError = false, 5000);
  }

  irIniciarSesion() {
    this.router.navigate(['/iniciarsesion']);
  }

  isFormValid(): boolean {
    return (
      this.nombre.trim() !== '' &&
      this.apellido.trim() !== '' &&
      this.correo.trim() !== '' &&
      this.direccion.trim() !== '' &&
      this.password.trim() !== '' &&
      this.confirmPassword.trim() !== '' &&
      this.preguntaSeguridad.trim() !== '' &&
      this.respuestaSeguridad.trim() !== '' &&
      this.password === this.confirmPassword
    );
  }
}