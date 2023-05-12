import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const ddbClient: DynamoDBClient = new DynamoDBClient({
  region: "us-east-1", 
  credentials: {
    accessKeyId: "AKIAVKLZFNESZ5GYKOCY",
    secretAccessKey: "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",
  },
});

const ddbDocClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(ddbClient);

export { ddbDocClient, PutCommand, ScanCommand };
