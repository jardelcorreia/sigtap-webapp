import Dexie from 'dexie';
import { Group, Subgroup, ProcedureDetails } from '../types/sigtap';

class SigtapDatabase extends Dexie {
  public groups: Dexie.Table<Group, string>;
  public subgroups: Dexie.Table<Subgroup, string>;
  public procedures: Dexie.Table<ProcedureDetails, string>;

  public constructor() {
    super('SigtapDatabase');
    this.version(1).stores({
      groups: 'codigo, nome',
      subgroups: 'codigo, nome, grupo',
      procedures: 'codigo, nome',
    });
    this.groups = this.table('groups');
    this.subgroups = this.table('subgroups');
    this.procedures = this.table('procedures');
  }
}

export const db = new SigtapDatabase();

export const addGroups = async (groups: Group[]) => {
  await db.groups.bulkPut(groups);
};

export const addSubgroups = async (subgroups: Subgroup[]) => {
  await db.subgroups.bulkPut(subgroups);
};

export const addProcedures = async (procedures: ProcedureDetails[]) => {
  await db.procedures.bulkPut(procedures);
};

export const getGroups = async (): Promise<Group[]> => {
  return db.groups.toArray();
};

export const getSubgroups = async (codigoGrupo: string): Promise<Subgroup[]> => {
  return db.subgroups.where('grupo').equals(codigoGrupo).toArray();
};

export const getProcedureDetails = async (codigoProcedimento: string): Promise<ProcedureDetails | undefined> => {
  return db.procedures.get(codigoProcedimento);
};

export const searchProcedures = async (filters: {
  codigoGrupo: string;
  codigoSubgrupo?: string;
}): Promise<ProcedureDetails[]> => {
  let collection = db.procedures.where('codigo').startsWith(filters.codigoGrupo);
  if (filters.codigoSubgrupo) {
    collection = collection.and(procedure => procedure.codigo.startsWith(`${filters.codigoGrupo}${filters.codigoSubgrupo}`));
  }
  return collection.toArray();
};
