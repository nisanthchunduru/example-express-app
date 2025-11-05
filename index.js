const express = require("express");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

const PORT = process.env.PORT || 3000;

const TABLE_NAME = "example-express-app-table";

const client = new DynamoDBClient({});
// const client = new DynamoDBClient({ region: "eu-north-1" });
const docClient = DynamoDBDocumentClient.from(client);

async function getDynamoItem(tableName, key) {
  const command = new GetCommand({
    TableName: tableName,
    Key: key,
  });
  const response = await docClient.send(command);
  if (!response.Item) {
    throw new Error(`An item having key ${key} does not exist in ${tableName}`);
  }
  return response.Item;
}

async function getHealthDynamoItem() {
  return getDynamoItem(TABLE_NAME, { pk: "health" });
}

async function getHealthStatus() {
  const item = await getHealthDynamoItem();
  return item.status;
}

const app = express();

app.get("/health", async (req, res) => {
  try {
    const status = await getHealthStatus();
    res.json({ status });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      error: {
        message: e.message,
      },
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
