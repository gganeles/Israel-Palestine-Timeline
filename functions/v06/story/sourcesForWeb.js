// To parse this data:
//
//   const Convert = require("./file");
//
//   const sourcesForWeb = Convert.toSourcesForWeb(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
function toSourcesForWeb(json) {
    return cast(JSON.parse(json), r("SourcesForWeb"));
}

function sourcesForWebToJson(value) {
    return JSON.stringify(uncast(value, r("SourcesForWeb")), null, 2);
}

function invalidValue(typ, val, key, parent = '') {
    const prettyTyp = prettyTypeName(typ);
    const parentText = parent ? ` on ${parent}` : '';
    const keyText = key ? ` for key "${key}"` : '';
    throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`);
}

function prettyTypeName(typ) {
    if (Array.isArray(typ)) {
        if (typ.length === 2 && typ[0] === undefined) {
            return `an optional ${prettyTypeName(typ[1])}`;
        } else {
            return `one of [${typ.map(a => { return prettyTypeName(a); }).join(", ")}]`;
        }
    } else if (typeof typ === "object" && typ.literal !== undefined) {
        return typ.literal;
    } else {
        return typeof typ;
    }
}

function jsonToJSProps(typ) {
    if (typ.jsonToJS === undefined) {
        const map = {};
        typ.props.forEach((p) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ) {
    if (typ.jsToJSON === undefined) {
        const map = {};
        typ.props.forEach((p) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val, typ, getProps, key = '', parent = '') {
    function transformPrimitive(typ, val) {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key, parent);
    }

    function transformUnion(typs, val) {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val, key, parent);
    }

    function transformEnum(cases, val) {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases.map(a => { return l(a); }), val, key, parent);
    }

    function transformArray(typ, val) {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val) {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue(l("Date"), val, key, parent);
        }
        return d;
    }

    function transformObject(props, additional, val) {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue(l(ref || "object"), val, key, parent);
        }
        const result = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, key, ref);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key, ref);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val, key, parent);
    }
    if (typ === false) return invalidValue(typ, val, key, parent);
    let ref = undefined;
    while (typeof typ === "object" && typ.ref !== undefined) {
        ref = typ.ref;
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val, key, parent);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast(val, typ) {
    return transform(val, typ, jsonToJSProps);
}

function uncast(val, typ) {
    return transform(val, typ, jsToJSONProps);
}

function l(typ) {
    return { literal: typ };
}

function a(typ) {
    return { arrayItems: typ };
}

function u(...typs) {
    return { unionMembers: typs };
}

function o(props, additional) {
    return { props, additional };
}

function m(additional) {
    return { props: [], additional };
}

function r(name) {
    return { ref: name };
}

const typeMap = {
    "SourcesForWeb": o([
        { json: "sources", js: "sources", typ: a(r("Source")) },
    ], false),
    "Source": o([
        { json: "articleId", js: "articleId", typ: null },
        { json: "createdAt", js: "createdAt", typ: Date },
        { json: "date", js: "date", typ: Date },
        { json: "description", js: "description", typ: "" },
        { json: "originalDescription", js: "originalDescription", typ: u(null, "") },
        { json: "lang", js: "lang", typ: r("Lang") },
        { json: "paywall", js: "paywall", typ: r("Paywall") },
        { json: "refId", js: "refId", typ: "" },
        { json: "sortData", js: "sortData", typ: r("SortData") },
        { json: "title", js: "title", typ: "" },
        { json: "originalTitle", js: "originalTitle", typ: u(null, "") },
        { json: "url", js: "url", typ: "" },
        { json: "sourceInfo", js: "sourceInfo", typ: r("SourceInfo") },
    ], false),
    "SortData": o([
        { json: "locality", js: "locality", typ: r("Locality") },
        { json: "bias", js: "bias", typ: r("BiasClass") },
        { json: "date", js: "date", typ: r("BiasClass") },
    ], false),
    "BiasClass": o([
        { json: "index", js: "index", typ: 0 },
        { json: "labelData", js: "labelData", typ: u(Date, r("BiasEnum"), null) },
    ], false),
    "Locality": o([
        { json: "index", js: "index", typ: 0 },
        { json: "labelData", js: "labelData", typ: r("LabelDataEnum") },
        { json: "flag", js: "flag", typ: u(null, "") },
    ], false),
    "SourceInfo": o([
        { json: "bias", js: "bias", typ: r("BiasEnum") },
        { json: "biasRatings", js: "biasRatings", typ: a(r("BiasRating")) },
        { json: "icon", js: "icon", typ: "" },
        { json: "id", js: "id", typ: "" },
        { json: "interestId", js: "interestId", typ: "" },
        { json: "location", js: "location", typ: u(r("Location"), null) },
        { json: "name", js: "name", typ: "" },
        { json: "paywall", js: "paywall", typ: r("Paywall") },
        { json: "place", js: "place", typ: a(r("Place")) },
        { json: "placeId", js: "placeId", typ: u(null, "") },
        { json: "storyCount", js: "storyCount", typ: 0 },
        { json: "slug", js: "slug", typ: "" },
        { json: "factuality", js: "factuality", typ: r("Factuality") },
        { json: "owners", js: "owners", typ: a(r("Owner")) },
        { json: "originalBias", js: "originalBias", typ: r("BiasEnum") },
    ], false),
    "BiasRating": o([
        { json: "reviewerId", js: "reviewerId", typ: "" },
        { json: "politicalBias", js: "politicalBias", typ: r("PoliticalBias") },
        { json: "referenceUrl", js: "referenceUrl", typ: "" },
        { json: "sourceInfoId", js: "sourceInfoId", typ: "" },
        { json: "reviewer", js: "reviewer", typ: r("Reviewer") },
    ], false),
    "Reviewer": o([
        { json: "id", js: "id", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "icon", js: "icon", typ: "" },
    ], false),
    "Location": o([
        { json: "lat", js: "lat", typ: 3.14 },
        { json: "lon", js: "lon", typ: 3.14 },
    ], false),
    "Owner": o([
        { json: "id", js: "id", typ: 0 },
        { json: "category", js: "category", typ: "" },
        { json: "name", js: "name", typ: "" },
    ], false),
    "Place": o([
        { json: "id", js: "id", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "type", js: "type", typ: "" },
    ], false),
    "Lang": [
        "en",
        "he",
        "ar",
    ],
    "Paywall": [
        "no",
        "sometimes",
        "yes",
    ],
    "BiasEnum": [
        "center",
        "leanLeft",
        "leanRight",
        "left",
        "right",
        "unknown",
    ],
    "LabelDataEnum": [
        "international",
        "other",
    ],
    "PoliticalBias": [
        "center",
        "leanLeft",
        "leanRight",
        "left",
        "right",
        "unknown",
    ],
    "Factuality": [
        "high",
        "mixed",
        "unknown",
    ],
};

module.exports = {
    "sourcesForWebToJson": sourcesForWebToJson,
    "toSourcesForWeb": toSourcesForWeb,
};
