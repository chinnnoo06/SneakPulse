// recuperar.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DatosRecuperacion {
    preguntaSeguridad: string;
    respuestaSeguridad: string;
}

@Injectable({
    providedIn: 'root'
})
export class RecuperarService {
    private apiUrl = 'http://localhost:3000/api/obtenerdatosrecuperar';
    private cambiarContraseniaUrl = 'http://localhost:3000/api/cambiarcontrasenia';

    constructor(private http: HttpClient) { }

    obtenerDatosRecuperacion(email: string): Observable<DatosRecuperacion> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        
        return this.http.post<DatosRecuperacion>(this.apiUrl, { email }, { headers });
    }

    cambiarContrasenia(email: string, nuevaContrasenia: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        
        return this.http.post(this.cambiarContraseniaUrl, { email, nuevaContrasenia }, { headers });
    }
}