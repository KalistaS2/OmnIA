import { Injectable, signal } from '@angular/core';
import type { Parecer, ItemAnalise, Veredito, AnotacaoCategoria, AnotacaoClassificada } from '../models/parecer.model';
import { ItemVeredito } from '../mock-data/prototype-data';

export interface GerarParecerParams {
  processo: string;
  linhas: ItemVeredito[];
  decisaoHumana: string | null;
  anotacoes: AnotacaoClassificada[];
  timeline: { data: string; texto: string }[];
  relator: string;
}

// Dicionário de palavras-chave por categoria semântica.
//
// EXTENSÃO FUTURA: substituir esta lógica de palavras-chave por uma chamada
// a um LLM (ex: Gemini) que retorna a categoria com base no contexto completo
// da anotação, permitindo classificação muito mais precisa e nuançada.
const PALAVRAS_CHAVE: Record<Exclude<AnotacaoCategoria, 'livre'>, string[]> = {
  contexto: [
    'contexto', 'histórico', 'antecedente', 'anteriormente',
    'vale notar', 'vale destacar', 'historicamente', 'background',
    'em relação ao', 'previamente',
  ],
  justificativa: [
    'porque', 'pois', 'razão', 'motivo', 'visto que', 'dado que',
    'tendo em vista', 'considerando que', 'haja vista', 'face a',
    'em virtude', 'em razão', 'justifica', 'fundamenta',
  ],
  atenuante: [
    'atenuante', 'mitigante', 'já cumpriu', 'regularizado', 'sanado',
    'regularizou', 'resolvido', 'corrigido', 'sem precedente',
    'primeira ocorrência', 'boa-fé', 'boa fé',
  ],
  agravante: [
    'agravante', 'reincidente', 'reincidência', 'reiterado', 'reiteração',
    'insistência', 'recorrente', 'grave', 'gravíssimo', 'dolo',
    'deliberado', 'intencional', 'má-fé', 'má fé',
  ],
  providencia: [
    'determinar', 'notificar', 'citar', 'intimar', 'providência',
    'recomendar', 'recomendo', 'deve', 'deverá', 'necessário',
    'urgente', 'imediato', 'encaminhar', 'adotar medidas',
  ],
};

/** Estilos do documento incorporados para impressão em janela isolada */
const PARECER_PRINT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body { background: #fff; color: #1a1a2e; }

  .parecer-doc {
    font-family: 'Newsreader', Georgia, serif;
    color: #1a1a2e;
    line-height: 1.8;
    padding: 1.5cm 2cm;
    font-size: 11pt;
    max-width: 100%;
  }
  .parecer-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;
  }
  .parecer-logo-wrap { display: flex; align-items: center; gap: 0.75rem; }
  .parecer-logo-svg  { width: 48px; height: 48px; flex-shrink: 0; }
  .parecer-logo-text { display: flex; flex-direction: column; gap: 0.125rem; }
  .parecer-tribunal  { font-size: 10pt; font-weight: 700; color: #1e3a5f;
    font-family: 'IBM Plex Sans', sans-serif; letter-spacing: -0.01em; }
  .parecer-sistema   { font-size: 7pt; font-family: 'IBM Plex Sans', sans-serif;
    color: #5a6a80; letter-spacing: 0.04em; }
  .parecer-id-block  { text-align: right; display: flex; flex-direction: column;
    align-items: flex-end; gap: 0.25rem; }
  .parecer-tipo      { font-size: 6.5pt; font-family: 'IBM Plex Sans', sans-serif;
    font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #5a6a80; }
  .parecer-numero    { font-size: 13pt; font-weight: 700; color: #1e3a5f;
    font-family: 'IBM Plex Sans', sans-serif; letter-spacing: -0.02em; }
  .parecer-divider   { border: none; border-top: 2px solid #1e3a5f;
    margin: 1rem 0; opacity: 0.15; }
  .parecer-identificacao { margin-bottom: 1.5rem; }
  .parecer-id-table  { width: 100%; border-collapse: collapse;
    font-family: 'IBM Plex Sans', sans-serif; font-size: 8.5pt; }
  .parecer-id-table th { text-align: left; width: 160px; font-weight: 600; color: #5a6a80;
    padding: 0.25rem 1rem 0.25rem 0; vertical-align: top;
    font-size: 7.5pt; letter-spacing: 0.04em; text-transform: uppercase; }
  .parecer-id-table td { color: #1a1a2e; padding: 0.25rem 0; }
  .parecer-processo-num { font-variant-numeric: tabular-nums; font-weight: 600; }
  .parecer-ementa-box   { background: #f0f4f9; border-left: 3px solid #1e3a5f;
    padding: 0.75rem 1rem; border-radius: 0 3px 3px 0;
    page-break-inside: avoid; break-inside: avoid; }
  .parecer-secao-label  { font-family: 'IBM Plex Sans', sans-serif; font-size: 6.5pt;
    font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;
    color: #1e3a5f; margin-bottom: 0.4rem; }
  .parecer-ementa-texto { font-size: 9pt; font-style: italic; color: #2c3e55;
    line-height: 1.7; }
  .parecer-secao        { margin-top: 1.5rem; padding-top: 1rem;
    border-top: 1px solid #dde3ee; }
  .parecer-secao-titulo { font-family: 'IBM Plex Sans', sans-serif; font-size: 8pt;
    font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
    color: #1e3a5f; margin-bottom: 0.75rem;
    display: flex; align-items: center; gap: 0.4rem; }
  .parecer-numeral { display: inline-flex; align-items: center; justify-content: center;
    width: 16px; height: 16px; border-radius: 50%; background: #1e3a5f;
    color: #fff; font-size: 6.5pt; font-weight: 700; flex-shrink: 0; }
  .parecer-paragrafo { margin: 0 0 0.75rem; text-align: justify; hyphens: auto; }
  .parecer-paragrafo--indent { text-indent: 2em; }

  /* ── Fundamentação ─────────────────────────────────────────── */
  .parecer-regras-lista { list-style: none; margin: 0.75rem 0; display: flex;
    flex-direction: column; gap: 0.5rem; }
  .parecer-regra-item { border: 1px solid #dde3ee; border-radius: 3px;
    padding: 0.6rem 0.75rem; background: #fafbfd;
    page-break-inside: avoid; break-inside: avoid; }
  .parecer-regra-header { display: flex; align-items: flex-start;
    justify-content: space-between; gap: 0.4rem; margin-bottom: 0.4rem; flex-wrap: wrap; }
  .parecer-regra-nome { font-family: 'IBM Plex Sans', sans-serif; font-size: 8.5pt;
    font-weight: 600; color: #1a1a2e; }
  .parecer-veredito { font-family: 'IBM Plex Sans', sans-serif; font-size: 7pt;
    font-weight: 700; letter-spacing: 0.06em; padding: 0.15em 0.5em;
    border-radius: 999px; white-space: nowrap; -webkit-print-color-adjust: exact;
    print-color-adjust: exact; }
  .parecer-veredito--atende    { background: #d6f5e8; color: #1a6641; }
  .parecer-veredito--nao-atende { background: #fde8e4; color: #8c2914; }
  .parecer-veredito--neutro    { background: #eaecf0; color: #4a5568; }
  .parecer-regra-trecho { font-size: 8.5pt; font-style: italic; color: #4a5568;
    border-left: 2px solid #c8d0df; padding-left: 0.6rem; line-height: 1.6; }
  .parecer-sumario-regras { font-family: 'IBM Plex Sans', sans-serif; font-size: 8.5pt;
    color: #5a6a80; margin-top: 0.4rem; }

  /* ── Decisão ───────────────────────────────────────────────── */
  .parecer-decisao-box { background: #f0f4f9; border-radius: 3px;
    padding: 0.6rem 0.75rem; margin-bottom: 0.75rem;
    -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .parecer-anotacoes { margin-top: 0.4rem; }
  .parecer-anotacoes-titulo { font-family: 'IBM Plex Sans', sans-serif; font-size: 7.5pt;
    font-weight: 600; color: #5a6a80; letter-spacing: 0.06em;
    text-transform: uppercase; margin-bottom: 0.3rem; }
  .parecer-anotacoes-lista { padding-left: 1.25rem; font-size: 8.5pt;
    color: #2c3e55; line-height: 1.7; }

  /* ── Assinatura ────────────────────────────────────────────── */
  .parecer-assinatura { margin-top: 2rem; text-align: right;
    page-break-before: avoid; break-before: avoid; }
  .parecer-assinatura-linha { width: 180px; height: 1px; background: #1a1a2e;
    margin-left: auto; margin-bottom: 0.4rem; opacity: 0.3; }
  .parecer-assinatura-nome  { font-weight: 700; font-size: 9.5pt; color: #1e3a5f; }
  .parecer-assinatura-cargo,
  .parecer-assinatura-data  { font-family: 'IBM Plex Sans', sans-serif; font-size: 7.5pt;
    color: #5a6a80; margin-top: 0.1rem; }

  @page { size: A4; margin: 0; }
`;

@Injectable({ providedIn: 'root' })
export class ParecerService {
  private parecerCounter = 42;

  /**
   * Signal que armazena o parecer ativo em memória.
   * Compartilhado entre a página de aprovação, o modal de pré-visualização
   * e a página de edição. Substituir por chamada à API quando disponível.
   */
  readonly parecerAtivo = signal<Parecer | null>(null);

  /** Persiste um parecer (gerado ou editado) no signal em memória. */
  atualizarParecer(parecer: Parecer): void {
    this.parecerAtivo.set(parecer);
  }


  /**
   * Classifica uma anotação de texto livre em uma categoria semântica.
   *
   * Algoritmo: verifica as palavras-chave de cada categoria na ordem de
   * precedência definida no array `ORDEM`. Retorna 'livre' quando nenhuma
   * correspondência é encontrada.
   *
   * PONTO DE EXTENSÃO FUTURA:
   * Substituir esta função por uma chamada assíncrona a um LLM (ex: Gemini)
   * que receba o texto da anotação + contexto do processo e retorne a categoria
   * com justificativa. Isso exigirá tornar o método async e atualizar os
   * chamadores para usar await/Observable.
   */
  classificarAnotacao(texto: string): AnotacaoCategoria {
    const normalizado = texto.toLowerCase();
    const ORDEM: Exclude<AnotacaoCategoria, 'livre'>[] = [
      'agravante',    // verificado primeiro — maior impacto jurídico
      'atenuante',
      'providencia',
      'justificativa',
      'contexto',
    ];

    for (const categoria of ORDEM) {
      const achou = PALAVRAS_CHAVE[categoria].some((kw) =>
        normalizado.includes(kw)
      );
      if (achou) return categoria;
    }
    return 'livre';
  }

  gerarParecer(params: GerarParecerParams): Parecer {
    const { processo, linhas, decisaoHumana, anotacoes, timeline, relator } = params;
    const naoAtende = linhas.filter((l) => l.veredito === 'Não atende');

    // Distribuir anotações por categoria
    const por = (cat: AnotacaoCategoria) =>
      anotacoes.filter((a) => a.categoria === cat).map((a) => a.texto);

    const anotContexto = por('contexto');
    const anotJustificativa = por('justificativa');
    const anotAtenuante = por('atenuante');
    const anotAgravante = por('agravante');
    const anotProvidencia = por('providencia');

    const ementa = this.buildEmenta(linhas, naoAtende.length, anotAtenuante);
    const relatoFatos = this.buildRelatoFatos(timeline, processo, anotContexto);
    const fundamentacao = this.buildFundamentacao(linhas, naoAtende.length, anotJustificativa);
    const analiseRegras: ItemAnalise[] = linhas.map((l) => ({
      regra: l.regra,
      veredito: l.veredito as Veredito,
      fundamentacao: l.trecho,
    }));
    const conclusao = this.buildConclusao(
      naoAtende.length, decisaoHumana, processo,
      anotAtenuante, anotAgravante, anotProvidencia,
    );

    const numero = `PAR-${new Date().getFullYear()}-${String(this.parecerCounter++).padStart(4, '0')}`;
    const dataEmissao = new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric', month: 'long', year: 'numeric',
    }).format(new Date());

    const parecer: Parecer = {
      numero, processo,
      solicitante: `${relator} — Corregedoria-Geral da Justiça`,
      unidade: '1ª Vara Cível',
      classe: 'Procedimento Comum',
      assunto: 'Obrigação de fazer',
      relator, dataEmissao, ementa, relatoFatos,
      fundamentacao, analiseRegras,
      decisaoHumana, anotacoesEquipe: anotacoes,
      conclusao,
    };

    // Persiste no signal compartilhado para uso na página de edição
    this.parecerAtivo.set(parecer);
    return parecer;
  }

  /**
   * Abre uma janela isolada com o HTML do documento e dispara a impressão.
   * Abordagem mais confiável do que @media print na SPA — sem conflito
   * com o layout do Angular e com paginação multi-página correta.
   */
  imprimirParecer(): void {
    const el = document.getElementById('parecer-documento');
    if (!el) { console.warn('ParecerService: #parecer-documento não encontrado'); return; }

    const html = el.outerHTML;
    const janela = window.open('', '_blank', 'width=960,height=800,scrollbars=yes');
    if (!janela) { alert('Permita pop-ups para imprimir o parecer.'); return; }

    janela.document.open();
    janela.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Parecer Correicional</title>
  <style>${PARECER_PRINT_CSS}</style>
</head>
<body>
  ${html}
  <script>
    // Aguarda fontes e dispara impressão automaticamente
    document.fonts.ready.then(function() {
      window.focus();
      window.print();
    });
  <\/script>
</body>
</html>`);
    janela.document.close();
  }

  // Builders privados

  private buildEmenta(
    linhas: ItemVeredito[],
    naoAtendeCount: number,
    atenuantes: string[],
  ): string {
    const regrasNaoAtende = linhas
      .filter((l) => l.veredito === 'Não atende')
      .map((l) => l.regra.split('—')[1]?.trim() ?? l.regra)
      .join('; ');

    const sufixoAtenuante = atenuantes.length > 0
      ? ' Circunstâncias atenuantes registradas pela equipe responsável foram consideradas na análise.'
      : '';

    if (naoAtendeCount === 0) {
      return `Correição processual. Análise automatizada. Processo em conformidade com as regras correicionais aplicáveis. Arquivamento sem irregularidades detectadas.${sufixoAtenuante}`;
    }
    return `Correição processual. ${regrasNaoAtende}. Indicativo${naoAtendeCount > 1 ? 's' : ''} de irregularidade identificado${naoAtendeCount > 1 ? 's' : ''} pela análise automatizada. Decisão sujeita à validação humana.${sufixoAtenuante}`;
  }

  private buildRelatoFatos(
    timeline: { data: string; texto: string }[],
    processo: string,
    contextos: string[],
  ): string[] {
    const intro = `Trata-se de análise correicional automatizada referente ao processo nº ${processo}, submetido ao sistema OmnIA para verificação de conformidade processual.`;
    const fatos = timeline.map((t) => `Em ${t.data}, registrou-se o seguinte evento: ${t.texto}.`);

    // Antecedentes/contextos registrados pela equipe
    const paragrafosContexto = contextos.map(
      (c) => `Registra-se, ainda, o seguinte antecedente informado pela equipe responsável: ${c}.`
    );

    const encerramento = 'Os documentos e movimentos acima descritos foram submetidos às regras correicionais constantes da biblioteca vigente, cujos resultados são analisados na fundamentação a seguir.';
    return [intro, ...fatos, ...paragrafosContexto, encerramento];
  }

  private buildFundamentacao(
    linhas: ItemVeredito[],
    naoAtendeCount: number,
    justificativas: string[],
  ): string[] {
    const intro = naoAtendeCount === 0
      ? 'A verificação correicional automatizada foi realizada com base nas normativas do Conselho Nacional de Justiça (CNJ) e nas Resoluções internas da Corregedoria-Geral da Justiça. Cada movimento e documento constante dos autos foi cotejado com as regras da biblioteca correicional vigente.'
      : `A verificação correicional automatizada identificou ${naoAtendeCount} irregularidade${naoAtendeCount > 1 ? 's' : ''} com fundamento nas normativas do Conselho Nacional de Justiça (CNJ) e nas Resoluções internas da Corregedoria-Geral da Justiça. As regras violadas estão descritas individualmente abaixo, com indicação do trecho que motivou a sinalização.`;

    const baseNormativa = 'A obrigatoriedade de cumprimento das determinações judiciais e o controle dos prazos processuais encontram fundamento no art. 139, inciso II, do Código de Processo Civil (Lei nº 13.105/2015)¹, na Resolução CNJ nº 70/2009² e na Portaria da Corregedoria-Geral que disciplina os critérios de análise correicional automatizada³. A ausência de movimentação posterior a uma determinação configura, em regra, omissão processual sujeita à apuração correicional, nos termos do art. 235 do CPC e da jurisprudência consolidada dos Tribunais Superiores⁴.';

    const naoAtendeResumo = naoAtendeCount > 0
      ? `Das ${linhas.length} regra${linhas.length > 1 ? 's' : ''} verificadas, ${naoAtendeCount} não foi${naoAtendeCount > 1 ? 'ram' : ''} atendida${naoAtendeCount > 1 ? 's' : ''}, conforme detalhado na análise regra a regra apresentada abaixo.`
      : `Todas as ${linhas.length} regras verificadas foram atendidas. Nenhuma irregularidade foi identificada na análise automatizada.`;

    // Justificativas da equipe como parágrafos adicionais de fundamentação
    const paragrafosJustificativa = justificativas.map(
      (j) => `A equipe responsável apresentou a seguinte justificativa, considerada na fundamentação deste parecer: ${j}.`
    );

    return [intro, baseNormativa, naoAtendeResumo, ...paragrafosJustificativa];
  }

  private buildConclusao(
    naoAtendeCount: number,
    decisaoHumana: string | null,
    processo: string,
    atenuantes: string[],
    agravantes: string[],
    providencias: string[],
  ): string {
    const decisaoRegistrada = decisaoHumana ?? 'pendente de registro';

    // Partes adicionais baseadas nas anotações
    const blocoAtenuante = atenuantes.length > 0
      ? ` A equipe responsável registrou ${atenuantes.length > 1 ? 'circunstâncias atenuantes' : 'circunstância atenuante'} a serem consideradas: ${atenuantes.join('; ')}.`
      : '';

    const blocoAgravante = agravantes.length > 0
      ? ` Registra-se, ainda, ${agravantes.length > 1 ? 'fatores agravantes' : 'fator agravante'} identificados pela equipe: ${agravantes.join('; ')}, o que reforça a necessidade de providências imediatas.`
      : '';

    const blocoProvidencia = providencias.length > 0
      ? ` Recomendações específicas da equipe a serem adotadas pela unidade responsável: ${providencias.map((p, i) => `(${i + 1}) ${p}`).join(' ')}.`
      : '';

    if (naoAtendeCount === 0) {
      return `Diante da análise correicional automatizada do processo nº ${processo}, não foram identificadas irregularidades nas regras aplicadas. O processo encontra-se em conformidade com os parâmetros correicionais vigentes.${blocoAtenuante}${blocoAgravante}${blocoProvidencia} A decisão registrada pela equipe responsável foi: ${decisaoRegistrada}.`;
    }
    return `Diante da análise correicional automatizada do processo nº ${processo}, foram identificad${naoAtendeCount > 1 ? 'as' : 'a'} ${naoAtendeCount} irregularidade${naoAtendeCount > 1 ? 's' : ''} que demandam providências. As regras não atendidas indicam possível descumprimento de determinação judicial e/ou arquivamento com pendência não resolvida.${blocoAtenuante}${blocoAgravante}${blocoProvidencia} Recomenda-se a adoção das medidas corretivas cabíveis pela unidade responsável. A decisão registrada pela equipe foi: ${decisaoRegistrada}.`;
  }
}
