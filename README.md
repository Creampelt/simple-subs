SimpleSubs
==========

Some Types
----------

### Order

Object representing a sandwich order

`key` (`String`): unique order ID (date in "YYYY-MM-DD" form)

`title` (`String`): title for any named/saved sandwiches

`date` (`Object`): date of sandwich order; Moment.js date

`...orderOptions` (`Object`): all order options (ex: `bread`, `meat`, `cheese`, etc.)

### User

Object containing data for a user

`uid` (`String`): unique user ID (from Firebase auth)

`...userFields` (`Object`): all user fields and corresponding values (ex: `EMAIL`, `NAME`, `PIN`, etc.)

### OrderOption

Object representing a category on the order page

`key` (`String`): unique key for order option (ex: `"bread"` for bread category)

`title` (`String`): category display name

`type` (`String`): type of user input; can be one of `"PICKER"` (limits to one selection), `"CHECKBOX"` (no selection
limit), or `"TEXT_INPUT"` (no data control/validation)
* If `type` = `PICKER`: `defaultValue` (`String`): string representing the option's value when user opens Order screen;
may be placeholder value like `"Please select"` or value within `options` (see below)
* If `type` = `CHECKBOX`: `defaultValue` (`Array` of `String`s): default selected values when user opens Order screen;
empty array means no selected values
* If `type` = `TEXT_INPUT`:
    * `defaultValue` (`String`): string representing default value entered in input
    * `placeholder` (`String`): placeholder in text box when value is empty

`required` (`bool`): whether user selection is required

`dynamic` (`bool`): whether the options are dynamic or constant
* If `dynamic` = `true`: `options` (`func` &#8594; `Array` of `String`s): function that takes state input and returns
array containing selection options for category
* If `dynamic` = `false`: `options` (`Array` of `String`s): array containing selection options for category

### InputPreset

`...textInputProps` (`Object`): various props for `TextInput` (ex: `autoCompleteType`, `keyboardType`, etc.)

`fixValue` (`func` &#8594; `String`): function to "fix" a user input value before passing it to state (such as removing
whitespace); takes `String` input `value` (`TextInput` text)

`validate` (`func` &#8594; `String`): function to validate input; takes `String` input `value` (`TextInput` text) and
returns error message if invalid, `NO_ERROR` string if valid

### UserField

`key` (`String`): unique key for user field (ex: `"email"` for email field)

`title` (`String`): display NAME for user field (in Settings page)

`placeholder` (`String`): value to display when field is empty

`mutable` (`bool`): whether value may be altered after account is created

`editAction` (`func`): a special action to execute instead of editing field (ex: open change password modal); renders
edit icon next to field

`inputType` (`String`): type of user input; can be one of `"PICKER"` or `"TEXT_INPUT"`

#### If `inputType` = `"TEXT_INPUT"`:

`textType` (`String`): some pre-set options for `TextInput` text; can be one of `"EMAIL"`, `"PASSWORD"`, `"PIN"`,
`"NAME"`, or `"PLAIN"`

#### If `inputType` = `"PICKER"`:

`options` (`Array` of `String`s): array containing selection options for field

### OrderPreset

`key` (`String`): unique preset ID; is the same as `title` (needed a `key` field for RN)

`title` (`String`): title of the sandwich

`...orderOptions` (`Object`): all order options (ex: `bread`, `meat`, `cheese`, etc.)

Actions
-------

### Pure Actions (return an object)

| Key                | Description                                                       |
|:------------------:|:------------------------------------------------------------------|
| `UPDATE_ORDERS`    | Replaces `orders` in state                                        |
| `UPDATE_USER_DATA` | Replaces `userData` in state                                      |
| `UPDATE_CONSTANTS` | Replaces `stateConstants` in state                                |
| `FOCUS_ORDER`      | Focuses an order (to be edited or deleted)                        |
| `SET_MODAL_PROPS`  | Sets props for top level `Modal` (can be used to open and close)  |
| `SET_INFO_MESSAGE` | Sets text for top level `InfoMessage` (for error reporting, etc.) |

### Firebase Actions

| Name             | Description                                                      |
|:----------------:|:-----------------------------------------------------------------|
| `createOrder`    | Creates an order and adds it to Firestore                        |
| `editOrder`      | Edits an existing order in Firestore                             |
| `deleteOrder`    | Deletes an existing order from Firestore                         |
| `logIn`          | Logs user in using Firebase Auth                                 |
| `logOut`         | Logs user out using Firebase Auth                                |
| `editUserData`   | Sets profile information for current user in Firestore           |
| `resetPassword`  | Sends password reset email to provided email using Firebase Auth |
| `changePassword` | Re-authenticates user and changes password using Firebase Auth   |

State
-----

Object containing app state

`orders` (`Object` of `Order`s): object containing all of user's orders scheduled for the future (`id`s as keys)

`focusedOrder` (`String`): a unique order ID representing the currently focused order (`null` if no order is focused)

`focusedPreset` (`String`): a unique preset ID representing the currently focused preset (`null` if no preset is
focused)

`user` (`User`): a `User` object representing the user currently logged in (`null` if no user is logged in)

`orderPresets` (`Array` of `OrderPreset`s): an array containing presets defined by user

`infoMessage` (`String`): info message to display in `InfoModal` (an empty `String` will hide the modal)

`loading` (`bool`): if app is loading or not

`modal` (`Object`): props for modal to render (`null` if no modal is open)
* `type` (`String`): animation type of modal; can be one of `"CENTER_SPRING_MODAL"` or `"SLIDE_UP_MODAL"`
* `style` (`Object`): style object for modal view
* `children` (`React Object`): content to be displayed within modal

`stateConstants` (`Object`): object containing constant data pulled from Firebase; **none of these constants are
editable within the app**
* `orderOptions` (`Array` of `OrderOption`s): array containing order options for the Order screen
* `userFields` (`Array` of `UserField`s): array containing user fields for the Settings and Register screens
* `cutoffTime` (`moment`): `moment` object representing cutoff time for orders