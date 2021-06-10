import * as core from "@actions/core";
import Client from "./client";
import StatusNameInput from "./parameterInputs/statusNameInput";
import CustomFieldsWithItemsInput from "./parameterInputs/customFieldsWithItemsInput";
import CustomFieldsWithoutItemsInput from "./parameterInputs/customFieldsWithoutItemsInput";

const inputMappers = [
  { name: "statusName", klass: StatusNameInput },
  { name: "customFieldsWithItems", klass: CustomFieldsWithItemsInput },
  {
    name: "customFieldsWithoutItems",
    klass: CustomFieldsWithoutItemsInput,
  },
];

const main: () => Promise<void> = async () => {
  try {
    const host = core.getInput("host");
    const apiKey = core.getInput("apiKey");
    const client = new Client(host, apiKey);

    const issueKey = core.getInput("issueKey");
    const issue = await client.getIssue({
      urlParams: { issueIdOrKey: issueKey },
    });

    const inputs = inputMappers
      .map((mapper) => {
        const bareInput = core.getInput(mapper.name);
        return bareInput ? new mapper.klass(bareInput) : null;
      })
      .filter((input): input is any => Boolean(input));

    const paramsArray = await Promise.all(
      inputs.map(async (input) => await input.toParams(client, issue))
    );
    const params = Object.assign({}, ...paramsArray);

    await client.patchIssue({
      urlParams: { issueIdOrKey: issueKey },
      requestParams: params,
    });
  } catch (error) {
    core.setFailed(error.message);
  }
};

main();
