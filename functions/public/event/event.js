// To parse this data:
//
//   const Convert = require("./file");
//
//   const event = Convert.toEvent(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
function toEvent(json) {
    return cast(JSON.parse(json), r("Event"));
}

function eventToJson(value) {
    return JSON.stringify(uncast(value, r("Event")), null, 2);
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
    "Event": o([
        { json: "event", js: "event", typ: r("EventClass") },
    ], false),
    "EventClass": o([
        { json: "id", js: "id", typ: "" },
        { json: "title", js: "title", typ: "" },
        { json: "description", js: "description", typ: "" },
        { json: "topNewsEditions", js: "topNewsEditions", typ: a("") },
        { json: "topNewsEligibleEditions", js: "topNewsEligibleEditions", typ: a("") },
        { json: "start", js: "start", typ: Date },
        { json: "topFeedEditionTime", js: "topFeedEditionTime", typ: Date },
        { json: "blindspot", js: "blindspot", typ: null },
        { json: "tempExpBlindspot", js: "tempExpBlindspot", typ: null },
        { json: "biasSourceCount", js: "biasSourceCount", typ: 0 },
        { json: "leftSrcPercent", js: "leftSrcPercent", typ: 3.14 },
        { json: "rightSrcPercent", js: "rightSrcPercent", typ: 3.14 },
        { json: "leftSrcCount", js: "leftSrcCount", typ: 0 },
        { json: "rightSrcCount", js: "rightSrcCount", typ: 0 },
        { json: "cntrSrcCount", js: "cntrSrcCount", typ: 0 },
        { json: "onlyLowFactSources", js: "onlyLowFactSources", typ: true },
        { json: "onlyPaywallSources", js: "onlyPaywallSources", typ: true },
        { json: "neutralistBias", js: "neutralistBias", typ: r("NeutralistBias") },
        { json: "highestFactuality", js: "highestFactuality", typ: r("HighestFactualityEnum") },
        { json: "highFactCount", js: "highFactCount", typ: 0 },
        { json: "mixedFactCount", js: "mixedFactCount", typ: 0 },
        { json: "lowFactCount", js: "lowFactCount", typ: 0 },
        { json: "highFactPercent", js: "highFactPercent", typ: 3.14 },
        { json: "mixedFactPercent", js: "mixedFactPercent", typ: 3.14 },
        { json: "lowFactPercent", js: "lowFactPercent", typ: 0 },
        { json: "embeddedSrcCount", js: "embeddedSrcCount", typ: 0 },
        { json: "slug", js: "slug", typ: "" },
        { json: "sourceDocument", js: "sourceDocument", typ: null },
        { json: "place", js: "place", typ: a(r("Place")) },
        { json: "showCoverageBias", js: "showCoverageBias", typ: true },
        { json: "tempExpShowCoverageBias", js: "tempExpShowCoverageBias", typ: true },
        { json: "isAdminSummary", js: "isAdminSummary", typ: true },
        { json: "carouselType", js: "carouselType", typ: null },
        { json: "location", js: "location", typ: r("Location") },
        { json: "sources", js: "sources", typ: a(r("Source")) },
        { json: "interests", js: "interests", typ: a(r("Interest")) },
        { json: "postCount", js: "postCount", typ: 0 },
        { json: "proInteractionLimit", js: "proInteractionLimit", typ: 0 },
        { json: "shareUrl", js: "shareUrl", typ: "" },
        { json: "size", js: "size", typ: 0 },
        { json: "latestMedia", js: "latestMedia", typ: r("Media") },
        { json: "fallbackMedia", js: "fallbackMedia", typ: r("Media") },
        { json: "feedCarousel", js: "feedCarousel", typ: r("FeedCarousel") },
        { json: "newsRoomCoverageAnalysis", js: "newsRoomCoverageAnalysis", typ: true },
        { json: "showFeedSourceCarousel", js: "showFeedSourceCarousel", typ: true },
        { json: "blindspotData", js: "blindspotData", typ: r("BlindspotData") },
        { json: "defaultSourceSort", js: "defaultSourceSort", typ: "" },
        { json: "pulse", js: "pulse", typ: true },
        { json: "lastModified", js: "lastModified", typ: Date },
        { json: "summarySourceId", js: "summarySourceId", typ: "" },
        { json: "summarySourceName", js: "summarySourceName", typ: "" },
        { json: "firstSource", js: "firstSource", typ: r("FirstSource") },
        { json: "factuality", js: "factuality", typ: r("FactualityClass") },
        { json: "ownership", js: "ownership", typ: r("Ownership") },
        { json: "firstTenSources", js: "firstTenSources", typ: a(r("FirstTenSource")) },
        { json: "directlyEdited", js: "directlyEdited", typ: true },
        { json: "topNews", js: "topNews", typ: true },
        { json: "onlyExtremeSources", js: "onlyExtremeSources", typ: true },
        { json: "overallBias", js: "overallBias", typ: 0 },
        { json: "myFeedEligible", js: "myFeedEligible", typ: true },
        { json: "inSpecialFeeds", js: "inSpecialFeeds", typ: a(r("SpecialFeed")) },
        { json: "outSpecialFeeds", js: "outSpecialFeeds", typ: a(r("SpecialFeed")) },
        { json: "distributionVersion", js: "distributionVersion", typ: 0 },
        { json: "type", js: "type", typ: "" },
        { json: "chatGptSummaries", js: "chatGptSummaries", typ: r("ChatGPTSummaries") },
        { json: "relatedStoryIds", js: "relatedStoryIds", typ: a("any") },
    ], false),
    "BlindspotData": o([
        { json: "coverageProfileStatement", js: "coverageProfileStatement", typ: "" },
        { json: "coverageProfileType", js: "coverageProfileType", typ: "" },
        { json: "leftPercent", js: "leftPercent", typ: 0 },
        { json: "rightPercent", js: "rightPercent", typ: 0 },
        { json: "centerPercent", js: "centerPercent", typ: 0 },
    ], false),
    "ChatGPTSummaries": o([
        { json: "center", js: "center", typ: "" },
        { json: "left", js: "left", typ: "" },
        { json: "right", js: "right", typ: "" },
        { json: "analysis", js: "analysis", typ: "" },
    ], false),
    "FactualityClass": o([
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
        { json: "micro", js: "micro", typ: "" },
        { json: "thumb", js: "thumb", typ: "" },
    ], false),
    "FeedCarousel": o([
        { json: "type", js: "type", typ: "" },
        { json: "buckets", js: "buckets", typ: a(r("Bucket")) },
    ], false),
    "Bucket": o([
        { json: "id", js: "id", typ: r("NeutralistBias") },
        { json: "label", js: "label", typ: "" },
        { json: "sourceCount", js: "sourceCount", typ: 0 },
        { json: "percent", js: "percent", typ: 0 },
        { json: "sampleSourceIcons", js: "sampleSourceIcons", typ: a("") },
        { json: "sourceRef", js: "sourceRef", typ: r("SourceRef") },
    ], false),
    "SourceRef": o([
        { json: "sourceId", js: "sourceId", typ: "" },
        { json: "refId", js: "refId", typ: "" },
        { json: "title", js: "title", typ: "" },
        { json: "description", js: "description", typ: "" },
        { json: "date", js: "date", typ: Date },
        { json: "interestId", js: "interestId", typ: "" },
        { json: "sourceName", js: "sourceName", typ: "" },
        { json: "sourceIcon", js: "sourceIcon", typ: "" },
        { json: "placeLabel", js: "placeLabel", typ: "" },
        { json: "sourceCountry", js: "sourceCountry", typ: r("SourceCountry") },
        { json: "placeTier", js: "placeTier", typ: "" },
        { json: "bias", js: "bias", typ: r("NeutralistBias") },
    ], false),
    "SourceCountry": o([
        { json: "code", js: "code", typ: "" },
        { json: "flag", js: "flag", typ: "" },
    ], false),
    "FirstSource": o([
        { json: "title", js: "title", typ: "" },
        { json: "originalTitle", js: "originalTitle", typ: null },
        { json: "createdAt", js: "createdAt", typ: Date },
        { json: "sourceInfo", js: "sourceInfo", typ: r("FirstSourceSourceInfo") },
    ], false),
    "FirstSourceSourceInfo": o([
        { json: "id", js: "id", typ: "" },
        { json: "icon", js: "icon", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "place", js: "place", typ: u(undefined, a(r("Place"))) },
        { json: "bias", js: "bias", typ: r("NeutralistBias") },
        { json: "originalBias", js: "originalBias", typ: u(undefined, r("NeutralistBias")) },
    ], false),
    "Place": o([
        { json: "id", js: "id", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "type", js: "type", typ: "" },
    ], false),
    "FirstTenSource": o([
        { json: "articleId", js: "articleId", typ: null },
        { json: "createdAt", js: "createdAt", typ: Date },
        { json: "date", js: "date", typ: Date },
        { json: "description", js: "description", typ: "" },
        { json: "originalDescription", js: "originalDescription", typ: u(null, "") },
        { json: "refId", js: "refId", typ: "" },
        { json: "sortData", js: "sortData", typ: r("SortData") },
        { json: "title", js: "title", typ: "" },
        { json: "originalTitle", js: "originalTitle", typ: u(null, "") },
        { json: "url", js: "url", typ: "" },
        { json: "sourceInfo", js: "sourceInfo", typ: r("FirstTenSourceSourceInfo") },
    ], false),
    "SortData": o([
        { json: "locality", js: "locality", typ: r("Locality") },
        { json: "bias", js: "bias", typ: r("Bias") },
        { json: "date", js: "date", typ: r("Bias") },
    ], false),
    "Bias": o([
        { json: "index", js: "index", typ: 0 },
        { json: "labelData", js: "labelData", typ: u(Date, r("NeutralistBias"), null) },
    ], false),
    "Locality": o([
        { json: "index", js: "index", typ: 0 },
        { json: "labelData", js: "labelData", typ: r("LabelDataEnum") },
        { json: "flag", js: "flag", typ: u(null, "") },
    ], false),
    "FirstTenSourceSourceInfo": o([
        { json: "bias", js: "bias", typ: r("NeutralistBias") },
        { json: "biasRatings", js: "biasRatings", typ: a(r("BiasRating")) },
        { json: "icon", js: "icon", typ: "" },
        { json: "id", js: "id", typ: "" },
        { json: "interestId", js: "interestId", typ: "" },
        { json: "location", js: "location", typ: u(r("Location"), null) },
        { json: "name", js: "name", typ: "" },
        { json: "place", js: "place", typ: a(r("Place")) },
        { json: "placeId", js: "placeId", typ: u(null, "") },
        { json: "slug", js: "slug", typ: "" },
        { json: "factuality", js: "factuality", typ: r("HighestFactualityEnum") },
        { json: "owners", js: "owners", typ: a(r("Owner")) },
        { json: "originalBias", js: "originalBias", typ: r("NeutralistBias") },
    ], false),
    "BiasRating": o([
        { json: "reviewerId", js: "reviewerId", typ: "" },
        { json: "politicalBias", js: "politicalBias", typ: r("NeutralistBias") },
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
        { json: "category", js: "category", typ: u(undefined, "") },
        { json: "name", js: "name", typ: "" },
    ], false),
    "SpecialFeed": o([
    ], false),
    "Interest": o([
        { json: "id", js: "id", typ: "" },
        { json: "type", js: "type", typ: r("InterestType") },
        { json: "name", js: "name", typ: "" },
        { json: "slug", js: "slug", typ: "" },
        { json: "icon", js: "icon", typ: "" },
        { json: "greyListed", js: "greyListed", typ: true },
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
    "Source": o([
        { json: "articleId", js: "articleId", typ: null },
        { json: "date", js: "date", typ: Date },
        { json: "sourceInfo", js: "sourceInfo", typ: r("FirstSourceSourceInfo") },
    ], false),
    "NeutralistBias": [
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
    "HighestFactualityEnum": [
        "high",
        "mixed",
        "unknown",
    ],
    "InterestType": [
        "place",
        "person",
        "topic",
    ],
};

module.exports = {
    "eventToJson": eventToJson,
    "toEvent": toEvent,
};
