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

import {By, until} from 'selenium-webdriver';
import build from './driver';


describe('landing page', function () {
  let driver;
  beforeAll(async function (done) {
    driver = await build();
    done();
  });
  afterAll(async function (done) {
    await driver.quit();
    done();
  });

  it('loads correctly', async function (done) {
    driver.get('http://0.0.0.0:8000');
    const title = await driver.getTitle();
    expect(title).toContain('Attribution Builder');
    await driver.wait(until.elementLocated(By.className('jumbotron')));

    done();
  });

  it('can navigate and render the new project form', async function (done) {
    driver.get('http://0.0.0.0:8000');
    driver.findElement(By.css('a[href="/projects/new"]')).click();
    await driver.wait(until.elementLocated(By.id('description')), 1000);

    done();
  });

});
