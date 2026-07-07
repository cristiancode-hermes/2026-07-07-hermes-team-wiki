import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class Fts5Service implements OnModuleInit {
  private readonly logger = new Logger(Fts5Service.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    try {
      await this.createFts5Table();
    } catch (err) {
      this.logger.warn('FTS5 setup skipped or failed: ' + (err as Error).message);
    }
  }

  private async createFts5Table() {
    const queryRunner = this.dataSource.createQueryRunner();

    // Check if FTS5 table exists
    const exists = await queryRunner.query(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='pages_fts'`
    );

    if (exists.length === 0) {
      this.logger.log('Creating FTS5 virtual table...');
      await queryRunner.query(`
        CREATE VIRTUAL TABLE pages_fts USING fts5(
          title, content, slug,
          content='pages',
          content_rowid='rowid',
          tokenize='porter unicode61'
        )
      `);

      // Triggers to keep FTS in sync
      await queryRunner.query(`
        CREATE TRIGGER IF NOT EXISTS pages_ai AFTER INSERT ON pages BEGIN
          INSERT INTO pages_fts(rowid, title, content, slug)
          VALUES (new.rowid, new.title, new.content, new.slug);
        END
      `);

      await queryRunner.query(`
        CREATE TRIGGER IF NOT EXISTS pages_ad AFTER DELETE ON pages BEGIN
          INSERT INTO pages_fts(pages_fts, rowid, title, content, slug)
          VALUES ('delete', old.rowid, old.title, old.content, old.slug);
        END
      `);

      await queryRunner.query(`
        CREATE TRIGGER IF NOT EXISTS pages_au AFTER UPDATE ON pages BEGIN
          INSERT INTO pages_fts(pages_fts, rowid, title, content, slug)
          VALUES ('delete', old.rowid, old.title, old.content, old.slug);
          INSERT INTO pages_fts(rowid, title, content, slug)
          VALUES (new.rowid, new.title, new.content, new.slug);
        END
      `);

      // Initial population
      await queryRunner.query(`
        INSERT INTO pages_fts(rowid, title, content, slug)
        SELECT rowid, title, content, slug FROM pages
      `);

      this.logger.log('FTS5 virtual table created and populated.');
    } else {
      this.logger.log('FTS5 virtual table already exists.');
    }

    await queryRunner.release();
  }

  async search(query: string, limit: number = 10, spaceId?: string): Promise<any[]> {
    const sanitized = query.replace(/['"]/g, '').trim();
    if (!sanitized) return [];

    let sql = `
      SELECT
        p.id, p.title, p.slug, p.spaceId, p.organizationId,
        snippet(pages_fts, 1, '<mark>', '</mark>', '...', 40) as title_highlight,
        snippet(pages_fts, 2, '<mark>', '</mark>', '...', 80) as content_highlight
      FROM pages_fts
      JOIN pages p ON p.rowid = pages_fts.rowid
      WHERE pages_fts MATCH ?
    `;
    const params: any[] = [sanitized];

    if (spaceId) {
      sql += ` AND p.spaceId = ?`;
      params.push(spaceId);
    }

    sql += ` ORDER BY rank LIMIT ?`;
    params.push(limit);

    const queryRunner = this.dataSource.createQueryRunner();
    try {
      const results = await queryRunner.query(sql, params);
      return results;
    } finally {
      await queryRunner.release();
    }
  }
}
