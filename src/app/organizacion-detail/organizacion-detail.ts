import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrganizacionService } from '../services/organizacion.service';
import { UsuarioService } from '../services/usuario.service';
import { Organizacion } from '../models/organizacion.model';
import { Usuario } from '../models/usuario.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-organizacion-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './organizacion-detail.html',
  styleUrls: ['./organizacion-detail.css'],
})
export class OrganizacionDetail implements OnInit {
  organizacion: Organizacion | null = null;
  allUsuarios: Usuario[] = [];
  selectedUsuarioId: string = '';
  loading = true;
  errorMsg = '';

  constructor(
    private route: ActivatedRoute,
    private orgApi: OrganizacionService,
    private userApi: UsuarioService,
    private cdr: ChangeDetectorRef
  ) { }


  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadData(id);
    }
  }

  loadData(id: string): void {
    this.loading = true;
    this.orgApi.getOrganizacionById(id).subscribe({
      next: (res) => {
        console.log('Organización cargada:', res);
        this.organizacion = res;
        this.loading = false;
        this.cdr.detectChanges(); // Forzar detección de cambios
        this.loadAllUsuarios();
      },
      error: (err) => {
        console.error('Error al cargar organización:', err);
        this.errorMsg = 'Error al cargar la organización.';
        this.loading = false;
        this.cdr.detectChanges();
      },

    });
  }

  loadAllUsuarios(): void {
    this.userApi.getUsuarios().subscribe({
      next: (res) => {
        console.log('Usuarios cargados:', res.length);
        // Filtrar usuarios que no pertenecen a esta organización
        this.allUsuarios = res.filter(u => {
          const orgId = typeof u.organizacion === 'string' ? u.organizacion : u.organizacion?._id;
          return orgId !== this.organizacion?._id;
        });
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar usuarios:', err)

    });
  }

  vincularUsuario(): void {
    if (!this.selectedUsuarioId || !this.organizacion) return;

    const user = this.allUsuarios.find(u => u._id === this.selectedUsuarioId);
    if (!user) return;

    this.userApi.updateUsuario(
      user._id,
      undefined,
      undefined,
      undefined,
      this.organizacion._id
    ).subscribe({
      next: () => {
        window.location.reload();
      },
      error: (err) => console.error('Error al vincular usuario:', err)
    });
  }

  desvincularUsuario(userId: string): void {
    if (!this.organizacion) return;

    const user = this.organizacion.usuarios?.find(u => u._id === userId);
    if (!user) return;

    this.userApi.updateUsuario(
      user._id,
      undefined,
      undefined,
      undefined,
      '' // Desvincular
    ).subscribe({
      next: () => {
        window.location.reload();
      },
      error: (err) => console.error('Error al desvincular usuario:', err)
    });
  }
}
