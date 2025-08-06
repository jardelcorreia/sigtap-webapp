export interface ProcedureSearchResult {
  codigo: string;
  nome: string;
}

export interface ProcedureDetails {
  codigo: string;
  nome: string;
  descricao: string;
  valorSH: string;
  valorSA: string;
  sexoPermitido: string;
  idadeMinima: string;
  idadeMaxima: string;
}

export interface Group {
  codigo: string;
  nome: string;
}

export interface Subgroup {
  codigo: string;
  nome: string;
  grupo: string;
}

export interface SearchFilters {
  codigoGrupo: string;
  codigoSubgrupo?: string;
  competencia?: string;
  quantidadeRegistros: string;
}

export interface DetailFilters {
  codigoProcedimento: string;
  competenciaDetalhe?: string;
  categoriaDetalhes: string;
}

export type Environment = 'homologacao' | 'producao';

export type TabType = 'search' | 'details' | 'groups';