import { Constants, Echo, OptionStringBuilder } from "and-cli";
import { StringUtils } from "andculturecode-javascript-core";
import shell from "shelljs";

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const JsonList = {
    description() {
        return `Lists json files in the specified directory (defaults to pwd - ${shell.pwd()})`;
    },
    getOptions() {
        return new OptionStringBuilder("list [dir]", "l");
    },
    run(dir?: string) {
        if (StringUtils.isEmpty(dir)) {
            dir = shell.pwd();
        }

        Echo.message(`Listing json files in ${dir}`);

        const jsonFiles = shell
            .ls("-R", [dir!])
            .filter((file) => !file.includes(Constants.NODE_MODULES))
            .filter((file) => file.endsWith(".json"));

        jsonFiles.forEach((jsonFile) => console.log(jsonFile));
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { JsonList };

// #endregion Exports
