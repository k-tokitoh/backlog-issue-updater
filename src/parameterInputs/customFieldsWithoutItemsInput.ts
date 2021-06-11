import Client, { Issue } from "../client";
import ParameterInput from "./parameterInput";

type CustomFieldWithoutItem = {
  name: string;
  value: string;
  upsert?: boolean;
};

export default class CustomFieldsWithoutItemsInput extends ParameterInput {
  private value: CustomFieldWithoutItem[];

  constructor(bareInput: string) {
    super();
    this.value = JSON.parse(bareInput);
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
          console.error(
            `custom field "${field.name}" is queried, but not found.`
          );
          return accumulator;
        }
        const key = `customField_${customField.id}`;
        accumulator[key] = field.value;
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
