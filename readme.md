# cli-editor

This is a simple editor that can be used to edit javascript objects with the current
editor in the terminal. The editor is fetched with `EDITOR` environment variable.

## Installation

```shell
npm install @relekang/cli-editor
```
or
```shell
yarn add @relekang/cli-editor
```

## Usage

```
import {edit} from "@relekang/cli-editor"

edit({
    fetch: async function() { return getItem() },
    save: async function(item) { return saveItem(item) },
})
.catch(error => console.error("ooops", error))
```