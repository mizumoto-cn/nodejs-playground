import {BigQuery} from '@google-cloud/bigquery';
const bqClient = new BigQuery({location: 'asia-northeast1'});

import {Env} from './env';

const flushTable = async (datasetId: string, tableId: string) => {
  const query = `DELETE FROM \`${Env.projectId}.${datasetId}.${tableId}\` WHERE true;`;
  await bqClient.query(query);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
exports.fetchSchema = async (_event: never, _context: never) => {
  if (
    !Env.projectId ||
    !Env.datasetId ||
    !Env.tableId ||
    !Env.dest_datasetId ||
    !Env.dest_tableId
  ) {
    throw new Error('Missing environment variables');
  }
  await flushTable(Env.dest_datasetId, Env.dest_tableId);
  // TODO
};
