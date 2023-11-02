// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseUrlAPI: 'http://15.206.202.183:7081',
  baseUrlAPIDocUploadAPI: 'http://localhost:7081/document/upload2',
  baseUrlAPIDocdownloadAPI: 'http://localhost:7081/document/downloadDocument',
  baseUrlCountryAPI: 'http://localhost:7081',
  baseUrlAuditlog :  'http://65.0.7.85:7000',

  baseSyncAPI: 'http://localhost:7090',
  baseMainSyncAPI: 'http://3.108.9.184/web-api',
  baseUrlLandingPage : 'http://15.206.202.183/country/landing-page',

};
// baseUrlAPI: 'http://3.110.188.89:7080',
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
