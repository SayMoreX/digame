import { expect } from "vitest";

//const XPATH = require("xpath");
import XPATH from "xpath";
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
import { N } from "vitest/dist/reporters-5f784f42.js";

let resultXml: string;
let resultDom: Document;

export function setResultXml(xml: string) {
  resultXml = xml;
  resultDom = new DOMParser().parseFromString(resultXml);
}

export function assertAttribute(
  xpath: string,
  attribute: string,
  expected: string
) {
  const hits = select(xpath);
  if (!hits || hits.length === 0) {
    //console.log(resultXml);
    return {
      message: () => `expected ${xpath} to exist `,
      pass: false
    };
  }
  const xpathWithAttr = xpath + `[@${attribute}="${expected}"]`;
  const pass = select(xpathWithAttr).length > 0;
  if (pass) {
    return {
      message: () =>
        `expected ${xpathWithAttr} ${attribute} to be ${expected}. `,
      pass: true
    };
  } else {
    return {
      message: () =>
        `expected ${xpathWithAttr} ${attribute} to be ${expected}. `,
      pass: false
    };
  }
}

export function count(xpath: string): number {
  return select(xpath).length;
}
export function value(xpath: string): string {
  return (select(xpath)[0] as Node).textContent || "";
}
export function select(xpath: string): Node[] {
  if (resultDom === undefined) {
    throw new Error(
      "resultDom was undefined in select(). Make sure you called setResultXml()"
    );
  }
  try {
    const nodes = XPATH.select(
      xpath,
      resultDom
      //, resolver
    );
    return nodes as Node[];
  } catch (ex) {
    console.log("error in xpath: " + xpath);
    console.log(ex);
    throw new Error(`error in xpath: ${xpath} ${ex}`);
  }
}

// I haven't figured out to extend
// to novel names properly.
export const xexpect = expect as any;

// This overrides an existing expect function in order to have a convenient
// check using an xpath and an expected value.
expect.extend({
  toMatch(xpath: string, expectedValue: string | RegExp) {
    const hits = select(xpath);
    if (!hits || hits.length === 0) {
      //console.log(resultXml);
      return {
        message: () =>
          `expected ${xpath} to be '${expectedValue}' but that xpath did not match anything`,
        pass: false
      };
    }
    let pass;
    if (expectedValue instanceof RegExp)
      pass = value(xpath).match(expectedValue);
    else pass = value(xpath) === expectedValue;
    if (pass) {
      return {
        message: () => `expected ${xpath} to be '${expectedValue}'`,
        pass: true
      };
    } else {
      //console.log(resultXml);
      return {
        message: () =>
          `expected ${xpath} to be '${expectedValue}'  but it was '${value(
            xpath
          )}'`,
        pass: false
      };
    }
  }
});
expect.extend({
  toHaveSomeMatch(xpath: string, expectedValue: string | RegExp) {
    const hits = select(xpath);
    if (!hits || hits.length === 0) {
      //console.log(resultXml);
      return {
        message: () =>
          `expected ${xpath} to have some match for '${expectedValue}' but that xpath did not match anything`,
        pass: false
      };
    }
    // the result of the xpath is an array of nodes. We want to see if any of them match.
    const pass = hits.some((node) => {
      if (expectedValue instanceof RegExp)
        return node.textContent?.match(expectedValue);
      else return node.textContent === expectedValue;
    });
    if (pass) {
      return {
        message: () => `expected ${xpath} to be '${expectedValue}'`,
        pass: true
      };
    } else {
      //console.log(resultXml);
      return {
        message: () =>
          `Did not find any ${xpath} that matched '${expectedValue}'. Found: [` +
          // list all the hits that we found
          hits.map((node) => node.textContent).join(",") +
          "]",
        pass: false
      };
    }
  }
});

expect.extend({
  toHaveCount(xpath, expectedValue) {
    const matchCount = select(xpath).length;
    if (matchCount !== expectedValue) {
      //      console.log(resultXml);
      return {
        message: () =>
          `expected ${xpath} to have ${expectedValue} matches, but got ${matchCount}`,
        pass: false
      };
    }

    return {
      message: () => `expected ${xpath} to have ${expectedValue} matches`,
      pass: true
    };
  }
});

expect.extend({
  toNotExist(xpath) {
    const hits = select(xpath);
    if (!hits || hits.length === 0) {
      return {
        message: () => `expected ${xpath} to not exist`,
        pass: true
      };
    }

    // get the xml (not just the text) of all the hits
    const xml = hits
      .map((node) => new XMLSerializer().serializeToString(node))
      .join(",");
    return {
      message: () => `expected ${xpath} to not exist. Found: ${xml}`,
      pass: false
    };
  }
});

expect.extend({
  toDeclareVocabulary(xpath, url) {
    const hits = select(xpath);
    if (!hits || hits.length === 0) {
      //      console.log(resultXml);
      return {
        message: () =>
          `expected ${xpath} to be '${url}' but it did not match anything`,
        pass: false
      };
    }
    const xpathWithAttr = xpath + `[@Link="${url}"]`;
    const pass = select(xpathWithAttr).length > 0;
    if (pass) {
      return {
        message: () => `expected ${xpathWithAttr} Link to be '${url}'`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${xpathWithAttr} Link to be '${url}'\r\n`,
        pass: false
      };
    }
  }
});

expect.extend({
  toBeClosed(xpath) {
    const hits = select(xpath);
    if (!hits || hits.length === 0) {
      //      console.log(resultXml);
      return {
        message: () => `expected ${xpath} to be exist`,
        pass: false
      };
    }
    const xpathWithAttr = xpath + `[@Type="ClosedVocabulary"]`;
    const pass = select(xpathWithAttr).length > 0;
    if (pass) {
      return {
        message: () => `expected ${xpathWithAttr} type to be closed}'`,
        pass: true
      };
    } else {
      return {
        message: () =>
          `expected ${xpathWithAttr} Link to be type to be closed. `,
        pass: false
      };
    }
  }
});

expect.extend({
  toBeOpen(xpath) {
    return assertAttribute(xpath, "Type", "OpenVocabulary");
  }
});
expect.extend({
  toBeOpenList(xpath) {
    return assertAttribute(xpath, "Type", "OpenVocabularyList");
  }
});
expect.extend({
  toHaveAttributeValue(xpath, attributeName, attributeValue) {
    return assertAttribute(xpath, attributeName, attributeValue);
  }
});
expect.extend({
  toHaveText(xpath, text) {
    if (value(xpath) === text) {
      return {
        message: () => "",
        pass: true
      };
    } else {
      return {
        message: () =>
          `expected ${xpath}, which is "${value(xpath)}", to equal "${text}".`,
        pass: false
      };
    }
  }
});
