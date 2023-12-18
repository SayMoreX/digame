import { vi, describe, it, beforeAll, beforeEach, expect } from "vitest";
import { validateImdiAsyncInternal } from "./validateImdi";
import { XMLValidationResult } from "xmllint-wasm";
const appPath = ""; // in test environment this is just the root, so the schemas are in schemas/IMDI_3.0.xsd
describe("validateImdiAsyncInternal", () => {
  it("smoke test with valid imdi", async () => {
    const imdiContents = `<?xml version="1.0"?>
    <METATRANSCRIPT xmlns="http://www.mpi.nl/IMDI/Schema/IMDI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.mpi.nl/IMDI/Schema/IMDI_3.0.xsd" Type="CORPUS" Version="0" Date="2023-11-25" Originator="lameta 2.1.2-alpha" FormatId="IMDI 3.0">
      <Corpus>
        <Name>0257-IGS0048</Name>
        <Title>Documentation of Blablanga</Title>
        <Description>This deposit contains digital audio and video recordings of Blablanga (Blanga) speakers or ritual performers as well as digital photographs, annotations and written notes, and includes a balanced proportion of elicited data, grammaticality judgements, dialogues, conversation, narrative, hortatory, procedural, expository, and descriptive texts, tokens for phonetic analysis as well as ethnographic, sociological and cultural information, customs, rituals, songs, and dances.</Description>
        <CorpusLink Name="OtherDocuments">0257-IGS0048/OtherDocuments.imdi</CorpusLink>
      </Corpus>
    </METATRANSCRIPT>`;

    const result = await validateImdiAsyncInternal(appPath, imdiContents);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("smoke test with invalid imdi", async () => {
    const imdiContents = `<?xml version="1.0"?>
    <METATRANSCRIPT xmlns="http://www.mpi.nl/IMDI/Schema/IMDI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.mpi.nl/IMDI/Schema/IMDI_3.0.xsd" Type="CORPUS" Version="0" Date="2023-11-25" Originator="lameta 2.1.2-alpha" FormatId="IMDI 3.0">
    <IDontBelong/></METATRANSCRIPT>`;

    const result = await validateImdiAsyncInternal(appPath, imdiContents);

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    // assert that the error has the string "foo"
    expect(result.errors[0].message).toContain("IDontBelong");
  });

  it("smoke test with valid opex and valid imdi inside", async () => {
    const imdiContents = `<?xml version="1.0"?>
  <opex:OPEXMetadata xmlns:opex="http://www.openpreservationexchange.org/opex/v1.2">
    <opex:DescriptiveMetadata>
      <METATRANSCRIPT xmlns="http://www.mpi.nl/IMDI/Schema/IMDI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.mpi.nl/IMDI/Schema/IMDI_3.0.xsd" Type="CORPUS" Version="0" Date="2023-12-18" Originator="lameta 2.2.0-alpha" FormatId="IMDI 3.0">
        <Corpus>
          <Name>Foo</Name>
          <Title/>
          <Description>The Etoro, or Edolo, are a tribe and ethnic group of the Southern Highlands Province of Papua New Guinea. Their territory comprises the southern slopes of Mt. Sisa, along the southern edge of the central mountain range of New Guinea, near the Papuan Plateau.</Description>
        </Corpus>
      </METATRANSCRIPT>
    </opex:DescriptiveMetadata>
  </opex:OPEXMetadata>`;

    const result = await validateImdiAsyncInternal(appPath, imdiContents);
    expectValid(result);
  });
  it("smoke test with invalid imdi inside of opex", async () => {
    const imdiContents = `<?xml version="1.0"?>
      <opex:OPEXMetadata xmlns:opex="http://www.openpreservationexchange.org/opex/v1.2">
        <opex:DescriptiveMetadata>
          <METATRANSCRIPT xmlns="http://www.mpi.nl/IMDI/Schema/IMDI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="schemas/IMDI_3.0.xsd" Type="CORPUS" Version="0" Date="2023-12-18" Originator="lameta 2.2.0-alpha" FormatId="IMDI 3.0">
            <IDontBelong/>
          </METATRANSCRIPT>
        </opex:DescriptiveMetadata>
      </opex:OPEXMetadata>`;

    const result = await validateImdiAsyncInternal(appPath, imdiContents);

    expectInvalid(result);
    // assert that the error has the string "foo"
    expect(result.errors[0].message).toContain("IDontBelong");
  });
});

function expectValid(result: XMLValidationResult) {
  if (!result.valid) {
    console.log(result.errors);
  }
  expect(result.valid).toBe(true);
  expect(result.errors).toHaveLength(0);
}

function expectInvalid(result: XMLValidationResult) {
  if (result.valid) {
    expect("valid").toBe("invalid");
  }
  expect(result.valid).toBe(false);
}
