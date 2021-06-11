import * as core from "@actions/core";
import Client from "./client";
import ParamsBuilder from "./paramsBuilder";
import { bareInputNames, BareInputs } from "./constants";

const main: () => Promise<void> = async () => {
  try {
    const host = core.getInput("host");
    const apiKey = core.getInput("apiKey");
    const client = new Client(host, apiKey);

    const issueKey = core.getInput("issueKey");
    const issue = await client.getIssue({
      urlParams: { issueIdOrKey: issueKey },
    });

    const bareInputs = bareInputNames.reduce(
      (accumulator: BareInputs, name) => {
        accumulator[name] = core.getInput(name);
        return accumulator;
      },
      {}
    );

    const params = await ParamsBuilder.execute(bareInputs, client, issue);
    core.info(`params: ${JSON.stringify(params)}`);

    const patchedIssue = await client.patchIssue({
      urlParams: { issueIdOrKey: issueKey },
      requestParams: params,
    });

    core.info(`patchedIssue: ${JSON.stringify(patchedIssue)}`);
    core.setOutput("updated", true);
  } catch (err) {
    core.error(err.name + ": " + err.message);
    core.setOutput("updated", false);
  }
};

main();
