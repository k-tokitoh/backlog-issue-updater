import * as core from "@actions/core";
import Client, { Issue } from "../client";
import ParameterInput from "./parameterInput";

type CustomFieldWithItem = {
  name: string;
  itemName: string;
  upsert?: boolean;
};

export default class CustomFieldsWithItemsInput extends ParameterInput {
  private value: CustomFieldWithItem[];

  constructor(bareInput: string) {
    super();
    this.value = JSON.parse(bareInput);
  }

  public async toParams(client: Client, issue: Issue) {
    const customFieldsToPatch = this.customFieldsToPatch(issue);

    const customFields = await client.getCustomFields({
      urlParams: { projectIdOrKey: String(issue.projectId) },
    });

    return customFieldsToPatch.reduce(
      (accumulator: { [key in string]: number }, field) => {
        const customField = customFields.find((f) => f.name === field.name);
        if (!customField) {
          core.error(`custom field "${field.name}" is queried, but not found.`);
          return accumulator;
        }
        const key = `customField_${customField.id}`;
        const item = customField.items.find(
          (item) => item.name === field.itemName
        );
        if (!item) {
          core.error(
            `custom field item "${field.name}" is queried, but not found.`
          );
          return accumulator;
        }
        accumulator[key] = item.id;
        return accumulator;
      },
      {}
    );
  }

  private customFieldsToPatch(issue: Issue) {
    return this.value.filter((field) => {
      if (typeof field.upsert === "undefined") field.upsert = true;
      return (
        field.upsert ||
        !issue.customFields.find((f) => f.name === field.name)?.value
      );
    });
  }
}
