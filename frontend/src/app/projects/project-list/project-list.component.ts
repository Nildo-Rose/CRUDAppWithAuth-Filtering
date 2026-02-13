import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Project } from '../../core/services/api.service';
import { NgIf, NgFor, NgClass } from '@angular/common';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [RouterLink, FormsModule, NgIf, NgFor, NgClass],
  template: `
    <div class="container">
      <div class="toolbar">
        <h1>Projects</h1>
        <a routerLink="/projects/new" class="btn btn-primary">New project</a>
      </div>

      <div class="filters card">
        <div class="form-group" style="margin-bottom: 0;">
          <label>Search</label>
          <input type="text" placeholder="Search by name or description…" [(ngModel)]="search" (ngModelChange)="applyFilters()" />
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label>Status</label>
          <select [(ngModel)]="statusFilter" (ngModelChange)="applyFilters()">
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div class="list" *ngIf="!loading(); else loadingTpl">
        <div *ngFor="let p of projects()" class="card project-card">
          <div class="project-head">
            <a [routerLink]="['/projects', p.id]" class="project-name">{{ p.name }}</a>
            <span class="badge" [ngClass]="'badge-' + p.status">{{ p.status }}</span>
          </div>
          <p class="project-desc" *ngIf="p.description">{{ p.description }}</p>
          <div class="project-actions">
            <a [routerLink]="['/projects', p.id]" class="btn btn-secondary">View tasks</a>
            <a [routerLink]="['/projects', p.id, 'edit']" class="btn btn-secondary">Edit</a>
            <button type="button" class="btn btn-danger" (click)="delete(p)">Delete</button>
          </div>
        </div>
        <p *ngIf="projects().length === 0 && !loading()" class="empty">No projects found. Create one or adjust filters.</p>
      </div>
      <ng-template #loadingTpl><p class="loading">Loading…</p></ng-template>

      <div class="pagination" *ngIf="totalPages() > 1">
        <button type="button" class="btn btn-secondary" [disabled]="page() <= 1" (click)="goPage(page() - 1)">Previous</button>
        <span>Page {{ page() }} of {{ totalPages() }}</span>
        <button type="button" class="btn btn-secondary" [disabled]="page() >= totalPages()" (click)="goPage(page() + 1)">Next</button>
      </div>
    </div>
  `,
  styles: [`
    .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .toolbar h1 { margin: 0; font-size: 1.5rem; }
    .filters { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .filters .form-group { flex: 1; min-width: 180px; }
    .list { display: flex; flex-direction: column; gap: 1rem; }
    .project-card { display: flex; flex-direction: column; gap: 0.75rem; }
    .project-head { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
    .project-name { font-weight: 600; font-size: 1.1rem; color: var(--text); }
    .project-name:hover { text-decoration: none; color: var(--accent); }
    .project-desc { margin: 0; color: var(--text-muted); font-size: 0.95rem; }
    .project-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .empty, .loading { color: var(--text-muted); }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 1.5rem; }
  `],
})
export class ProjectListComponent implements OnInit {
  projects = signal<Project[]>([]);
  loading = signal(true);
  page = signal(1);
  totalPages = signal(1);
  search = '';
  statusFilter = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  applyFilters(): void {
    this.page.set(1);
    this.load();
  }

  goPage(p: number): void {
    this.page.set(p);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.getProjects({
      page: this.page(),
      limit: 10,
      search: this.search || undefined,
      status: this.statusFilter || undefined,
    }).subscribe({
      next: (res) => {
        this.projects.set(res.data);
        this.totalPages.set(res.pagination.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  delete(p: Project): void {
    if (!confirm(`Delete project "${p.name}" and all its tasks?`)) return;
    this.api.deleteProject(p.id).subscribe({
      next: () => this.load(),
    });
  }
}
