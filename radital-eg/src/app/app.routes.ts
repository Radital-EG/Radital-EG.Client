import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { TechnicianDashboardComponent } from './pages/technician-dashboard/technician-dashboard';
import { ReportingComponent } from './pages/reporting/reporting';
import { ImagingRequestComponent } from './pages/imaging-request/imaging-request.component';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'login', component: Login },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'technician', component: TechnicianDashboardComponent },
  { path: 'reporting', component: ReportingComponent },
  { path: 'imaging-request', component: ImagingRequestComponent }
];