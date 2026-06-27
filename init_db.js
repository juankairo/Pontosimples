const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('path');

const dbFile = path.join(__dirname, 'ponto.db');
const schemaFile = path.join(__dirname, 'db_schema.sql');

console.log('Redefinindo e limpando o banco de dados SQLite (Deixando apenas Admins)...');

try {
  // 1. Conectar/Criar o banco de dados
  const db = new DatabaseSync(dbFile);

  // 2. Ler e executar o esquema SQL
  const schemaSql = fs.readFileSync(schemaFile, 'utf8');
  const commands = schemaSql
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0);

  for (const cmd of commands) {
    db.exec(cmd + ';');
  }

  // 3. Limpar todas as tabelas
  db.exec('DELETE FROM user_functions;');
  db.exec('DELETE FROM users;');
  db.exec('DELETE FROM companies;');
  db.exec('DELETE FROM sectors;');
  db.exec('DELETE FROM functions;');
  db.exec('DELETE FROM workloads;');
  db.exec('DELETE FROM justifications;');
  db.exec('DELETE FROM holidays;');
  db.exec('DELETE FROM records;');
  db.exec('DELETE FROM bank;');
  db.exec('DELETE FROM audit;');
  db.exec('DELETE FROM notifications;');
  db.exec('DELETE FROM settings;');

  // Inserir Cargas Horárias Padrão
  const insertWorkload = db.prepare('INSERT INTO workloads (id, name, hoursPerDay, type) VALUES (?, ?, ?, ?)');
  insertWorkload.run(1, '8h Diárias', 8, 'standard');
  insertWorkload.run(2, '6h Diárias', 6, 'standard');

  // Inserir Justificativas Padrão
  const insertJustification = db.prepare('INSERT INTO justifications (id, name) VALUES (?, ?)');
  insertJustification.run(1, 'Atestado Médico');
  insertJustification.run(2, 'Licença');
  insertJustification.run(3, 'Falta Justificada');
  insertJustification.run(4, 'Serviço Externo');

  // Inserir Feriados Padrão
  const insertHoliday = db.prepare('INSERT INTO holidays (id, date, name, companyId) VALUES (?, ?, ?, ?)');
  insertHoliday.run(1, '2026-01-01', 'Confraternização Universal', null);
  insertHoliday.run(2, '2026-02-16', 'Carnaval', null);
  insertHoliday.run(3, '2026-04-03', 'Paixão de Cristo', null);
  insertHoliday.run(4, '2026-04-21', 'Tiradentes', null);
  insertHoliday.run(5, '2026-05-01', 'Dia do Trabalho', null);
  insertHoliday.run(6, '2026-06-04', 'Corpus Christi', null);
  insertHoliday.run(7, '2026-09-07', 'Independência do Brasil', null);
  insertHoliday.run(8, '2026-10-12', 'Nossa Senhora Aparecida', null);
  insertHoliday.run(9, '2026-11-02', 'Finados', null);
  insertHoliday.run(10, '2026-11-15', 'Proclamação da República', null);
  insertHoliday.run(11, '2026-12-25', 'Natal', null);

  // Inserir Usuários (Apenas Administradores)
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password, role, status, createdAt, companyId, sectorId, workloadId, bankBalance) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertUser.run(1, 'Administrador', 'admin@stylleponto.com', 'ponto123', 'admin', 'ativo', '2026-01-01', null, null, null, 0);
  insertUser.run(2, 'Juan Kairo', 'juankairo21@gmail.com', 'ponto123', 'admin', 'ativo', '2026-01-01', null, null, null, 0);

  // Auditoria
  const insertAudit = db.prepare('INSERT INTO audit (id, date, time, user, action, record) VALUES (?, ?, ?, ?, ?, ?)');
  insertAudit.run(1, '2026-06-27', '00:00', 'Administrador', 'Sistema redefinido (Limpeza de dados)', '-');

  // Configurações
  const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
  insertSetting.run('systemName', 'Ponto Eletrônico');
  insertSetting.run('primaryColor', '#0b1d4d');
  insertSetting.run('secondaryColor', '#2563EB');
  insertSetting.run('senderEmail', 'noreply@stylleponto.com');
  insertSetting.run('delayTolerance', '10');
  insertSetting.run('overtimeMinimum', '10');

  console.log('Limpeza efetuada e usuários Admin inseridos com sucesso no SQLite.');

} catch (error) {
  console.error('Erro ao limpar o banco de dados:', error);
  process.exit(1);
}
