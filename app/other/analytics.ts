/*
    I chose electron-ga because it works with the mobile instead of web approach, which seems to
    fit the electron situation better. It's just a thin wrapper around the "Measurement Protocol"
*/
import Analytics from "electron-ga";

import userSettingsSingleton from "./UserSettings";
import { sentryBreadCrumb } from "./errorHandling";
import { currentUILanguage } from "./localization";
import { node } from "prop-types";

let analytics: Analytics | undefined;

export function initializeAnalytics() {
  if (process.env.NODE_ENV === "test" || userSettingsSingleton.DeveloperMode) {
    // analytics = new Analytics("bogus", {
    //   appName: "bogus",
    //   appVersion: require("package.json").version,
    //   language: currentUILanguage || "",
    //   clientId: "bogus",
    // });
    analytics = undefined;
  } else {
    analytics = new Analytics("UA-131224630-1", {
      appName: "lameta",
      appVersion: require("package.json").version,
      language: currentUILanguage || "",
      clientId: userSettingsSingleton.ClientId,
    });
  }
  //analytics.send("event", { ec: "launch", ea: "launch", an: "saymorex" });
}

export function analyticsLocation(name: string) {
  if (analytics)
    analytics
      .send("screenview", { cd: name })
      //.then(() => console.log("Sent screen view" + name))
      .catch((error) => console.error(error));
  // in case of an error later, also list this in the error log
  sentryBreadCrumb(name);
}
export function analyticsEvent(category: string, action: string) {
  if (analytics)
    analytics
      .send("event", {
        ec: category,
        ea: action,
        // at the moment, I'm not clear where it is best to stick how-using
        cn: userSettingsSingleton.HowUsing, // Campaign Name not clear to me what part of Campaign I should put this in
        ci: userSettingsSingleton.HowUsing, // Campaign ID
        ck: userSettingsSingleton.HowUsing, // Campaign Keyword
      })
      //.then(() => console.log(`Sent event ${category}/${action}`))
      .catch((error) => console.error(error));
}
