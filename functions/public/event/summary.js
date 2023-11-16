// To parse this data:
//
//   const Convert = require("./file");
//
//   const summary = Convert.toSummary(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
function toSummary(json) {
    return cast(JSON.parse(json), r("Summary"));
}

function summaryToJson(value) {
    return JSON.stringify(uncast(value, r("Summary")), null, 2);
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
    "Summary": o([
        { json: "summary", js: "summary", typ: r("SummaryClass") },
    ], false),
    "SummaryClass": o([
        { json: "biasSourceCount", js: "biasSourceCount", typ: 0 },
        { json: "blindspotData", js: "blindspotData", typ: r("BlindspotData") },
        { json: "description", js: "description", typ: "" },
        { json: "fallbackMedia", js: "fallbackMedia", typ: r("Media") },
        { json: "id", js: "id", typ: "" },
        { json: "interests", js: "interests", typ: a(r("Interest")) },
        { json: "latestMedia", js: "latestMedia", typ: r("Media") },
        { json: "start", js: "start", typ: Date },
        { json: "title", js: "title", typ: "" },
        { json: "slug", js: "slug", typ: "" },
        { json: "factuality", js: "factuality", typ: r("Factuality") },
        { json: "ownership", js: "ownership", typ: r("Ownership") },
        { json: "summary", js: "summary", typ: "" },
        { json: "place", js: "place", typ: r("Place") },
        { json: "sources", js: "sources", typ: a(r("Source")) },
        { json: "sourceCount", js: "sourceCount", typ: 0 },
    ], false),
    "BlindspotData": o([
        { json: "coverageProfileStatement", js: "coverageProfileStatement", typ: "" },
        { json: "coverageProfileType", js: "coverageProfileType", typ: "" },
        { json: "leftPercent", js: "leftPercent", typ: 0 },
        { json: "rightPercent", js: "rightPercent", typ: 0 },
        { json: "centerPercent", js: "centerPercent", typ: 0 },
    ], false),
    "Factuality": o([
        { json: "low", js: "low", typ: 0 },
        { json: "mixed", js: "mixed", typ: 0 },
        { json: "high", js: "high", typ: 0 },
        { json: "unknown", js: "unknown", typ: 0 },
    ], false),
    "Media": o([
        { json: "url", js: "url", typ: "" },
        { json: "youtubeEmbed", js: "youtubeEmbed", typ: null },
        { json: "isVideo", js: "isVideo", typ: true },
        { json: "isCover", js: "isCover", typ: true },
        { json: "nsfw", js: "nsfw", typ: true },
        { json: "width", js: "width", typ: 0 },
        { json: "height", js: "height", typ: 0 },
        { json: "sourceId", js: "sourceId", typ: null },
        { json: "licencedFrom", js: "licencedFrom", typ: "" },
        { json: "refId", js: "refId", typ: null },
        { json: "sourceLevelOnly", js: "sourceLevelOnly", typ: true },
        { json: "attributionName", js: "attributionName", typ: "" },
        { json: "attributionIcon", js: "attributionIcon", typ: "" },
        { json: "attributionUrl", js: "attributionUrl", typ: "" },
        { json: "caption", js: "caption", typ: "" },
        { json: "title", js: "title", typ: "" },
        { json: "anyVideo", js: "anyVideo", typ: true },
    ], false),
    "Interest": o([
        { json: "id", js: "id", typ: "" },
        { json: "type", js: "type", typ: u(undefined, r("Type")) },
        { json: "name", js: "name", typ: "" },
        { json: "slug", js: "slug", typ: "" },
        { json: "icon", js: "icon", typ: "" },
        { json: "bias", js: "bias", typ: u(undefined, "") },
    ], false),
    "Ownership": o([
        { json: "telecom", js: "telecom", typ: 0 },
        { json: "privateEquity", js: "privateEquity", typ: 0 },
        { json: "mediaConglomerate", js: "mediaConglomerate", typ: 0 },
        { json: "billionaire", js: "billionaire", typ: 0 },
        { json: "government", js: "government", typ: 0 },
        { json: "independent", js: "independent", typ: 0 },
        { json: "other", js: "other", typ: 0 },
        { json: "uncategorized", js: "uncategorized", typ: 0 },
        { json: "corporation", js: "corporation", typ: 0 },
    ], false),
    "Place": o([
        { json: "id", js: "id", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "type", js: "type", typ: "" },
    ], false),
    "Source": o([
        { json: "articleId", js: "articleId", typ: null },
        { json: "date", js: "date", typ: Date },
        { json: "sourceInfo", js: "sourceInfo", typ: r("Interest") },
    ], false),
    "Type": [
        "place",
        "person",
        "topic",
    ],
};

module.exports = {
    "summaryToJson": summaryToJson,
    "toSummary": toSummary,
};
