import * as core from "@actions/core";
import Client, { Issue } from "../client";
import ParameterInput from "./parameterInput";

type CustomFieldWithItem = {
  name: string;
  itemName: string;
  mode?: "skipIfPresent" | "overwrite";
};

export default class CustomFieldsWithItemsInput extends ParameterInput {
  private value: Required<CustomFieldWithItem>[];

  constructor(bareInput: string) {
    super();
    const value = JSON.parse(bareInput);
    value.mode ||= "overwrite";
    this.value = value;
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
        } else if (typeof customField.items === "undefined") {
          core.error(
            `custom field with items "${field.name}" is specified, but it's without items.`
          );
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
      return !(
        field.mode === "skipIfPresent" &&
        issue.customFields.find((f) => f.name === field.name)?.value
      );
    });
  }
}
