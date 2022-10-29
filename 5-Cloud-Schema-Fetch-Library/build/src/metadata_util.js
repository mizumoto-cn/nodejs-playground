"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamWholeProjectSchema = exports.streamSingleTableSchema = exports.fetchTableMetadata = void 0;
const bigquery_1 = require("@google-cloud/bigquery");
const bqClient = new bigquery_1.BigQuery({ location: 'asia-northeast1' });
// function returns metadata of a given table
// @param {string} projectId - ID or number of the project to query, e.g. 'my-project'
// @param {string} datasetId - ID of the dataset to query, e.g. 'my_dataset'
// @param {string} tableId - ID of the table to query, e.g. 'my_table'
// @returns {object} [metadata] of the table
const fetchTableMetadata = async (datasetId, tableId) => {
    const table = bqClient.dataset(datasetId).table(tableId);
    return await table.getMetadata();
};
exports.fetchTableMetadata = fetchTableMetadata;
const rows = [];
const cacheRows = (fields, parentId, identifier) => {
    let allChildrenCount = 0;
    for (let i = 0; i < fields.length; i++) {
        if (fields[i].fields) {
            const childIds = [];
            for (let j = 0; j < fields[i].fields.length; j++) {
                childIds.push(identifier + (parentId + allChildrenCount + i + j + 2));
            }
            cacheRow(fields[i], parentId + allChildrenCount + i + 1, childIds, identifier);
            cacheRows(fields[i].fields, parentId + allChildrenCount + i + 1, identifier);
            allChildrenCount += fields[i].fields.length;
        }
        else {
            cacheRow(fields[i], parentId + allChildrenCount + i + 1, [], identifier);
        }
    }
};
const cacheRow = (field, id, childIds, identifier) => {
    const row = {
        ID: identifier + '.' + id,
        Dataset: identifier.split('.')[0],
        Table: identifier.split('.')[1],
        Name: field.name,
        Description: field.description,
        Mode: field.mode,
        Type: field.type,
        Fields: childIds.toString(),
        PolicyTags: field.policyTags,
        MaxLength: field.maxLength,
        Precision: field.precision,
        Scale: field.scale,
        DefaultValueExpression: field.defaultValueExpression,
        Collation: field.collation,
    };
    rows.push(row);
};
const streamPool = async (dest_datasetId, dest_tableId) => {
    const destTable = bqClient.dataset(dest_datasetId).table(dest_tableId);
    await destTable.insert(rows);
};
const streamSingleTableSchema = async (env) => {
    // set rows to empty array
    rows.length = 0;
    const [metadata] = await (0, exports.fetchTableMetadata)(env.datasetId, env.tableId);
    const schema = metadata.schema;
    const identifier = env.datasetId + '.' + env.tableId;
    cacheRows(schema.fields, 0, identifier);
    try {
        await streamPool(env.dest_datasetId, env.dest_tableId);
    }
    catch (error) {
        console.log(error);
        rows.length = 0;
        return -1;
    }
    rows.length = 0;
    return rows.length;
};
exports.streamSingleTableSchema = streamSingleTableSchema;
const streamWholeProjectSchema = async (env) => {
    const [datasets] = await bqClient.getDatasets();
    // set rows to empty array
    rows.length = 0;
    // iterate through datasets and tables
    // and fetch metadata of each table
    for (const dataset of datasets) {
        const [tables] = await dataset.getTables();
        for (const table of tables) {
            const [metadata] = await table.getMetadata();
            const schema = metadata.schema;
            const identifier = dataset.id + '.' + table.id;
            cacheRows(schema.fields, 0, identifier);
        }
    }
    try {
        await streamPool(env.dest_datasetId, env.dest_tableId);
    }
    catch (error) {
        console.log(error);
        rows.length = 0;
        return -1;
    }
    rows.length = 0;
    return rows.length;
};
exports.streamWholeProjectSchema = streamWholeProjectSchema;
//# sourceMappingURL=metadata_util.js.map