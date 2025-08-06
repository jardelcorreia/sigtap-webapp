import { Environment, ProcedureSearchResult, ProcedureDetails, Group, Subgroup } from '../types/sigtap';
import { db, searchProcedures as searchProceduresFromDb, getProcedureDetails as getProcedureDetailsFromDb, listGroups as listGroupsFromDb, listSubgroups as listSubgroupsFromDb } from './dbService';

const environments = {
  homologacao: '/api/sigtap/',
  producao: '/api-prod/sigtap/'
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
  const url = `${environments[environment]}${service}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/soap+xml; charset=utf-8',
      'SOAPAction': soapAction,
    },
    body: xmlBody,
  });

  if (!response.ok) {
    throw new Error(`SOAP call failed with status ${response.status}`);
  }

  return response.text();
};

const parseXML = (xmlString: string): Document => {
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, 'text/xml');
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
  const localProcedures = await searchProceduresFromDb(filters);
  if (localProcedures.length > 0) {
    return localProcedures.map(p => ({ codigo: p.codigo, nome: p.nome }));
  }

  const isOnline = await checkServiceStatus();
  if (!isOnline) {
    throw new Error('Serviço offline. Sincronize os dados para usar a aplicação offline.');
  }

  const soapBody = `
    <proc:requestPesquisarProcedimentos>
        <grup:codigoGrupo>${filters.codigoGrupo}</grup:codigoGrupo>
        ${filters.codigoSubgrupo ? `<sub:codigoSubgrupo>${filters.codigoSubgrupo}</sub:codigoSubgrupo>` : ''}
        ${filters.competencia ? `<com:competencia>${filters.competencia}</com:competencia>` : ''}
        <pag:Paginacao>
            <pag:registroInicial>1</pag:registroInicial>
            <pag:quantidadeRegistros>${filters.quantidadeRegistros}</pag:quantidadeRegistros>
        </pag:Paginacao>
    </proc:requestPesquisarProcedimentos>
  `;

  const xmlRequest = createSOAPEnvelope('pesquisarProcedimentos', soapBody);
  const xmlResponse = await makeSOAPCall('ProcedimentoService/v1', 'pesquisarProcedimentos', xmlRequest, environment);
  const doc = parseXML(xmlResponse);
  const procedureNodes = doc.querySelectorAll('procedimento');

  const procedures = Array.from(procedureNodes).map(node => ({
    codigo: node.querySelector('codigo')?.textContent ?? '',
    nome: node.querySelector('nome')?.textContent ?? '',
    descricao: '',
    valorSH: '',
    valorSA: '',
    sexoPermitido: '',
    idadeMinima: '',
    idadeMaxima: '',
  }));

  await db.procedures.bulkPut(procedures);
  return procedures.map(p => ({ codigo: p.codigo, nome: p.nome }));
};

export const getProcedureDetails = async (
  filters: {
    codigoProcedimento: string;
    competenciaDetalhe?: string;
    categoriaDetalhes: string;
  },
  environment: Environment
): Promise<ProcedureDetails> => {
  const localProcedure = await getProcedureDetailsFromDb(filters.codigoProcedimento);
  if (localProcedure) {
    return localProcedure;
  }

  const isOnline = await checkServiceStatus();
  if (!isOnline) {
    throw new Error('Serviço offline. Sincronize os dados para usar a aplicação offline.');
  }

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
                </det:Paginacao>
            </det:DetalheAdicional>
        </proc:DetalhesAdicionais>
    </proc:requestDetalharProcedimento>
  `;

  const xmlRequest = createSOAPEnvelope('detalharProcedimento', soapBody);
  const xmlResponse = await makeSOAPCall('ProcedimentoService/v1', 'detalharProcedimento', xmlRequest, environment);
  const doc = parseXML(xmlResponse);
  const procedureNode = doc.querySelector('procedimento');

  const procedureDetails = {
    codigo: procedureNode?.querySelector('codigo')?.textContent ?? '',
    nome: procedureNode?.querySelector('nome')?.textContent ?? '',
    descricao: procedureNode?.querySelector('descricao')?.textContent ?? '',
    valorSH: procedureNode?.querySelector('valorSH')?.textContent ?? '',
    valorSA: procedureNode?.querySelector('valorSA')?.textContent ?? '',
    sexoPermitido: procedureNode?.querySelector('sexoPermitido')?.textContent ?? '',
    idadeMinima: procedureNode?.querySelector('idadeMinima')?.textContent ?? '',
    idadeMaxima: procedureNode?.querySelector('idadeMaxima')?.textContent ?? '',
  };

  await db.procedures.put(procedureDetails);
  return procedureDetails;
};

export const listGroups = async (environment: Environment): Promise<Group[]> => {
  const localGroups = await listGroupsFromDb();
  if (localGroups.length > 0) {
    return localGroups;
  }

  const isOnline = await checkServiceStatus();
  if (!isOnline) {
    throw new Error('Serviço offline. Sincronize os dados para usar a aplicação offline.');
  }

  const soapBody = `<niv:requestListarGrupos/>`;
  const xmlRequest = createSOAPEnvelope('listarGrupos', soapBody);
  const xmlResponse = await makeSOAPCall('NivelAgregacaoService/v1', 'listarGrupos', xmlRequest, environment);
  const doc = parseXML(xmlResponse);
  const groupNodes = doc.querySelectorAll('Grupo');

  const groups = Array.from(groupNodes).map(node => ({
    codigo: node.querySelector('codigoGrupo')?.textContent ?? '',
    nome: node.querySelector('nomeGrupo')?.textContent ?? '',
  }));

  await db.groups.bulkPut(groups);
  return groups;
};

export const listSubgroups = async (codigoGrupo: string, environment: Environment): Promise<Subgroup[]> => {
  const localSubgroups = await listSubgroupsFromDb(codigoGrupo);
  if (localSubgroups.length > 0) {
    return localSubgroups;
  }

  const isOnline = await checkServiceStatus();
  if (!isOnline) {
    throw new Error('Serviço offline. Sincronize os dados para usar a aplicação offline.');
  }

  const soapBody = `
    <niv:requestListarSubgrupos>
        <grup:codigoGrupo>${codigoGrupo}</grup:codigoGrupo>
    </niv:requestListarSubgrupos>
  `;

  const xmlRequest = createSOAPEnvelope('listarSubgrupos', soapBody);
  const xmlResponse = await makeSOAPCall('NivelAgregacaoService/v1', 'listarSubgrupos', xmlRequest, environment);
  const doc = parseXML(xmlResponse);
  const subgroupNodes = doc.querySelectorAll('Subgrupo');

  const subgroups = Array.from(subgroupNodes).map(node => ({
    codigo: node.querySelector('codigoSubgrupo')?.textContent ?? '',
    nome: node.querySelector('nomeSubgrupo')?.textContent ?? '',
    grupo: codigoGrupo,
  }));

  await db.subgroups.bulkPut(subgroups);
  return subgroups;
};

export const checkServiceStatus = async (): Promise<boolean> => {
  try {
    await listGroups('producao');
    return true;
  } catch (error) {
    return false;
  }
};