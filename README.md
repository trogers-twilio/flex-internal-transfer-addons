# Flex Internal Transfer Addons

Twilio Flex Plugins allow you to customize the appearance and behavior of [Twilio Flex](https://www.twilio.com/flex). If you want to learn more about the capabilities and how to use the API, check out our [Flex documentation](https://www.twilio.com/docs/flex).

This solution provides the following enhancements / modifications to the Flex native internal transfer experience:

1. Removes the Agents tab in the transfer directory, so agents are not able to transfer directly to other agents. The tab can be conditionally displayed to agents based on their skills.
1. Hides a configurable list of Queues from the Queues tab of the transfer directory
1. Adds support for an Hours of Operations check on each queue. Displays a CLOSED message with hours of operation on each closed queue on the Queues tab of the transfer directory, and shows a closed notification with hours of operation if the agent tries transferring to a closed queue.
1. Sets the priority of a transferred task to the same priority used for new inbound tasks of the target transfer queue
1. Supports filtering the list of queues in the transfer directory based on the selected task's queue name and task channel

## Setup

### Twilio Functions

The Twilio Functions should be deployed first so the serverless environment domain can be captured for use in the Flex Plugin. Navigate to the [`serverless`](/serverless) folder in this repository for instructions on deploying the Twilio Function.

> **NOTE:** Once the Twilio Function is deployed, make note of the Domain returned by the CLI command `twilio serverless:deploy`

### Flex Plugin

Navigate to the [`plugin-internal-transfer-addons`](/plugin-internal-transfer-addons/) folder in this repository for instructions on deploying the Flex Plugin.

> **NOTE:** Before deploying, make a copy of `.env.sample` in the plugin folder, rename it to `.env` and populate the `REACT_APP_SERVERLESS_DOMAIN=` variable with the Twilio Serverless Domain noted from the Twilio Function deployment.

## Configuration

### Hidden Agent Tab in Transfer Directory

The Agents tab can be disabled globally for all agents, then conditionally shown to only agents with specific skills. This is controlled in the [Flex Configuration](https://www.twilio.com/docs/flex/developer/ui/configuration#modifying-configuration-for-flextwiliocom) property `ui_attributes.internalTransferAddonsPlugin.agentTransferDirectory`.

Within that parent property, the following properties can be configured:

* `isGloballyDisabled`: boolean
  * If `true`, will remove the Agents tab from the transfer directory for all agents, except those with a skill matching one defined in `enabledSkills`
* `enabledSkills`: Array of strings
  * If an agent has at least one skill matching a skill defined in this array, then the Agents tab will not be removed from the transfer directory even if `isGloballyDisabled` is set to `true`

> NOTE: Skill names in the `enabledSkills` array are case sensitive. They must match the agent skill name exactly.

Here is an example config for the parent property:

```json
"internalTransferAddonsPlugin": {
  ...,
  "agentTransferDirectory": {
    "isGloballyDisabled": true,
    "enabledSkills": [
      "Skill_1",
      "Skill_2"
    ]
  }
}
```

### Hidden Queues in Transfer Directory

By default, the Flex UI will show all active TaskQueues in the Queues tab of the transfer directory. However, the Flex UI supports hiding Queues from the [WorkerDirectoryTabs](https://www.twilio.com/docs/flex/developer/ui/components#workerdirectorytabs) by setting `Flex.WorkerDirectoryTabs.defaultProps.hiddenQueueFilter`.

This plugin looks for the list of queue names to hide in the [Flex Configuration](https://www.twilio.com/docs/flex/developer/ui/configuration#modifying-configuration-for-flextwiliocom) property `ui_attributes.internalTransferAddonsPlugin.hiddenTransferQueues`. Please follow the Twilio documentation for modifying the [Flex Configuration](https://www.twilio.com/docs/flex/developer/ui/configuration#modifying-configuration-for-flextwiliocom).

> NOTE: Queues names in the `hiddenTransferQueues` array are case sensitive. They must match the TaskQueue name exactly.

Here is an example config for this property:

```json
"internalTransferAddonsPlugin": {
  ...,
  "hiddenTransferQueues": [
    "HiddenQueueName1",
    "HiddenQueueName2",
    "HiddenQueueName3"
  ]
}
```

### Queue Hours of Operation 

The hours of operation and holidays are maintained in the `queue-hoops` asset file. Navigate to [`serverless/assets/queue-hoops.private.json`](/serverless/assets/queue-hoops.private.json) folder in this repository for an example of the configuration file structure.

#### Timezone

The first property is `timezone`. Set this to the timezone for the open and close hours. It will be converted to the Flex user's local timezone when evaluating if a queue is open or closed at the time of transfer. You can fine a list of timezone names in the Wikipedia article, [List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

#### Hours of Operation

Hours for all queues, regardless of name, can be set in the `global.global` property. Hours are defined for each day, using the three letter abbreviation for the day of week: `[Mon, Tue, Wed, Thu, Fri, Sat, Sun]`. Any days not included will be considered closed for the entire day.

Only full hours are supported, not half hours, and must be specified in 24 hour format. So a queue could open at 8:00am, but not 8:30am. And if it's closing at 5:00pm, the hour would be `17`.

For example, to set the open hours for all queues to `Mon to Fri, 8:00am to 5:00pm`, this would be the `global.global` config:

```json
{
  "global": {
    "global": {
      "Mon": {
        "open": 8,
        "close": 17
      },
      "Tue": {
        "open": 8,
        "close": 17
      },
      "Wed": {
        "open": 8,
        "close": 17
      },
      "Thu": {
        "open": 8,
        "close": 17
      },
      "Fri": {
        "open": 8,
        "close": 17
      },
    }
  }
}
```

To set the hours for a group of queues containing a key word or phrase, that word or phrase can be defined in the top level `global` property.

For example, if all queues with `Support` in the TaskQueue name are open from 5:00am to 9:00pm, this would be the config:

```json
{
  "global": {
    "global" {
      ...
    },
    "support": {
      "Mon": {
        "open": 5,
        "close": 21
      },
      "Tue": {
        "open": 5,
        "close": 21
      },
      ...
    }
  }
}
```

Queues with `Support` anywhere in their TaskQueue name will match the `global.support` hours. All other queues will match the `global.global` hours.

Now let's say there a single Support queue named `Support Mobile` that has different hours from all other Support queues. This queue is open 24 hours. This is supported in the configuration by defining the first key word or phrase of the queue name at the top level, and the second key word or phrase within that top level property.

For example, here is how we would override the general `Support` hours only for the `Support Mobile` queue, which is open 24 hours:

```json 
{
  "global": {
    "global" {
      ...
    },
    "support": {
      "Mon": {
        "open": 5,
        "close": 21
      },
      "Tue": {
        "open": 5,
        "close": 21
      },
      ...
    }
  },
  "support": {
    "mobile": {
      "Mon": {
        "open": 0,
        "close": 24
      },
      "Tue": {
        "open": 0,
        "close": 24
      },
      ...
    }
  }
}
```

Notice that we define 24 hours with an open hour of `0` and a close hour of `24`. This can be used for all queues that do not close at all on a particular day.

With the above config, any queues with `Support` and `Mobile` in their name will match the `support.mobile` hours. Any other queues with `Support` in their name will match the `global.support` hours. All other queues will match the hours in `global.global`.

#### Holidays
Days that queues are closed for a holiday or any other reason the normal hours should be ignored are defined in the `holidays` property under the appropriate matching queue name key.

Days are defined with the three letter month abbreviation and the numeric day of the month. The month abbreviations are `[Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec]`.

Continuing with the examples above, let's say that:

* All queues are closed December 25th, January 1st, and July 4th...
* ...except Support queues, which are only closed December 25th and January 1st...
* ...except Support Mobile queues, which are only closed December 25th

This is what that configuration would look like:

```json
{
  "global": {
    "global" {
      "holidays":[
        "Jan 1",
        "Jul 4",
        "Dec 25"
      ],
      "Mon": {
        "open": 8,
        "close": 17
      },
      "Tue": {
        "open": 8,
        "close": 17
      },
      ...
    },
    "support": {
      "holidays":[
        "Jan 1",
        "Dec 25"
      ],
      "Mon": {
        "open": 5,
        "close": 21
      },
      "Tue": {
        "open": 5,
        "close": 21
      },
      ...
    }
  },
  "support": {
    "mobile": {
      "holidays":[
        "Dec 25"
      ],
      "Mon": {
        "open": 0,
        "close": 24
      },
      "Tue": {
        "open": 0,
        "close": 24
      },
      ...
    }
  }
}
```

### Task Priority on Transfer

By default, when a task is transferred in Flex, the task priority is not changed. The challenge this creates is that if a task is being transferred to a queue where new tasks routed to that queue are given a higher priority than the transferred task, that transferred task will essentially get "stuck" behind all new tasks and will not route to an agent until there are no more higher priority tasks waiting in the queue.

This plugin feature avoids that scenario by setting the transferred task's priority to the highest priority used for new tasks entering the target queue. 

The new priority for the transferred task is determined by evaluating all TaskRouter Workflows, looking for routing steps referencing the target TaskQueue SID. The priority defined in the matching routing step is what's used for the transferred task.

If multiple routing steps are found referencing the target TaskQueue, the highest priority used in the matching routing steps is what's used for the transferred task.

If no routing steps are found referencing the target TaskQueue, the transferred task's priority is not changed.

> NOTE: This feature is only designed to work with task priorities controlled by Workflow routing steps. If task priorities are being set in other ways, such as at task creation, the plugin will not be aware of it and it may result in the "stuck" task scenario described above.

### Filtering Transfer Queues by Selected Task Line of Business and TaskChannel

For contact centers that support multiple lines of business (LOB) and / or multiple channels (such as voice and chat), filtering the list of queues in the transfer directory to only those queues associated with the selected task's line of business and TaskChannel can improve agent efficient and reduce transfers to the wrong queue. This capability is offered through two different [Flex Configuration](https://www.twilio.com/docs/flex/developer/ui/configuration#modifying-configuration-for-flextwiliocom) properties.

#### Filtering by Line of Business

The line of business filter is controlled with the property `ui_attributes.internalTransferAddonsPlugin.lobTransferQueueFilter`. Each key in this object is the starting name of the queue to match. The value of each key is an array of strings containing partial names of queues to show in the transfer directory. To exclude queues, start the string with `"!"`.

For example, let's say we have three lines of business: "Shoes", "Computers", and "Hats". Here's a sample config to ensure the transfer directory only shows queues associated with the selected task's line of business:

```json
"internalTransferAddonsPlugin": {
  ...,
  "lobTransferQueueFilter": {
    "Shoes": [
      "Shoes"
    ],
    "Computers": [
      "Computers"
    ],
    "Hats": [
      "Hats"
    ]
  }
}
```

Now let's say we have a general support queue called "Apparel Support" that we want to be able to transfer to either the "Shoes" or "Hats" queue, but not "Computers". That configuration could look like this:

```json
"internalTransferAddonsPlugin": {
  ...,
  "lobTransferQueueFilter": {
    "Shoes": [
      "Shoes"
    ],
    "Computers": [
      "Computers"
    ],
    "Hats": [
      "Hats"
    ],
    "Apparel Support": [
      "Shoes",
      "Hats"
    ]
  }
}
```

Now let's say there is a queue called "Computers After Hours Support" that should be excluded from the "Computers" line of business transfer list. The configuration could be updated like this:

```json
"internalTransferAddonsPlugin": {
  ...,
  "lobTransferQueueFilter": {
    "Shoes": [
      "Shoes"
    ],
    "Computers": [
      "Computers"
      "!After Hours"
    ],
    "Hats": [
      "Hats"
    ],
    "Apparel Support": [
      "Shoes",
      "Hats"
    ]
  }
}
```

By prefixing "After Hours" with "!", any queues that made it into the matched queue list via "Computers" will be removed from the list if they contain "After Hours" in their name.

If there are multiple matches of the object key to the queue name, then the key with the most characters will be the one used. This allows for easily overriding the "higher level" config for a specific queue.

For example, let's say we have multiple queues for the "Computers" line of business, such as "Computers Sales", "Computers Support", "Computers Escalation", and "Computers Apparel". In this example, the "Computers Apparel" queue provides support for the "Shoes" and "Hats" lines of business, so we want it to have access to transfer to those queues and vice versa, but the other "Computers" queues should still only be able to transfer to other "Computers" queues only. The configuration would look like this:

```json
"internalTransferAddonsPlugin": {
  ...,
  "lobTransferQueueFilter": {
    "Shoes": [
      "Shoes",
      "Computers Apparel"
    ],
    "Computers": [
      "Computers"
      "!After Hours"
    ],
    "Computers Apparel": [
      "Computers",
      "Hats",
      "Shoes",
      "!After Hours"
    ],
    "Hats": [
      "Hats",
      "Computers Apparel"
    ],
    "Apparel Support": [
      "Shoes",
      "Hats"
    ]
  }
}
```

Keep in mind the object key is used in a `startsWith()` condition, so it will only match queues whose name begins with that key. The strings in the array value, however, can exist anywhere in the queue name.

This filter works in tandem with the TaskChannel name filter described below. If both filters are configured, queue names have to match both filter criteria to be visible in transfer directory.

#### Filtering by TaskChannel Name

The TaskChannel filter is controlled by the property `ui_attributes.internalTransferAddonsPlugin.channelTransferQueueFilter`. Each key in this object is the task channel unique name to match. The value of each key is an array of strings containing partial names of queues to show in the transfer directory. To exclude queues, start the string with `"!"`.

This feature is primarily applicable to contact centers that separate their queues by channel. 

For example, let's say our contact center supports two channels, voice and chat. Our voice queues don't have any special identifier in the name, but all of our chat queues have the word "Chat" in them to set them apart. We only want voice queues to show up in the directory when transferring a voice task, and only chat queues to show in the directory when transferring a chat task. Our configuration could look like this:

```json
"internalTransferAddonsPlugin": {
  ...,
  "channelTransferQueueFilter": {
    "voice": [
      "!Chat"
    ],
    "chat": [
      "Chat"
    ]
  }
}
```

The object keys of "voice" and "chat" match the unique name of those TaskChannels. For "voice", since there isn't anything unique in the queue names to identify them as voice queues, we're simply excluding all queues containing the word "Chat". For "chat", we're doing the opposite and only including queues containing the word "Chat".

This filter works in tandem with the line of business filter described above. If both filters are configured, queue names have to match both filter criteria to be visible in transfer directory.