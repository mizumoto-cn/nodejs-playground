"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemaRowsInsert = exports.flushTable = void 0;
const bigquery_1 = require("@google-cloud/bigquery");
const flushTable = (projectId, datasetId, tableId) => {
    return `DELETE FROM \`${projectId}.${datasetId}.${tableId}\` WHERE true;`;
};
exports.flushTable = flushTable;
const schemaRowsInsert = async (rows, Env) => {
    const bqClient = new bigquery_1.BigQuery({ location: 'asia-northeast1' });
    const dataset = bqClient.dataset(Env.dest_datasetId);
    const table = dataset.table(Env.dest_tableId);
    await table.insert(rows);
};
exports.schemaRowsInsert = schemaRowsInsert;
//# sourceMappingURL=table_util.js.map