import { Injectable, Logger } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join } from 'node:path';
import { MockAuditLog } from './mock-data';

const DEFAULT_STORAGE_PATH = join(process.cwd(), 'storage', 'audit-log.json');

@Injectable()
export class AuditLogPersistence {
  private readonly logger = new Logger(AuditLogPersistence.name);
  private readonly enabled: boolean;
  private readonly filePath: string;

  constructor() {
    const defaultPersist = process.env.NODE_ENV === 'test' ? 'false' : 'true';
    this.enabled = (process.env.AUDIT_LOG_PERSIST ?? defaultPersist).toLowerCase() !== 'false';
    const targetPath = process.env.AUDIT_LOG_FILE;
    this.filePath = targetPath
      ? isAbsolute(targetPath)
        ? targetPath
        : join(process.cwd(), targetPath)
      : DEFAULT_STORAGE_PATH;

    if (!this.enabled) {
      this.logger.log('Audit log persistence disabled via AUDIT_LOG_PERSIST=false');
    }
  }

  load(): MockAuditLog[] | null {
    if (!this.enabled) {
      return null;
    }
    try {
      if (!existsSync(this.filePath)) {
        return null;
      }
      const payload = readFileSync(this.filePath, 'utf-8');
      if (!payload.trim()) {
        return [];
      }
      const deserialised = JSON.parse(payload) as MockAuditLog[];
      return Array.isArray(deserialised) ? deserialised : [];
    } catch (error) {
      this.logger.error(
        `Failed to load audit log snapshot from ${this.filePath}`,
        error instanceof Error ? error.stack : undefined
      );
      return null;
    }
  }

  save(logs: MockAuditLog[]): void {
    if (!this.enabled) {
      return;
    }
    try {
      mkdirSync(dirname(this.filePath), { recursive: true });
      writeFileSync(this.filePath, JSON.stringify(logs, null, 2), 'utf-8');
    } catch (error) {
      this.logger.error(
        `Failed to persist audit logs to ${this.filePath}`,
        error instanceof Error ? error.stack : undefined
      );
    }
  }
}
