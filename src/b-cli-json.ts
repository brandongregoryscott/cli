#!/usr/bin/env node

import { JsonAlphabetize } from "./modules/json-alphabetize";
import { JsonList } from "./modules/json-list";
import { program, CommandRunner } from "and-cli";

CommandRunner.run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .usage("option(s)")
        .description("Commands for listing, processing, etc. json files")
        .option(JsonAlphabetize.getOptions().toString(), JsonAlphabetize.description())
        .option(
            JsonAlphabetize.getInplaceOptions().toString(),
            JsonAlphabetize.inplaceDescription()
        )
        .option(
            JsonAlphabetize.getKeyOptions().toString(),
            JsonAlphabetize.keyDescription()
        )
        .option(JsonList.getOptions().toString(), JsonList.description())
        .parse(process.argv);

    if (program.alphabetize) {
        const files =
            typeof program.alphabetize === "string"
                ? program.alphabetize.split(" ")
                : undefined;
        JsonAlphabetize.setInplace(program.inPlace)
            .setKey(program.key)
            .run(files);
    }

    if (program.list) {
        const dir = typeof program.list === "string" ? program.list : undefined;
        JsonList.run(dir);
    }

    // If no options are passed in, just output help
    if (process.argv.slice(2).length === 0) {
        program.outputHelp();
    }

    // #endregion Entrypoint
});
