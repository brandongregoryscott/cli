import { CollectionUtils, StringUtils } from "andculturecode-javascript-core";
import { Echo, OptionStringBuilder } from "and-cli";
import jsonfile from "jsonfile";
import shell from "shelljs";

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

/**
 * If set, the file will be modified in place instead of creating a new file with a timestamp.
 */
let _inplace: boolean | undefined;

/**
 * If set, the value of this key will be used to determine sorting order of the underlying object.
 */
let _key: string | undefined;

// #endregion Variables

// -----------------------------------------------------------------------------------------
// #region Public Functions
// -----------------------------------------------------------------------------------------

const JsonAlphabetize = {
    description() {
        return "Alphabetizes a json file by a certain key";
    },
    getOptions() {
        return new OptionStringBuilder("alphabetize [files]", "a");
    },
    getInplaceOptions() {
        return new OptionStringBuilder("in-place", "i");
    },
    getKeyOptions() {
        return new OptionStringBuilder("key <key>", "k");
    },
    inplaceDescription() {
        return "Modify the file in-place instead of creating a new file with a timestamp.";
    },
    keyDescription() {
        return "Specify a key whose value should be used for alphabetization";
    },
    run(files?: string[]) {
        if (CollectionUtils.isEmpty(files)) {
            Echo.error("No file(s) specified.");
            shell.exit(0);
        }
        const timestamp = new Date().toISOString();

        files?.forEach((inputFilename) => {
            let outputFilename = `${inputFilename.replace(
                ".json",
                ""
            )}.${timestamp}.json`;
            if (_inplace != null && _inplace) {
                Echo.message(`Modifying file ${inputFilename} in-place.`);
                outputFilename = inputFilename;
            }

            const parsedFile = jsonfile.readFileSync(inputFilename);
            const alphabetizedFile = Array.isArray(parsedFile)
                ? _sortArray(parsedFile)
                : _sortObjectByKeys(parsedFile);

            Echo.success(
                `Finished alphabetizing '${inputFilename}', writing file to '${outputFilename}' ...`
            );
            shell.touch(outputFilename);
            jsonfile.writeFileSync(outputFilename, alphabetizedFile, {
                spaces: 4,
            });
        });
    },
    setInplace(inplace?: boolean) {
        if (inplace == null) {
            return this;
        }

        _inplace = inplace;
        return this;
    },
    setKey(key?: string) {
        if (StringUtils.isEmpty(key)) {
            return this;
        }

        _key = key;
        return this;
    },
};

// #endregion Public Functions

// -----------------------------------------------------------------------------------------
// #region Private Functions
// -----------------------------------------------------------------------------------------

/**
 * Sorts an array of any type of objects/primitives. Returns an array in sorted order of priority,
 * recursively:
 *
 * 1. strings or numbers
 * 2. objects
 * 3. arrays
 *
 * @param array Array of any type to be sorted recursively.
 */
const _sortArray = (array: any[]): any[] => {
    if (!Array.isArray(array)) {
        return array;
    }

    let sortedArray: any[] = [];
    const sortedPrimitives = array
        .filter(
            (entry) => typeof entry === "string" || typeof entry === "number"
        )
        .sort();

    sortedArray = sortedArray.concat(sortedPrimitives);

    const sortableObjects = array.filter(
        (entry) => typeof entry === "object" && !Array.isArray(entry)
    );

    // Sort the underlying keys of each object
    let sortedObjects = sortableObjects.map((unorderedObj) =>
        _sortObjectByKeys(unorderedObj)
    );

    // If a key has been specified to sort the objects by, process it now.
    if (StringUtils.hasValue(_key)) {
        sortedObjects = sortedObjects.sort(_sortObjectsByKey);
    }

    sortedArray = sortedArray.concat(sortedObjects);

    // Recursively sort any arrays
    const sortedNestedArrays = array
        .filter((entry) => Array.isArray(entry))
        .map(_sortArray);
    sortedArray = sortedArray.concat(sortedNestedArrays);

    return sortedArray;
};

const _sortObjectsByKey = (objectA: any, objectB: any) =>
    objectA[_key!].localeCompare(objectB[_key!]);

const _sortObjectByKeys = (unsortedObject: any) => {
    if (typeof unsortedObject !== "object") {
        return unsortedObject;
    }

    if (Array.isArray(unsortedObject)) {
        return _sortArray(unsortedObject);
    }

    const sortedObject: any = {};
    Object.keys(unsortedObject)
        .sort()
        .forEach((key) => {
            let value = unsortedObject[key];
            if (Array.isArray(value)) {
                value = _sortArray(value);
            }

            // If the value of the key is another object, recursively sort its keys.
            if (typeof value === "object" && !Array.isArray(value)) {
                value = _sortObjectByKeys(value);
            }

            sortedObject[key] = value;
        });

    return sortedObject;
};
// #endregion Private Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { JsonAlphabetize };

// #endregion Exports
