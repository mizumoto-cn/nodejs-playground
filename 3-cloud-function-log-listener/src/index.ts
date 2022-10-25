exports.logEntry = (data:any) => {
  const buf = Buffer.from(data.data, 'base64');
  if (buf.length) {
        const logEntry = JSON.parse(buf.toString('ascii')).protoPayload;
        console.log(`Method: ${logEntry.methodName}`)
        console.log(`Resource: ${logEntry.resourceName}`);
        console.log(`Initiator: ${logEntry.authenticationInfo.principalEmail}`);
    }
}
