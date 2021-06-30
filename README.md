# Backlog Issue Updater

A Github Action to update issues on a project management tool "[Backlog](https://backlog.com/)" through [its API](https://developer.nulab.com/docs/backlog).

## Metadata

See [here](https://github.com/k-tokitoh/backlog-issue-updater/blob/master/action.yml).

## Usage

```yml
steps:
  - name: get issue key
    id: get-issue-key
    # An example for the case there is a rule that branch names begin with its corresponding issue key.
    run: |
      issueKey=`echo ${{ github.head_ref }} | grep -o -e '[A-Z]\{1,\}-[0-9]\{1,\}'`
      echo "::set-output name=ISSUE_KEY::${issueKey}"
  - name: main
    uses: k-tokitoh/backlog-issue-updater@v0.6.0
    with:
      host: https://example.backlog.jp/api/v2
      apiKey: ${{ secrets.BACKLOG_API_KEY }}
      issueKey: ${{ steps.get-issue-key.outputs.ISSUE_KEY }}
      statusName: "done"
      customFieldsWithItems: |
        [
          {
            "name": "a custom field with items",
            "itemName": "name of an item listed for this custom field"
          }
        ]
      customFieldsWithoutItems: |
        [
          {
            "name": "another custom field",
            "value": "another value"
          },
          {
            "name": "a custom field without items",
            "value": "value as you like",
            "mode": "append"
          }
        ]
```
