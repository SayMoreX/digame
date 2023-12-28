import { makeObservable, observable, runInAction } from "mobx"; // TODO is this observable enough? The old version had an observable map

/* This class holds text that is both monolingual (normally means language doesn't matter, is just English)
 and text that has the same thing nominally translated into one or more languages (like a title, or a description).
 
 When there is more than one language, the strings are stored in a single field in this format:
  [[en]]This is the Enlish text[[es]]Este es el texto en español[[fr]]C'est le texte en français

  This is currently done in an inefficient way, but it is easy to understand and the implementation
  is hidden so we can change it later if we want. E.g., a lot could be done with a regex instead of split/join all the time.
 */

export class TextHolder {
  public _text: string = "";
  constructor() {
    makeObservable(this, {
      _text: observable
    });
  }

  public get monoLingualText(): string {
    if (this._text.includes("[[") === true)
      throw new Error(`This text should not be multilingual: "${this._text}"`);
    return this._text;
  }
  public getSerialized(): string {
    return this._text;
  }
  // public static parseSerialized(text: string): TextHolder {
  //   const t = new TextHolder();
  //   t._text = text;
  //   return t;
  // }
  public getFirstNonEmptyText(tags: string[]): string {
    const axes = this.deserializeMultiAxisText();
    for (const tag of tags) {
      const text = axes[tag];
      if (text !== undefined && text.trim() !== "") {
        return text;
      }
    }
    return "";
  }
  public set monoLingualText(value: string) {
    if (this._text.includes("[[") === true)
      throw new Error(`This text should not be multilingual: "${this._text}"`);
    this._text = value;
  }
  public get combinedText(): string {
    return this.getSerialized();
  }
  public set combinedText(value: string) {
    runInAction(() => (this._text = value));
  }
  public setTextAxis(tag: string, textForAxis: string): void {
    if (tag === "") throw new Error("Cannot set text for empty language tag");
    const axisTextDictionary = this.deserializeMultiAxisText();
    axisTextDictionary[tag] = textForAxis;
    // console.log(JSON.stringify(axisTextDictionary));

    this._text = this.serializedMultAxisText(axisTextDictionary);
    // console.log(`this._text: "${this._text}"`);
  }
  public getTextAxis(tag: string): string {
    const axisTextDictionary = this.deserializeMultiAxisText();
    return axisTextDictionary[tag] || "";
  }

  private deserializeMultiAxisText(): MultiAxisText {
    // we store multiple languages in a single field in this format:
    // [[en]]This is the Enlish text[[es]]Este es el texto en español[[fr]]C'est le texte en français
    // We want to divide this into an array of {tag, text} pairs

    // if there are no language tags, return a dictionary with "en" set to the string
    if (!this._text.includes("[[")) {
      return { en: this._text };
    }
    // first divide the text into an array of axis/text pairs
    const axisTextPairsWithExtra = this._text.split("[[").map((s) => s.trim());
    //// console.log(axisTextPairsWithExtra);

    if (axisTextPairsWithExtra[0] !== "")
      throw new Error(
        `Cannot have text before the first langauge tag. Found when deserializing: ${this._text}`
      );
    // remove the first element, which is the text before the first tag, which is not valid
    axisTextPairsWithExtra.shift();
    // now split each pair into tag and text
    const axisTextPairsArrayOfArrays = axisTextPairsWithExtra.map((s) =>
      s.split("]]")
    );

    const result: MultiAxisText = {};
    // add each pair to result
    axisTextPairsArrayOfArrays.forEach((pair) => {
      if (pair.length != 2) {
        throw new Error(
          `Invalid axis/text pair when deserializing: ${this._text}`
        );
      }
      result[pair[0]] = pair[1];
    });
    return result;
  }

  private getNonEmptyLanguageAxes(axes: MultiAxisText): string[] {
    // console.log(`object keys: "${Object.keys(axes)}"`);
    return Object.keys(axes).filter(
      (language) => axes[language] !== undefined && axes[language].trim() !== ""
    );
  }

  private serializedMultAxisText(axes: MultiAxisText): string {
    const nonEmptyAxes = this.getNonEmptyLanguageAxes(axes);
    //console.log(`nonEmptyAxes: ${nonEmptyAxes} from "${JSON.stringify(axes)}"`);

    if (nonEmptyAxes.length === 0) {
      // console.log("no languages");
      return ""; // No languages
    }

    if (nonEmptyAxes.length === 1 && nonEmptyAxes[0] === "en") {
      return axes["en"]!; // Only English
    }

    const serializedParts = nonEmptyAxes.map((language) => {
      const text = axes[language]!.trim(); // Trim whitespace
      return text.length > 0 ? `[[${language}]]${text}` : "";
    });

    return serializedParts.join("");
  }
}

export type LanguageAxis = { tag: string; label: string; name: string };

//  a dictionary of language tags to text
// keep private
interface MultiAxisText {
  [key: string]: string;
}
