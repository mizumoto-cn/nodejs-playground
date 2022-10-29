import { IRow } from './metadata_util';
interface IEnv {
    projectId: string;
    datasetId: string;
    tableId: string;
    dest_datasetId: string;
    dest_tableId: string;
}
export declare const flushTable: (projectId: string, datasetId: string, tableId: string) => string;
export declare const schemaRowsInsert: (rows: IRow[], Env: IEnv) => Promise<void>;
export {};
