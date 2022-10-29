import {BigQuery} from '@google-cloud/bigquery';
import {cloudEvent} from '@google-cloud/functions-framework';
import {flushTable} from './table_util';
import {Env} from './env';
import {IEnv} from './metadata_util';
import {
  streamSingleTableSchema,
  streamWholeProjectSchema,
} from './metadata_util';

const fetchSchema = async (single: boolean): Promise<number> => {
  if (
    !Env.projectId ||
    !Env.datasetId ||
    !Env.tableId ||
    !Env.dest_datasetId ||
    !Env.dest_tableId
  ) {
    throw new Error('Missing environment variables');
  }
  const env: IEnv = {
    projectId: Env.projectId,
    datasetId: Env.datasetId,
    tableId: Env.tableId,
    dest_datasetId: Env.dest_datasetId,
    dest_tableId: Env.dest_tableId,
  };
  const bqClient = new BigQuery({location: 'asia-northeast1'});
  await bqClient.query(
    flushTable(Env.projectId, Env.dest_datasetId, Env.dest_tableId)
  );
  // TODO
  return single
    ? await streamSingleTableSchema(env)
    : await streamWholeProjectSchema(env);
};

cloudEvent('flushSchema', async cloudEvent => {
  const watch_single_table: boolean = JSON.parse(
    JSON.stringify(cloudEvent.data)
  )['watch_single_table'];
  console.log('watch_single_table: ' + watch_single_table);
  return await fetchSchema(watch_single_table);
});
