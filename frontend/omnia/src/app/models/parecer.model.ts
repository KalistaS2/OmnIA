import { Veredito } from '../mock-data/prototype-data';

// Re-export para que outros módulos possam importar de um único lugar
export type { Veredito };

/**
 * Categoria semântica de uma anotação da equipe.
 * A categoria determina em qual seção do parecer o conteúdo será integrado.
 *
 * - `contexto`      → Relatório (I): acrescenta parágrafo de antecedente/histórico
 * - `justificativa` → Fundamentação (II): acrescenta parágrafo de justificativa jurídica
 * - `atenuante`     → Ementa + Conclusão (III): ameniza tom; menciona circunstâncias atenuantes
 * - `agravante`     → Conclusão (III): reforça gravidade; menciona reincidência/agravante
 * - `providencia`   → Conclusão (III): acrescenta recomendação formal de providência
 * - `livre`         → Seção IV: listada como anotação da equipe sem impacto estrutural
 *
 * EXTENSÃO FUTURA: substituir a detecção por palavras-chave por chamada a LLM
 * para classificação semântica mais precisa.
 */
export type AnotacaoCategoria =
  | 'contexto'
  | 'justificativa'
  | 'atenuante'
  | 'agravante'
  | 'providencia'
  | 'livre';

export interface AnotacaoClassificada {
  texto: string;
  categoria: AnotacaoCategoria;
}

export interface ItemAnalise {
  regra: string;
  veredito: Veredito;
  fundamentacao: string;
}

export interface Parecer {
  numero: string;
  processo: string;
  /** Órgão ou servidor que requisitou o parecer */
  solicitante: string;
  unidade: string;
  classe: string;
  assunto: string;
  relator: string;
  dataEmissao: string;
  ementa: string;
  relatoFatos: string[];
  /** Parágrafo(s) de fundamentação jurídica narrativa (normativas e doutrina) */
  fundamentacao: string[];
  analiseRegras: ItemAnalise[];
  decisaoHumana: string | null;
  /** Anotações classificadas da equipe — cada uma carrega sua categoria semântica */
  anotacoesEquipe: AnotacaoClassificada[];
  conclusao: string;
}

