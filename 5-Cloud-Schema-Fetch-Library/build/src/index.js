"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bigquery_1 = require("@google-cloud/bigquery");
const functions_framework_1 = require("@google-cloud/functions-framework");
const table_util_1 = require("./table_util");
const env_1 = require("./env");
const metadata_util_1 = require("./metadata_util");
const fetchSchema = async (single) => {
    if (!env_1.Env.projectId ||
        !env_1.Env.datasetId ||
        !env_1.Env.tableId ||
        !env_1.Env.dest_datasetId ||
        !env_1.Env.dest_tableId) {
        throw new Error('Missing environment variables');
    }
    const env = {
        projectId: env_1.Env.projectId,
        datasetId: env_1.Env.datasetId,
        tableId: env_1.Env.tableId,
        dest_datasetId: env_1.Env.dest_datasetId,
        dest_tableId: env_1.Env.dest_tableId,
    };
    const bqClient = new bigquery_1.BigQuery({ location: 'asia-northeast1' });
    await bqClient.query((0, table_util_1.flushTable)(env_1.Env.projectId, env_1.Env.dest_datasetId, env_1.Env.dest_tableId));
    // TODO
    return single
        ? await (0, metadata_util_1.streamSingleTableSchema)(env)
        : await (0, metadata_util_1.streamWholeProjectSchema)(env);
};
(0, functions_framework_1.cloudEvent)('fetchSchema', async (cloudEvent) => {
    const watch_single_table = JSON.parse(JSON.stringify(cloudEvent.data))['watch_single_table'] === 'true';
    console.log('watch_single_table: ' + watch_single_table);
    return await fetchSchema(watch_single_table);
});
//# sourceMappingURL=index.js.map