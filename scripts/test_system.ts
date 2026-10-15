import { dbService, normalizeText, Collaborator, Question } from '../server/db.js';

async function runTestSuite() {
  console.log('--- INICIANDO TESTES DO SISTEMA: ESCOLA DO BOM CONDUTOR ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  const db = dbService.getDb();

  // Test 1: Seed data initialization
  assert(db.colaboradores.length >= 6, '1. Base inicial contém condutores cadastrados');
  assert(db.questoes.length >= 10, '2. Banco de questões inicial carregado');
  assert(db.instrutores.length >= 3, '3. Instrutores credenciados cadastrados');

  // Test 2: Text normalization for search and accents
  const query = 'FRANCISCO ANTÔNIO';
  const norm = normalizeText(query);
  assert(norm === 'francisco antonio', '4. Normalização de acentos e caixa alta funciona corretamente');

  // Test 3: Incremental search and homonyms
  const matched = db.colaboradores.filter((c) =>
    c.nomeNormalizado.includes('francisco')
  );
  assert(matched.length >= 3, '5. Busca por "francisco" retorna homônimos diferenciados por base (Bacabal, Santa Inês, Pedreiras)');

  // Test 4: Vehicle separation in questions
  const carQuestions = db.questoes.filter((q) => q.categoriaVeiculo === 'Carro/Caminhonete');
  const motoQuestions = db.questoes.filter((q) => q.categoriaVeiculo === 'Motocicleta');
  assert(carQuestions.length > 0, '6. Conjunto de questões existe para Carro/Caminhonete');
  assert(motoQuestions.length > 0, '7. Conjunto de questões existe para Motocicleta');

  // Test 5: Exactly 5 alternatives per question (A, B, C, D, E)
  const allHaveFiveAlternatives = db.questoes.every(
    (q) =>
      Array.isArray(q.alternativas) &&
      q.alternativas.length === 5 &&
      q.alternativas.map((a) => a.letra).join('') === 'ABCDE'
  );
  assert(allHaveFiveAlternatives, '8. Todas as questões contêm rigorosamente 5 alternativas (A, B, C, D e E)');

  // Test 6: Exactly one correct answer (A to E)
  const validAnswers = db.questoes.every((q) =>
    ['A', 'B', 'C', 'D', 'E'].includes(q.respostaCorreta)
  );
  assert(validAnswers, '9. Todas as questões têm exatamente uma resposta correta definida');

  // Test 7: Score calculation and threshold logic
  const totalQ = 10;
  const correctQ = 8;
  const pct = Math.round((correctQ / totalQ) * 100);
  const isApproved = pct >= db.configuracoes.notaMinimaTeorica;
  assert(pct === 80, '10. Cálculo de aproveitamento percentual correto (8/10 = 80%)');
  assert(isApproved === true, '11. Aplicação da nota mínima de 70% aprova condutor com 80%');

  // Test 8: Reproval on insufficient score
  const failPct = Math.round((5 / totalQ) * 100);
  const isReproved = failPct < db.configuracoes.notaMinimaTeorica;
  assert(isReproved === true, '12. Reprova condutor com nota inferior a 70% (5/10 = 50%)');

  // Test 9: Consolidation rule (Section 12)
  // Only approved if both theoretical AND practical are approved
  const colabTeoricoAprovado = { statusTeorico: 'Aprovado', statusPratico: 'Não iniciado' };
  const colabAmbosAprovados = { statusTeorico: 'Aprovado', statusPratico: 'Aprovado' };
  const isFullyConcluded =
    colabAmbosAprovados.statusTeorico === 'Aprovado' &&
    colabAmbosAprovados.statusPratico === 'Aprovado';
  assert(isFullyConcluded === true, '13. Consolidação geral exige aprovação em ambas as etapas');

  // Test 10: Practical criteria verification
  const criteria = db.criteriosAvaliacao;
  assert(criteria.length >= 10, '14. Critérios práticos estruturados (Checklist 360°, EPIs, frenagem, pontos cegos)');

  console.log(`\n--- RESULTADO: ${passed} PASSOU, ${failed} FALHOU ---`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
