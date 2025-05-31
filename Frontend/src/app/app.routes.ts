import { Routes } from '@angular/router';
import { LoginComponent } from './components/login-crearcuenta/login.component';
import { CrearCuentaComponent } from './components/login-crearcuenta/crearcuenta.component';
import { CatalogoComponent } from './components/catalogo/catalogo.component';
import { InventarioComponent } from './components/inventario/inventario.component';
import { RecuperarComponent } from './components/login-crearcuenta/recuperar.component';
import { DetallesproductoAdminComponent } from './components/detalle-producto/detalleproductoadmin.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'iniciarsesion', component: LoginComponent },
  { path: 'crearcuenta', component: CrearCuentaComponent },
  { path: 'recuperar', component: RecuperarComponent },
  { path: 'inicio-cliente', component: CatalogoComponent },
  { path: 'inicio-admin', component: InventarioComponent },
  { path: 'detallesproducto-admin/:id', component: DetallesproductoAdminComponent }
];