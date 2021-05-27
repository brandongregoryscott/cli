#!/usr/bin/env node

import { CommandRegistry, PackageConfig, program } from "and-cli";

// -----------------------------------------------------------------------------------------
// #region Entrypoint
// -----------------------------------------------------------------------------------------

const { description } = PackageConfig.getLocal();
program.description(description);

// Register all of the base commands from the and-cli with this application
CommandRegistry.registerAllBase()
    .register({
        command: "json",
        description: "Commands to manipulate json files",
    })
    .registerAliasesFromConfig()
    .parseWithAliases();

// #endregion Entrypoint
