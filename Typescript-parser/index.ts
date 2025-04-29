// INPUT ENTRY POINT ( TF APPLY LOG FILE )

//external imports
import fs from "fs";

//internal imports
import { LogEntry } from "./types/logEntry.js";
import { logParserFunc } from "./TF_parser/logParserFunc.js";

const LOG_FILE = process.env.LOG_FILE || "./logs/apply.json"; //this will be the dafault path inside container

fs.readFile(LOG_FILE, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  try {
    const logs: LogEntry[] = data
      .split("\n")
      .filter(line => line.trim() !== "")
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          console.warn("Invalid JSON line:", line);
          return null;
        }
      })
      .filter(log => log !== null); // Remove failed parses

    console.log("Total log entries:", logs.length);

    logParserFunc(logs);
  } catch (parseError) {
    console.error("Error parsing JSON:", parseError);
  }
});

// docker run -d --name=grafana -p 3000:3000 grafana/grafana
// node index.js > output.log 2>&1

// docker run -d --name log-parser -e POSTGRES_HOST="" -e POSTGRES_PASSWORD="" -e LOG_FILE="/logs/apply.json" -v $(pwd)/logs:logs terraform-log-parser
// docker image push abhinavnaman/terraform-log-parser:latest

//docker buildx build --platform linux/amd64,linux/arm64 -t abhinavnaman/terraform-log-parser:log-parser3 .
//docker push abhinavnaman/terraform-log-parser:log-parser3
