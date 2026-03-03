import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import { MODULES, ModuleConfig, ModuleField, ModuleKey } from '../config/modules';

export interface ModuleRecord {
  id: number;
  status?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class LiveDataService {
  private socket: Socket;
  private dataSubject = new BehaviorSubject<ModuleRecord[]>([]);
  public data$ = this.dataSubject.asObservable();

  private blinkingCellsSubject = new BehaviorSubject<Set<string>>(new Set());
  public blinkingCells$ = this.blinkingCellsSubject.asObservable();

  private blinkingRowsSubject = new BehaviorSubject<Set<number>>(new Set());
  public blinkingRows$ = this.blinkingRowsSubject.asObservable();

  private readonly host = window.location.hostname || 'localhost';
  private readonly apiBaseUrl = `${window.location.protocol}//${this.host}:3000`;
  private readonly updateDelayMs = 250;
  private readonly lastUpdateSignature = new Map<number, string>();

  private activeModule: ModuleKey | null = null;
  private activeConfig: ModuleConfig | null = null;

  constructor(private http: HttpClient) {
    this.socket = io(`${window.location.protocol}//${this.host}:3000`, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    this.setupSocketListeners();
  }

  setModule(moduleKey: ModuleKey) {
    if (this.activeModule === moduleKey) return;
    this.activeModule = moduleKey;
    this.activeConfig = MODULES[moduleKey];
    this.lastUpdateSignature.clear();
    this.dataSubject.next([]);
    this.fetchModuleData(moduleKey);
  }

  getActiveConfig() {
    return this.activeConfig;
  }

  private fetchModuleData(moduleKey: ModuleKey) {
    this.http.get<ModuleRecord[]>(`${this.apiBaseUrl}/api/modules/${moduleKey}`).subscribe({
      next: (rows) => {
        this.dataSubject.next(rows);
        this.lastUpdateSignature.clear();
        rows.forEach(item => {
          this.lastUpdateSignature.set(item.id, this.makeSignature(item));
        });
      },
      error: (error) => {
        console.error('Failed to load module data:', error);
      }
    });
  }

  private setupSocketListeners() {
    this.socket.on('module:data_inserted', (payload: { module: ModuleKey; record: ModuleRecord }) => {
      if (!this.activeModule || payload.module !== this.activeModule) return;
      const applyChange = () => {
        if (this.isDuplicate(payload.record)) return;
        const currentData = this.dataSubject.value;
        this.dataSubject.next([payload.record, ...currentData]);
        this.lastUpdateSignature.set(payload.record.id, this.makeSignature(payload.record));
        this.triggerRowBlink(payload.record.id);
      };
      this.applyDelay(applyChange);
    });

    this.socket.on('module:data_updated', (payload: { module: ModuleKey; record: ModuleRecord }) => {
      if (!this.activeModule || payload.module !== this.activeModule) return;
      const applyChange = () => {
        if (payload.record.id && this.isDuplicate(payload.record)) return;
        const currentData = this.dataSubject.value;
        const updatedIndex = currentData.findIndex(item => item.id === payload.record.id);
        const previous = updatedIndex !== -1 ? currentData[updatedIndex] : undefined;
        if (updatedIndex !== -1) {
          currentData[updatedIndex] = { ...currentData[updatedIndex], ...payload.record };
          this.dataSubject.next([...currentData]);
          this.lastUpdateSignature.set(
            currentData[updatedIndex].id,
            this.makeSignature(currentData[updatedIndex])
          );
        } else {
          this.dataSubject.next([payload.record, ...currentData]);
          this.lastUpdateSignature.set(payload.record.id, this.makeSignature(payload.record));
        }

        if (payload.record.id) {
          console.log(payload);
          const changedFields = this.getChangedFields(previous, payload.record);
          changedFields.forEach((fieldKey) => {
            this.triggerCellBlink(`cell-${payload.record.id}-${fieldKey}`);
          });
          this.triggerRowBlink(payload.record.id);
        }
      };
      this.applyDelay(applyChange);
    });
  }

  updateRecord(moduleKey: ModuleKey, id: number, payload: Record<string, any>) {
    return this.http.put(`${this.apiBaseUrl}/api/modules/${moduleKey}/${id}`, payload);
  }

  createRecord(moduleKey: ModuleKey, payload: Record<string, any>) {
    return this.http.post(`${this.apiBaseUrl}/api/modules/${moduleKey}`, payload);
  }

  blinkCell(id: number, field: string) {
    this.triggerCellBlink(`cell-${id}-${field}`);
  }

  blinkRow(id: number) {
    this.triggerRowBlink(id);
  }

  getSocket(): Socket {
    return this.socket;
  }

  private triggerCellBlink(cellId: string) {
    const blinkingCells = this.blinkingCellsSubject.value;
    blinkingCells.add(cellId);
    this.blinkingCellsSubject.next(new Set(blinkingCells));

    setTimeout(() => {
      blinkingCells.delete(cellId);
      this.blinkingCellsSubject.next(new Set(blinkingCells));
    }, 1200);
  }

  private triggerRowBlink(rowId: number) {
    const blinkingRows = this.blinkingRowsSubject.value;
    blinkingRows.add(rowId);
    this.blinkingRowsSubject.next(new Set(blinkingRows));

    setTimeout(() => {
      blinkingRows.delete(rowId);
      this.blinkingRowsSubject.next(new Set(blinkingRows));
    }, 1200);
  }

  private applyDelay(action: () => void) {
    if (this.updateDelayMs > 0) {
      setTimeout(action, this.updateDelayMs);
    } else {
      action();
    }
  }

  private getChangedFields(previous: ModuleRecord | undefined, next: ModuleRecord) {
    const fields: ModuleField[] = this.activeConfig?.gridFields ?? [];
    const keys = fields.map(field => field.key);
    if (!previous) return keys.map(key => (key === 'updated_at' ? 'updated' : key));

    return keys
      .filter((key) => next[key] !== undefined && previous[key] !== next[key])
      .map((key) => (key === 'updated_at' ? 'updated' : key));
  }

  private makeSignature(data: ModuleRecord) {
    const fields: ModuleField[] = this.activeConfig?.gridFields ?? [];
    const values = fields.map(field => data[field.key] ?? '');
    return values.join('|');
  }

  private isDuplicate(data: ModuleRecord) {
    if (!data.id) return false;
    const signature = this.makeSignature(data);
    return this.lastUpdateSignature.get(data.id) === signature;
  }
}
