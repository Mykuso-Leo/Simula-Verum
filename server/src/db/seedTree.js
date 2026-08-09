import { db } from './index.js'
import { COUNTRIES, flagEmoji } from './countries.js'

function insertRepFolder(parentId, name, sortOrder = 0) {
  return db
    .prepare(`INSERT INTO representation_nodes (parent_id, name, type, sort_order) VALUES (?, ?, 'folder', ?)`)
    .run(parentId, name, sortOrder).lastInsertRowid
}

function insertRepLeaf(parentId, name, emoji, sortOrder = 0) {
  db.prepare(`INSERT INTO representation_nodes (parent_id, name, type, emoji, sort_order) VALUES (?, ?, 'leaf', ?, ?)`).run(
    parentId,
    name,
    emoji ?? null,
    sortOrder
  )
}

function insertCommitteeFolder(parentId, name, sortOrder = 0) {
  return db
    .prepare(`INSERT INTO committee_nodes (parent_id, name, type, sort_order) VALUES (?, ?, 'folder', ?)`)
    .run(parentId, name, sortOrder).lastInsertRowid
}

function insertCommitteeLeaf(parentId, name, sortOrder = 0) {
  db.prepare(`INSERT INTO committee_nodes (parent_id, name, type, sort_order) VALUES (?, ?, 'leaf', ?)`).run(
    parentId,
    name,
    sortOrder
  )
}

export function seedRepresentations() {
  const root = insertRepFolder(null, 'Organizações Internacionais e Nações', 0)

  const orgsFolder = insertRepFolder(root, 'Organizações Internacionais', 0)
  ;[
    'FMI — Fundo Monetário Internacional',
    'OMS — Organização Mundial da Saúde',
    'UNESCO',
    'UNICEF',
    'ACNUR — Alto Comissariado das Nações Unidas para Refugiados',
    'OMC — Organização Mundial do Comércio',
    'OIT — Organização Internacional do Trabalho',
    'Banco Mundial',
    'OPAS — Organização Pan-Americana da Saúde',
    'Interpol',
    'OTAN',
    'União Europeia',
    'União Africana',
    'Mercosul',
    'OEA — Organização dos Estados Americanos',
    'Liga Árabe'
  ].forEach((name, i) => insertRepLeaf(orgsFolder, name, '🏛️', i))

  const ngoFolder = insertRepFolder(root, 'ONGs Internacionais', 1)
  ;[
    'Médicos Sem Fronteiras',
    'Greenpeace',
    'Anistia Internacional',
    'Cruz Vermelha',
    'Human Rights Watch',
    'WWF',
    'Oxfam',
    'Save the Children'
  ].forEach((name, i) => insertRepLeaf(ngoFolder, name, '🤝', i))

  const countriesFolder = insertRepFolder(root, 'Países', 2)
  COUNTRIES.forEach(([name, iso2], i) => insertRepLeaf(countriesFolder, name, flagEmoji(iso2), i))

  const historical = insertRepFolder(null, 'Comitê Histórico', 1)

  const ww2 = insertRepFolder(historical, 'Segunda Guerra Mundial', 0)
  ;[
    'Adolf Hitler',
    'Benito Mussolini',
    'Winston Churchill',
    'Joseph Stalin',
    'Franklin D. Roosevelt',
    'Charles de Gaulle',
    'Hirohito',
    'Dwight D. Eisenhower'
  ].forEach((name, i) => insertRepLeaf(ww2, name, '🎖️', i))

  const coldWar = insertRepFolder(historical, 'Guerra Fria', 1)
  ;['John F. Kennedy', 'Nikita Khrushchov', 'Richard Nixon', 'Leonid Brejnev', 'Ronald Reagan', 'Mikhail Gorbachov', 'Fidel Castro', 'Mao Tsé-Tung'].forEach(
    (name, i) => insertRepLeaf(coldWar, name, '☭', i)
  )

  const usa = insertRepFolder(historical, 'Estados Unidos', 2)
  ;[
    'George Washington',
    'Abraham Lincoln',
    'Theodore Roosevelt',
    'Woodrow Wilson',
    'Franklin D. Roosevelt',
    'Harry Truman',
    'Dwight D. Eisenhower',
    'John F. Kennedy',
    'Richard Nixon',
    'Ronald Reagan',
    'Bill Clinton',
    'George W. Bush',
    'Barack Obama',
    'Donald Trump',
    'Joe Biden'
  ].forEach((name, i) => insertRepLeaf(usa, name, '🇺🇸', i))

  const frenchRev = insertRepFolder(historical, 'Revolução Francesa', 3)
  ;['Luís XVI', 'Maximilien Robespierre', 'Napoleão Bonaparte', 'Georges Danton', 'Jean-Paul Marat', 'Marie Antoinette'].forEach(
    (name, i) => insertRepLeaf(frenchRev, name, '⚜️', i)
  )

  const brazil = insertRepFolder(historical, 'Brasil', 4)
  ;['Dom Pedro I', 'Dom Pedro II', 'Getúlio Vargas', 'Juscelino Kubitschek', 'Tiradentes', 'Zumbi dos Palmares', 'Princesa Isabel'].forEach(
    (name, i) => insertRepLeaf(brazil, name, '🇧🇷', i)
  )

  const antiquity = insertRepFolder(historical, 'Antiguidade', 5)
  ;['Júlio César', 'Alexandre, o Grande', 'Cleópatra', 'Aristóteles', 'Sócrates', 'Espártaco'].forEach((name, i) =>
    insertRepLeaf(antiquity, name, '🏺', i)
  )

  const professions = insertRepFolder(null, 'Profissões', 2)
  const juridico = insertRepFolder(professions, 'Jurídico', 0)
  ;['Juiz', 'Promotor', 'Advogado', 'Testemunha', 'Réu'].forEach((name, i) => insertRepLeaf(juridico, name, '⚖️', i))
  const imprensa = insertRepFolder(professions, 'Imprensa', 1)
  ;['Jornalista', 'Colunista', 'Correspondente internacional'].forEach((name, i) => insertRepLeaf(imprensa, name, '📰', i))
  const saude = insertRepFolder(professions, 'Saúde', 2)
  ;['Médico', 'Enfermeiro', 'Epidemiologista'].forEach((name, i) => insertRepLeaf(saude, name, '🩺', i))
  const diplomacia = insertRepFolder(professions, 'Diplomacia', 3)
  ;['Embaixador', 'Cônsul', 'Assessor diplomático'].forEach((name, i) => insertRepLeaf(diplomacia, name, '🕊️', i))

  const mythFolder = insertRepFolder(null, 'Comitê Mitológico ou Fictício', 3)
  const gods = insertRepFolder(mythFolder, 'Deuses', 0)
  const greekGods = insertRepFolder(gods, 'Deuses gregos', 0)
  ;['Zeus', 'Hera', 'Poseidon', 'Atena', 'Apolo', 'Ares', 'Afrodite', 'Hermes', 'Hades', 'Dioniso', 'Ártemis', 'Hefesto'].forEach(
    (name, i) => insertRepLeaf(greekGods, name, '⚡', i)
  )
  const romanGods = insertRepFolder(gods, 'Deuses romanos', 1)
  ;['Júpiter', 'Juno', 'Netuno', 'Minerva', 'Marte', 'Vênus', 'Mercúrio', 'Plutão'].forEach((name, i) =>
    insertRepLeaf(romanGods, name, '🏛️', i)
  )
  const norseGods = insertRepFolder(gods, 'Deuses nórdicos', 2)
  ;['Odin', 'Thor', 'Loki', 'Freya', 'Baldr', 'Heimdall'].forEach((name, i) => insertRepLeaf(norseGods, name, '🔨', i))
  const otherGods = insertRepFolder(gods, 'Outras tradições', 3)
  ;['Deus (tradição cristã)', 'Alá (tradição islâmica)', 'Rá (tradição egípcia)', 'Xangô (tradição iorubá)'].forEach(
    (name, i) => insertRepLeaf(otherGods, name, '✨', i)
  )

  const characters = insertRepFolder(mythFolder, 'Personagens', 1)
  const avengers = insertRepFolder(characters, 'Vingadores', 0)
  ;['Homem de Ferro', 'Capitão América', 'Thor', 'Hulk', 'Viúva Negra', 'Gavião Arqueiro'].forEach((name, i) =>
    insertRepLeaf(avengers, name, '🦸', i)
  )
  const justiceLeague = insertRepFolder(characters, 'Liga da Justiça', 1)
  ;['Superman', 'Batman', 'Mulher Maravilha', 'Flash', 'Aquaman', 'Lanterna Verde'].forEach((name, i) =>
    insertRepLeaf(justiceLeague, name, '🦸‍♂️', i)
  )
  const harryPotter = insertRepFolder(characters, 'Harry Potter', 2)
  ;['Harry Potter', 'Hermione Granger', 'Rony Weasley', 'Alvo Dumbledore', 'Voldemort', 'Severo Snape'].forEach(
    (name, i) => insertRepLeaf(harryPotter, name, '⚡', i)
  )

  const companies = insertRepFolder(null, 'Grandes Empresas', 4)
  ;[
    "McDonald's",
    'Nestlé',
    'OpenAI',
    'Anthropic',
    'Coca-Cola',
    'Microsoft',
    'Apple',
    'Google',
    'Amazon',
    'Tesla',
    'Samsung',
    'Meta'
  ].forEach((name, i) => insertRepLeaf(companies, name, '🏢', i))
}

export function seedCommittees() {
  const unFolder = insertCommitteeFolder(null, 'Comitês da ONU', 0)
  ;[
    'Conselho de Segurança da ONU (CSNU)',
    'Assembleia Geral da ONU (AGNU)',
    'Conselho de Direitos Humanos',
    'ONU Mulheres — Comitê da Mulher',
    'UNESCO — Comitê de Educação, Ciência e Cultura',
    'UNICEF — Comitê da Infância',
    'ECOSOC — Conselho Econômico e Social',
    'Comitê de Desarmamento e Segurança Internacional',
    'Corte Internacional de Justiça',
    'ACNUR — Comitê de Refugiados'
  ].forEach((name, i) => insertCommitteeLeaf(unFolder, name, i))

  const otherFolder = insertCommitteeFolder(null, 'Outros Comitês', 1)
  ;[
    'CPI das Bets',
    'Conselho de Segurança da Guerra Fria (histórico)',
    'G20',
    'Conselho da Europa',
    'Comitê de Crise — Cúpula Emergencial',
    'Tribunal de Nuremberg (simulado)',
    'Conselho Editorial de Imprensa'
  ].forEach((name, i) => insertCommitteeLeaf(otherFolder, name, i))
}

export function restoreTree() {
  const tx = db.transaction(() => {
    db.prepare('DELETE FROM representation_nodes').run()
    db.prepare('DELETE FROM committee_nodes').run()
    seedRepresentations()
    seedCommittees()
  })
  tx()
}

const { n: repCount } = db.prepare('SELECT COUNT(*) AS n FROM representation_nodes').get()
if (repCount === 0) {
  seedRepresentations()
  console.log('Árvore de representações populada.')
}

const { n: committeeCount } = db.prepare('SELECT COUNT(*) AS n FROM committee_nodes').get()
if (committeeCount === 0) {
  seedCommittees()
  console.log('Árvore de comitês populada.')
}
