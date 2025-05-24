import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService, Credenciales, RespuestaLogin } from '../../services/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./logincrearcuenta.component.css'],
  imports: [FormsModule, CommonModule, RouterLink]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  mensajeError: string = '';
  cargando: boolean = false;
  mostrarError: boolean = false;

  constructor(
    private router: Router,
    private loginService: LoginService
  ) {}

  onSubmit() {
    if (!this.email || !this.password) {
      this.mensajeError = 'Por favor completa todos los campos';
      this.mostrarError = true;
      setTimeout(() => this.mostrarError = false, 3000);
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    this.mostrarError = false;

    const credenciales: Credenciales = {
      email: this.email,
      password: this.password
    };

    this.loginService.iniciarSesion(credenciales).subscribe({
      next: (respuesta: RespuestaLogin) => {
        this.cargando = false;
        
        if (respuesta.success && respuesta.token && respuesta.usuario) {
          // Guardar token y datos de usuario
          localStorage.setItem('token', respuesta.token);
          localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));
          
          // Redirigir según el tipo de usuario
          if (respuesta.usuario.tipoUsuario === 1) {
            this.router.navigate(['/inicio-cliente']);
          } else if (respuesta.usuario.tipoUsuario === 2) {
            this.router.navigate(['/inicio-admin']);
          } else {
            this.mostrarMensajeError('Tipo de usuario no reconocido');
          }
        } else {
          this.mostrarMensajeError(respuesta.message || 'Error al iniciar sesión');
        }
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error al iniciar sesión:', error);
        
        if (error.status === 401) {
          this.mostrarMensajeError('Contraseña incorrecta');
        } else if (error.status === 404) {
          this.mostrarMensajeError('Usuario no encontrado');
        } else {
          this.mostrarMensajeError('Error al conectar con el servidor. Intenta nuevamente.');
        }
      }
    });
  }

  private mostrarMensajeError(mensaje: string) {
    this.mensajeError = mensaje;
    this.mostrarError = true;
    setTimeout(() => this.mostrarError = false, 3000);
  }

  irCrearCuenta() {
    this.router.navigate(['/crearcuenta']);
  }
}