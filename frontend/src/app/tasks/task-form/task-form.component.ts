import { Component, input, output, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService, Task } from '../../core/services/api.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <div class="task-form card">
      <h3>{{ task() ? 'Edit task' : 'New task' }}</h3>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="title">Title</label>
          <input id="title" type="text" formControlName="title" placeholder="Task title" />
          <div class="error" *ngIf="form.get('title')?.invalid && form.get('title')?.touched">Title is required</div>
        </div>
        <div class="form-group">
          <label for="description">Description</label>
          <textarea id="description" formControlName="description" rows="2" placeholder="Optional"></textarea>
        </div>
        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" formControlName="status">
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div class="form-group">
          <label for="priority">Priority</label>
          <select id="priority" formControlName="priority">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div class="error" *ngIf="error">{{ error }}</div>
        <div class="actions">
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid || loading">{{ task() ? 'Save' : 'Add task' }}</button>
          <button type="button" class="btn btn-secondary" (click)="cancel.emit()">Cancel</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .task-form { margin-bottom: 1rem; }
    .task-form h3 { margin: 0 0 1rem 0; font-size: 1rem; }
    .actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
  `],
})
export class TaskFormComponent {
  projectId = input.required<number>();
  task = input<Task | null>(null);
  saved = output<void>();
  cancel = output<void>();

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    status: ['pending' as 'pending' | 'in_progress' | 'completed'],
    priority: ['medium' as 'low' | 'medium' | 'high'],
  });
  error = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
  ) {
    effect(() => {
      const t = this.task();
      if (t) this.form.patchValue({ title: t.title, description: t.description || '', status: t.status as 'pending' | 'in_progress' | 'completed', priority: t.priority as 'low' | 'medium' | 'high' });
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.loading) return;
    this.error = '';
    this.loading = true;
    const body = this.form.getRawValue();
    const pid = this.projectId();
    const t = this.task();
    const req = t
      ? this.api.updateTask(pid, t.id, body)
      : this.api.createTask(pid, body);
    req.subscribe({
      next: () => {
        this.loading = false;
        this.saved.emit();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Request failed';
      },
    });
  }
}
