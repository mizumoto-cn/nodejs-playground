import {BigQuery} from '@google-cloud/bigquery';
import {IRow} from './metadata_util';

interface IEnv {
  projectId: string;
  datasetId: string;
  tableId: string;
  dest_datasetId: string;
  dest_tableId: string;
}

export const flushTable = (
  projectId: string,
  datasetId: string,
  tableId: string
): string => {
  return `DELETE FROM \`${projectId}.${datasetId}.${tableId}\` WHERE true;`;
};

export const schemaRowsInsert = async (rows: IRow[], Env: IEnv) => {
  const bqClient = new BigQuery({location: 'asia-northeast1'});
  const dataset = bqClient.dataset(Env.dest_datasetId);
  const table = dataset.table(Env.dest_tableId);
  await table.insert(rows);
};
