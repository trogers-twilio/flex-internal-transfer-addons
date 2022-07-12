# Flex Internal Transfer Addons

Twilio Flex Plugins allow you to customize the appearance and behavior of [Twilio Flex](https://www.twilio.com/flex). If you want to learn more about the capabilities and how to use the API, check out our [Flex documentation](https://www.twilio.com/docs/flex).

This solution provides the following enhancements / modifications to the Flex native internal transfer experience:

1. Removes the Agents tab in the transfer directory, so Agents are not able to transfer directly to other agents
1. Hides a configurable list of Queues from the Queues tab of the transfer directory
1. Adds support for an Hours of Operations check on each queue and hides closed queues from the Queues tab of the transfer directory
1. Sets the priority of a transferred task to the same priority used for new inbound tasks of the target transfer queue

## Setup

### Twilio Functions

The Twilio Functions should be deployed first so the serverless environment domain can be captured for use in the Flex Plugin. Navigate to the [`serverless`](/serverless) folder in this repository for instructions on deploying the Twilio Function.

> **NOTE:** Once the Twilio Function is deployed, make note of the Domain returned by the CLI command `twilio serverless:deploy`

### Flex Plugin

Navigate to the [`plugin-internal-transfer-addons`](/plugin-internal-transfer-addons/) folder in this repository for instructions on deploying the Flex Plugin.

> **NOTE:** Before deploying, make a copy of `.env.sample` in the plugin folder, rename it to `.env` and populate the `REACT_APP_SERVERLESS_DOMAIN=` variable with the Twilio Serverless Domain noted from the Twilio Function deployment.

---


Make sure you have [Node.js](https://nodejs.org) as well as [`npm`](https://npmjs.com). We support Node >= 10.12 (and recommend the _even_ versions of Node). Afterwards, install the dependencies by running `npm install`:

```bash
cd 

# If you use npm
npm install
```

Next, please install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart) by running:

```bash
brew tap twilio/brew && brew install twilio
```

Finally, install the [Flex Plugin extension](https://github.com/twilio-labs/plugin-flex/tree/v1-beta) for the Twilio CLI:

```bash
twilio plugins:install @twilio-labs/plugin-flex
```

## Development

Run `twilio flex:plugins --help` to see all the commands we currently support. For further details on Flex Plugins refer to our documentation on the [Twilio Docs](https://www.twilio.com/docs/flex/developer/plugins/cli) page.

