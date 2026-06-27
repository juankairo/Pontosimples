-- Esquema de Banco de Dados SQLite para o projeto Ponto Eletrônico

-- Tabela de Empresas
CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    cnpj TEXT,
    tel TEXT
);

-- Tabela de Setores
CREATE TABLE IF NOT EXISTS sectors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    companyId INTEGER,
    FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE SET NULL
);

-- Tabela de Funções
CREATE TABLE IF NOT EXISTS functions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

-- Tabela de Cargas Horárias
CREATE TABLE IF NOT EXISTS workloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    hoursPerDay INTEGER NOT NULL,
    type TEXT NOT NULL DEFAULT 'standard'
);

-- Tabela de Usuários/Funcionários
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'supervisor', 'funcionario', 'rh')),
    status TEXT NOT NULL DEFAULT 'pendente' CHECK(status IN ('ativo', 'pendente', 'recusado', 'inativo')),
    createdAt TEXT NOT NULL,
    companyId INTEGER,
    sectorId INTEGER,
    workloadId INTEGER,
    bankBalance INTEGER DEFAULT 0,
    FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (sectorId) REFERENCES sectors(id) ON DELETE SET NULL,
    FOREIGN KEY (workloadId) REFERENCES workloads(id) ON DELETE SET NULL
);

-- Tabela de Associação de Funções aos Usuários (Muitos-para-Muitos)
CREATE TABLE IF NOT EXISTS user_functions (
    userId INTEGER NOT NULL,
    functionId INTEGER NOT NULL,
    PRIMARY KEY (userId, functionId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (functionId) REFERENCES functions(id) ON DELETE CASCADE
);

-- Tabela de Justificativas de Falta
CREATE TABLE IF NOT EXISTS justifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

-- Tabela de Feriados
CREATE TABLE IF NOT EXISTS holidays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    name TEXT NOT NULL,
    companyId INTEGER,
    FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
);

-- Tabela de Registros de Ponto (Batidas)
CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    date TEXT NOT NULL,
    in1 TEXT,
    out1 TEXT,
    in2 TEXT,
    out2 TEXT,
    hoursWorked TEXT,
    overtime TEXT,
    faults INTEGER DEFAULT 0,
    status TEXT DEFAULT 'completo',
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela do Banco de Horas (Histórico/Lançamentos)
CREATE TABLE IF NOT EXISTS bank (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    date TEXT NOT NULL,
    type TEXT NOT NULL, -- 'Hora Extra' ou 'Falta' ou 'Compensação'
    hours TEXT NOT NULL, -- e.g., '+2h00', '-1h30'
    obs TEXT,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Auditoria do Sistema
CREATE TABLE IF NOT EXISTS audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    user TEXT NOT NULL,
    action TEXT NOT NULL,
    record TEXT DEFAULT '-'
);

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    read INTEGER DEFAULT 0, -- 0 para falso, 1 para verdadeiro
    date TEXT NOT NULL
);

-- Tabela de Configurações do Sistema
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
