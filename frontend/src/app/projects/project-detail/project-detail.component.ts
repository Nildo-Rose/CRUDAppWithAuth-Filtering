import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Project, Task } from '../../core/services/api.service';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { TaskFormComponent } from '../../tasks/task-form/task-form.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, NgIf, NgFor, NgClass, TaskFormComponent],
  template: `
    <div class="container" *ngIf="project(); else loadingTpl">
      <div class="toolbar">
        <a routerLink="/projects" class="back">← Projects</a>
        <div class="title-row">
          <h1>{{ project()!.name }}</h1>
          <span class="badge" [ngClass]="'badge-' + project()!.status">{{ project()!.status }}</span>
        </div>
        <p class="desc" *ngIf="project()!.description">{{ project()!.description }}</p>
        <div class="actions">
          <a [routerLink]="['/projects', project()!.id, 'edit']" class="btn btn-secondary">Edit project</a>
        </div>
      </div>

      <div class="tasks-section card">
        <div class="tasks-header">
          <h2>Tasks</h2>
          <button type="button" class="btn btn-primary" (click)="openNewTask()" *ngIf="!showTaskForm()">Add task</button>
        </div>

        <app-task-form
          *ngIf="showTaskForm()"
          [projectId]="project()!.id"
          [task]="editingTask()"
          (saved)="onTaskSaved()"
          (cancel)="closeTaskForm()"
        />

        <div class="filters">
          <input type="text" placeholder="Search tasks…" [(ngModel)]="taskSearch" (ngModelChange)="loadTasks()" />
          <select [(ngModel)]="taskStatus" (ngModelChange)="loadTasks()">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
          <select [(ngModel)]="taskPriority" (ngModelChange)="loadTasks()">
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <ul class="task-list" *ngIf="!tasksLoading(); else tasksLoadingTpl">
          <li *ngFor="let t of tasks()" class="task-item">
            <div class="task-main">
              <span class="task-title">{{ t.title }}</span>
              <span class="badge badge-{{ t.status }}">{{ t.status }}</span>
              <span class="badge badge-{{ t.priority }}">{{ t.priority }}</span>
            </div>
            <p class="task-desc" *ngIf="t.description">{{ t.description }}</p>
            <div class="task-actions">
              <button type="button" class="btn btn-secondary" (click)="editTask(t)">Edit</button>
              <button type="button" class="btn btn-danger" (click)="deleteTask(t)">Delete</button>
            </div>
          </li>
          <p *ngIf="tasks().length === 0 && !tasksLoading()" class="empty">No tasks. Add one above.</p>
        </ul>
        <ng-template #tasksLoadingTpl><p class="loading">Loading tasks…</p></ng-template>
      </div>
    </div>
    <ng-template #loadingTpl><div class="container"><p class="loading">Loading project…</p></div></ng-template>
  `,
  styles: [`
    .toolbar { margin-bottom: 1.5rem; }
    .back { color: var(--text-muted); font-size: 0.9rem; }
    .title-row { display: flex; align-items: center; gap: 0.5rem; margin: 0.5rem 0 0 0; }
    .title-row h1 { margin: 0; font-size: 1.5rem; }
    .desc { margin: 0.5rem 0 0 0; color: var(--text-muted); }
    .actions { margin-top: 1rem; }
    .tasks-section { margin-top: 1.5rem; }
    .tasks-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .tasks-header h2 { margin: 0; font-size: 1.15rem; }
    .filters { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .filters input { flex: 1; min-width: 160px; padding: 0.5rem 0.75rem; background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text); }
    .filters select { padding: 0.5rem 0.75rem; background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text); }
    .task-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
    .task-item { padding: 0.75rem; background: var(--bg); border-radius: var(--radius); border: 1px solid var(--border); }
    .task-main { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .task-title { font-weight: 500; }
    .task-desc { margin: 0.35rem 0 0 0; color: var(--text-muted); font-size: 0.9rem; }
    .task-actions { margin-top: 0.5rem; display: flex; gap: 0.5rem; }
    .empty, .loading { color: var(--text-muted); }
  `],
})
export class ProjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  project = signal<Project | null>(null);
  tasks = signal<Task[]>([]);
  tasksLoading = signal(true);
  showTaskForm = signal(false);
  editingTask = signal<Task | null>(null);
  taskSearch = '';
  taskStatus = '';
  taskPriority = '';

  private projectId = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? +id : 0;
  });

  ngOnInit(): void {
    const id = this.projectId();
    if (!id) return;
    this.api.getProject(id).subscribe({
      next: (p) => {
        this.project.set(p);
        this.loadTasks();
      },
      error: () => {},
    });
  }

  loadTasks(): void {
    const pid = this.project();
    if (!pid) return;
    this.tasksLoading.set(true);
    this.api.getTasks(pid.id, {
      search: this.taskSearch || undefined,
      status: this.taskStatus || undefined,
      priority: this.taskPriority || undefined,
    }).subscribe({
      next: (res) => {
        this.tasks.set(res.data);
        this.tasksLoading.set(false);
      },
      error: () => this.tasksLoading.set(false),
    });
  }

  openNewTask(): void {
    this.editingTask.set(null);
    this.showTaskForm.set(true);
  }

  editTask(t: Task): void {
    this.editingTask.set(t);
    this.showTaskForm.set(true);
  }

  closeTaskForm(): void {
    this.showTaskForm.set(false);
    this.editingTask.set(null);
  }

  onTaskSaved(): void {
    this.closeTaskForm();
    this.loadTasks();
  }

  deleteTask(t: Task): void {
    if (!confirm(`Delete task "${t.title}"?`)) return;
    const p = this.project();
    if (!p) return;
    this.api.deleteTask(p.id, t.id).subscribe({ next: () => this.loadTasks() });
  }
}
