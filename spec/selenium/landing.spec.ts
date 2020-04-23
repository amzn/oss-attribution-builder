// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* tslint:disable:no-floating-promises */

import { By, until } from 'selenium-webdriver';
import build, { CustomDriver } from './driver';

describe('landing page', function () {
  let driver: CustomDriver;
  beforeAll(async function () {
    driver = await build();
  });
  afterAll(async function () {
    await driver.quit();
  });

  it('loads correctly', async function () {
    driver.getRelative('/');
    const title = await driver.getTitle();
    expect(title).toContain('Attribution Builder');
    await driver.wait(until.elementLocated(By.className('jumbotron')));
  });

  it('can navigate and render the new project form', async function () {
    driver.getRelative('/');
    driver.findElement(By.css('a[href="/projects/new"]')).click();
    await driver.wait(until.elementLocated(By.id('description')), 1000);
  });
});
