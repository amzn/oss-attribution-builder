// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// tslint:disable:no-console

import webdriver = require('selenium-webdriver');
jasmine.DEFAULT_TIMEOUT_INTERVAL = 30 * 1000;

export type CustomDriver = webdriver.WebDriver & {
  getRelative: (path: string) => webdriver.promise.Promise<void>;
  setUser: (user: string) => webdriver.promise.Promise<void>;
};

export default async function(): Promise<CustomDriver> {
  const driver: any = await new webdriver.Builder()
    .usingServer('http://localhost:4444/wd/hub')
    .forBrowser('chrome')
    .build();
  driver.getRelative = function(path: string) {
    return driver.get(`http://web:2424${path}`);
  };
  driver.setUser = async function(user: string = 'selenium') {
    driver.getRelative('/dummy-no-auth');
    await driver
      .manage()
      .addCookie({ name: 'nullauth-dummy-user', value: user });
  };
  await driver.setUser();
  return driver;
}
