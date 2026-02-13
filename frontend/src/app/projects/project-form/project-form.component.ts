import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  template: `
    <div class="container">
      <div class="toolbar">
        <a routerLink="/projects" class="back">← Projects</a>
        <h1>{{ isEdit ? 'Edit project' : 'New project' }}</h1>
      </div>
      <div class="card form-card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name">Name</label>
            <input id="name" type="text" formControlName="name" placeholder="Project name" />
            <div class="error" *ngIf="form.get('name')?.invalid && form.get('name')?.touched">Name is required</div>
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" formControlName="description" rows="3" placeholder="Optional description"></textarea>
          </div>
          <div class="form-group">
            <label for="status">Status</label>
            <select id="status" formControlName="status">
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div class="error" *ngIf="error">{{ error }}</div>
          <div class="actions">
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid || loading">
              {{ isEdit ? 'Save' : 'Create' }}
            </button>
            <a routerLink="/projects" class="btn btn-secondary">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .toolbar { margin-bottom: 1.5rem; }
    .back { color: var(--text-muted); font-size: 0.9rem; }
    .toolbar h1 { margin: 0.5rem 0 0 0; font-size: 1.5rem; }
    .form-card { max-width: 480px; }
    .actions { display: flex; gap: 0.75rem; margin-top: 1rem; }
  `],
})
export class ProjectFormComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    status: ['active' as 'active' | 'archived' | 'completed'],
  });
  isEdit = false;
  id: number | null = null;
  error = '';
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.id = +id;
      this.api.getProject(this.id).subscribe({
        next: (p) => this.form.patchValue({ name: p.name, description: p.description || '', status: p.status as 'active' | 'archived' | 'completed' }),
        error: () => this.router.navigate(['/projects']),
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.loading) return;
    this.error = '';
    this.loading = true;
    const body = this.form.getRawValue();
    const req = this.isEdit && this.id
      ? this.api.updateProject(this.id, body)
      : this.api.createProject(body);
    req.subscribe({
      next: (p) => this.router.navigate(['/projects', p.id]),
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Request failed';
      },
    });
  }
}
