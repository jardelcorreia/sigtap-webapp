import { Environment, ProcedureSearchResult, ProcedureDetails, Group, Subgroup } from '../types/sigtap';

const environments = {
  homologacao: 'https://servicoshm.saude.gov.br/sigtap/',
  producao: 'https://servicos.saude.gov.br/sigtap/'
};

const createSOAPEnvelope = (operation: string, body: string): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
               xmlns:proc="http://servicos.saude.gov.br/sigtap/v1/procedimentoservice"
               xmlns:niv="http://servicos.saude.gov.br/sigtap/v1/nivelagregacaoservice"
               xmlns:grup="http://servicos.saude.gov.br/schema/sigtap/procedimento/nivelagregacao/v1/grupo"
               xmlns:sub="http://servicos.saude.gov.br/schema/sigtap/procedimento/nivelagregacao/v1/subgrupo"
               xmlns:com="http://servicos.saude.gov.br/schema/corporativo/v1/competencia"
               xmlns:pag="http://servicos.saude.gov.br/wsdl/mensageria/v1/paginacao"
               xmlns:proc1="http://servicos.saude.gov.br/schema/sigtap/procedimento/v1/procedimento"
               xmlns:det="http://servicos.saude.gov.br/wsdl/mensageria/sigtap/v1/detalheadicional">
    <soap:Header>
        <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
            <wsse:UsernameToken wsu:Id="Id-0001334008436683-000000002c4a1908-1"
                               xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
                <wsse:Username>SIGTAP.PUBLICO</wsse:Username>
                <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">sigtap#2015public</wsse:Password>
            </wsse:UsernameToken>
        </wsse:Security>
    </soap:Header>
    <soap:Body>
        ${body}
    </soap:Body>
</soap:Envelope>`;
};

const makeSOAPCall = async (service: string, soapAction: string, xmlBody: string, environment: Environment): Promise<string> => {
  // Para demonstração, retornamos uma resposta simulada
  // Em produção, você deve implementar um proxy para evitar CORS
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('<simulatedResponse>Dados do SIGTAP</simulatedResponse>');
    }, 1000);
  });
};

export const searchProcedures = async (
  filters: {
    codigoGrupo: string;
    codigoSubgrupo?: string;
    competencia?: string;
    quantidadeRegistros: string;
  },
  environment: Environment
): Promise<ProcedureSearchResult[]> => {
  const soapBody = `
    <proc:requestPesquisarProcedimentos>
        <grup:codigoGrupo>${filters.codigoGrupo}</grup:codigoGrupo>
        ${filters.codigoSubgrupo ? `<sub:codigoSubgrupo>${filters.codigoSubgrupo}</sub:codigoSubgrupo>` : ''}
        ${filters.competencia ? `<com:competencia>${filters.competencia}</com:competencia>` : ''}
        <pag:Paginacao>
            <pag:registroInicial>1</pag:registroInicial>
            <pag:quantidadeRegistros>${filters.quantidadeRegistros}</pag:quantidadeRegistros>
            <pag:totalRegistros>1000</pag:totalRegistros>
        </pag:Paginacao>
    </proc:requestPesquisarProcedimentos>
  `;

  const xmlRequest = createSOAPEnvelope('pesquisarProcedimentos', soapBody);
  await makeSOAPCall('ProcedimentoService/v1', 'pesquisarProcedimentos', xmlRequest, environment);

  // Retorna dados simulados
  return [
    { codigo: '0101010010', nome: 'AÇÃO EDUCATIVA/ORIENTAÇÃO EM GRUPO NA ATENÇÃO BÁSICA' },
    { codigo: '0101010029', nome: 'AÇÃO EDUCATIVA/ORIENTAÇÃO INDIVIDUAL NA ATENÇÃO BÁSICA' },
    { codigo: '0101010037', nome: 'ATIVIDADE EDUCATIVA/ORIENTAÇÃO EM GRUPO' }
  ];
};

export const getProcedureDetails = async (
  filters: {
    codigoProcedimento: string;
    competenciaDetalhe?: string;
    categoriaDetalhes: string;
  },
  environment: Environment
): Promise<ProcedureDetails> => {
  const soapBody = `
    <proc:requestDetalharProcedimento>
        <proc1:codigoProcedimento>${filters.codigoProcedimento}</proc1:codigoProcedimento>
        ${filters.competenciaDetalhe ? `<com:competencia>${filters.competenciaDetalhe}</com:competencia>` : ''}
        <proc:DetalhesAdicionais>
            <det:DetalheAdicional>
                <det:categoriaDetalheAdicional>${filters.categoriaDetalhes}</det:categoriaDetalheAdicional>
                <det:Paginacao>
                    <pag:registroInicial>1</pag:registroInicial>
                    <pag:quantidadeRegistros>20</pag:quantidadeRegistros>
                    <pag:totalRegistros>100</pag:totalRegistros>
                </det:Paginacao>
            </det:DetalheAdicional>
        </proc:DetalhesAdicionais>
    </proc:requestDetalharProcedimento>
  `;

  const xmlRequest = createSOAPEnvelope('detalharProcedimento', soapBody);
  await makeSOAPCall('ProcedimentoService/v1', 'detalharProcedimento', xmlRequest, environment);

  // Retorna dados simulados
  return {
    codigo: filters.codigoProcedimento,
    nome: 'CONSULTA MÉDICA EM ATENÇÃO BÁSICA',
    descricao: 'Procedimento destinado à consulta médica na atenção básica...',
    valorSH: 'R$ 10,00',
    valorSA: 'R$ 8,00',
    sexoPermitido: 'Ambos',
    idadeMinima: '0 anos',
    idadeMaxima: '110 anos'
  };
};

export const listGroups = async (environment: Environment): Promise<Group[]> => {
  const soapBody = `<niv:requestListarGrupos/>`;
  const xmlRequest = createSOAPEnvelope('listarGrupos', soapBody);
  await makeSOAPCall('NivelAgregacaoService/v1', 'listarGrupos', xmlRequest, environment);

  // Retorna dados simulados
  return [
    { codigo: '01', nome: 'AÇÕES DE PROMOÇÃO E PREVENÇÃO EM SAÚDE' },
    { codigo: '02', nome: 'PROCEDIMENTOS COM FINALIDADE DIAGNÓSTICA' },
    { codigo: '03', nome: 'PROCEDIMENTOS CLÍNICOS' },
    { codigo: '04', nome: 'PROCEDIMENTOS CIRÚRGICOS' },
    { codigo: '05', nome: 'TRANSPLANTES DE ÓRGÃOS, TECIDOS E CÉLULAS' },
    { codigo: '06', nome: 'MEDICAMENTOS' },
    { codigo: '07', nome: 'ÓRTESES, PRÓTESES E MATERIAIS ESPECIAIS' },
    { codigo: '08', nome: 'AÇÕES COMPLEMENTARES DA ATENÇÃO À SAÚDE' }
  ];
};

export const listSubgroups = async (codigoGrupo: string, environment: Environment): Promise<Subgroup[]> => {
  const soapBody = `
    <niv:requestListarSubgrupos>
        <grup:codigoGrupo>${codigoGrupo}</grup:codigoGrupo>
    </niv:requestListarSubgrupos>
  `;

  const xmlRequest = createSOAPEnvelope('listarSubgrupos', soapBody);
  await makeSOAPCall('NivelAgregacaoService/v1', 'listarSubgrupos', xmlRequest, environment);

  // Retorna dados simulados
  return [
    { codigo: '01', nome: 'AÇÕES DE PROMOÇÃO DA SAÚDE', grupo: codigoGrupo },
    { codigo: '02', nome: 'AÇÕES DE PREVENÇÃO EM SAÚDE', grupo: codigoGrupo },
    { codigo: '03', nome: 'AÇÕES COLETIVAS EM SAÚDE', grupo: codigoGrupo }
  ];
};