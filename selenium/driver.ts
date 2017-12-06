/* Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

// tslint:disable:no-console

import webdriver = require('selenium-webdriver');
jasmine.DEFAULT_TIMEOUT_INTERVAL = 30 * 1000;

export type CustomDriver = webdriver.WebDriver & {
                             getRelative: (path: string) => webdriver.promise.Promise<void>,
                             setUser: (user: string) => webdriver.promise.Promise<void>,
                           };

export default async function (): Promise<CustomDriver> {
  const driver: any = await new webdriver.Builder()
    .usingServer('http://localhost:4444/wd/hub')
    .forBrowser('chrome')
    .build();
  driver.getRelative = function (path: string) {
    return driver.get(`http://web:8000${path}`);
  };
  driver.setUser = async function (user: string = 'selenium') {
    driver.getRelative('/dummy-no-auth');
    await driver.manage().addCookie({name: 'nullauth-dummy-user', value: user});
  };
  await driver.setUser();
  return driver;
}
