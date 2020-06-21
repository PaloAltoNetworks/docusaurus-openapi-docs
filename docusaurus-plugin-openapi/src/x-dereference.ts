import _ from "lodash";
import traverse from "traverse";
import DAG from "dag-map";
import md5 from "md5";

// only supports local.
function getRefType() {
  return "local";
}

function getRefValue(ref) {
  const thing = ref ? (ref.value ? ref.value : ref) : null;
  if (thing && thing.$ref && typeof thing.$ref === "string") {
    return thing.$ref;
  }
}

function getRefPathValue(schema, refPath) {
  let rpath = refPath;
  const hashIndex = refPath.indexOf("#");
  if (hashIndex >= 0) {
    rpath = refPath.substring(hashIndex);
    if (rpath.length > 1) {
      rpath = refPath.substring(1);
    } else {
      rpath = "";
    }
  }

  // Walk through each /-separated path component, and get
  // the value for that key (ignoring empty keys)
  const keys = rpath.split("/").filter((k) => !!k);
  const ret = keys.reduce(function (value, key) {
    return value[key];
  }, schema);

  if (refPath.startsWith("#/components/schemas/")) {
    if (ret.xml === undefined) {
      ret.xml = {};
    }
    if (ret.xml.name === undefined) {
      const xmlName = refPath.replace("#/components/schemas/", "");
      ret.xml.name = xmlName;
    }
  }
  return ret;
}

function getRefSchema(refVal, refType, parent, options, state) {
  if (refType === "local") {
    return getRefPathValue(parent, refVal);
  }
}

function addToHistory(state, type, value) {
  let dest;

  if (value === "#") {
    return false;
  }
  dest = state.current.concat(`:${value}`);

  if (dest) {
    dest = dest.toLowerCase();
    if (state.history.indexOf(dest) >= 0) {
      return false;
    }

    state.history.push(dest);
  }
  return true;
}

function setCurrent(state, type, value) {
  let dest;

  if (dest) {
    state.current = dest;
  }
}

function derefSchema(schema, options, state) {
  if (state.circular) {
    return new Error(
      `circular references found: ${state.circularRefs.toString()}`
    );
  } else if (state.error) {
    return state.error;
  }

  return traverse(schema).forEach(function (node) {
    if (node !== undefined && typeof node.$ref === "string") {
      const refType = getRefType(node);
      const refVal = getRefValue(node);

      const addOk = addToHistory(state, refType, refVal);
      if (!addOk) {
        state.circular = true;
        state.circularRefs.push(refVal);
        state.error = new Error(
          `circular references found: ${state.circularRefs.toString()}`
        );
        this.update(node, true);
      } else {
        setCurrent(state, refType, refVal);
        let newValue = getRefSchema(refVal, refType, schema, options, state);
        state.history.pop();
        if (newValue === undefined) {
          if (state.missing.indexOf(refVal) === -1) {
            state.missing.push(refVal);
          }
          if (options.failOnMissing) {
            state.error = new Error(`Missing $ref: ${refVal}`);
          }
          this.update(node, options.failOnMissing);
        } else {
          if (options.removeIds && newValue.hasOwnProperty("$id")) {
            delete newValue.$id;
          }
          if (options.mergeAdditionalProperties) {
            delete node.$ref;
            newValue = _.merge({}, newValue, node);
          }
          this.update(newValue);
          if (state.missing.indexOf(refVal) !== -1) {
            state.missing.splice(state.missing.indexOf(refVal), 1);
          }
        }
      }
    }
  });
}

export function dereference(schema) {
  const options = {};

  const state = {
    graph: new DAG(),
    circular: false,
    circularRefs: [],
    missing: [],
    history: [],
  };

  try {
    const str = JSON.stringify(schema);
    state.current = md5(str);
  } catch (e) {
    return e;
  }

  const newschema = _.cloneDeep(schema);

  let ret = derefSchema(newschema, options, state);
  if (ret instanceof Error === false && state.error) {
    return state.error;
  }
  return ret;
}
