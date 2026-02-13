import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Project {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProjects(params: { page?: number; limit?: number; search?: string; status?: string } = {}): Observable<PaginatedResponse<Project>> {
    let httpParams = new HttpParams();
    if (params.page != null) httpParams = httpParams.set('page', params.page);
    if (params.limit != null) httpParams = httpParams.set('limit', params.limit);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.status) httpParams = httpParams.set('status', params.status);
    return this.http.get<PaginatedResponse<Project>>(`${this.base}/projects`, { params: httpParams });
  }

  getProject(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.base}/projects/${id}`);
  }

  createProject(body: Partial<Project>): Observable<Project> {
    return this.http.post<Project>(`${this.base}/projects`, body);
  }

  updateProject(id: number, body: Partial<Project>): Observable<Project> {
    return this.http.put<Project>(`${this.base}/projects/${id}`, body);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/projects/${id}`);
  }

  getTasks(projectId: number, params: { search?: string; status?: string; priority?: string } = {}): Observable<{ data: Task[] }> {
    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.priority) httpParams = httpParams.set('priority', params.priority);
    return this.http.get<{ data: Task[] }>(`${this.base}/projects/${projectId}/tasks`, { params: httpParams });
  }

  getTask(projectId: number, taskId: number): Observable<Task> {
    return this.http.get<Task>(`${this.base}/projects/${projectId}/tasks/${taskId}`);
  }

  createTask(projectId: number, body: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(`${this.base}/projects/${projectId}/tasks`, body);
  }

  updateTask(projectId: number, taskId: number, body: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.base}/projects/${projectId}/tasks/${taskId}`, body);
  }

  deleteTask(projectId: number, taskId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/projects/${projectId}/tasks/${taskId}`);
  }
}
