import * as core from "@actions/core";
import Client, { Issue } from "../client";
import ParameterInput from "./parameterInput";

type CustomFieldWithoutItem = {
  name: string;
  value: string;
  mode?: "skipIfBlank" | "overwrite" | "append";
};

export default class CustomFieldsWithoutItemsInput extends ParameterInput {
  private value: Required<CustomFieldWithoutItem>[];

  constructor(bareInput: string) {
    super();
    const value = JSON.parse(bareInput);
    value.mode ||= "overwrite";
    this.value = value;
  }

  public async toParams(client: Client, issue: Issue) {
    const valuesToPatch = this.customFieldsToPatch(issue);

    const customFields = await client.getCustomFields({
      urlParams: { projectIdOrKey: String(issue.projectId) },
    });

    return valuesToPatch.reduce(
      (accumulator: { [key in string]: string }, field) => {
        const customField = customFields.find((f) => f.name === field.name);

        if (!customField) {
          core.error(`custom field "${field.name}" is queried, but not found.`);
          return accumulator;
        } else if (typeof customField.items !== "undefined") {
          core.error(
            `custom field without items "${field.name}" is specified, but it's with items.`
          );
          return accumulator;
        }

        const key = `customField_${customField.id}`;
        accumulator[key] = this.fieldValue(field, issue);

        return accumulator;
      },
      {}
    );
  }

  private customFieldsToPatch(issue: Issue) {
    return this.value.filter((field) => {
      return !(
        field.mode === "skipIfBlank" &&
        issue.customFields.find((f) => f.name === field.name)?.value
      );
    });
  }

  private fieldValue(field: Required<CustomFieldWithoutItem>, issue: Issue) {
    switch (field.mode) {
      case "append":
        const value = issue.customFields.find(
          (f) => f.name === field.name
        )?.value;
        const valueStr = value ? String(value) : "";
        return [valueStr, field.value].join(" ");
      default:
        return field.value;
    }
  }
}
