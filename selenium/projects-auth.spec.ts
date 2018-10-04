// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* tslint:disable:no-floating-promises */

import { By, until } from 'selenium-webdriver';
import build, { CustomDriver } from './driver';

const projectName = 'ACL Test ' + new Date().getTime();

describe('project authentication', function() {
  let driver: CustomDriver;
  beforeAll(async function() {
    driver = await build();
    await driver
      .manage()
      .timeouts()
      .implicitlyWait(1000);
  });
  afterAll(async function() {
    await driver.quit();
  });

  it('bootstraps a project', async function() {
    driver.getRelative('/projects/new');
    driver.wait(until.elementLocated(By.id('onboarding-form')));

    driver.findElement(By.id('title')).sendKeys(projectName);
    driver.findElement(By.id('version')).sendKeys('x');
    driver.findElement(By.id('description')).sendKeys('x');
    driver
      .findElement(By.css('input[name="openSourcing"][value="false"]'))
      .click();
    driver.findElement(By.id('legalContact')).sendKeys('a-real-person');
    driver.findElement(By.id('plannedRelease')).sendKeys('1111-11-11');
    driver
      .findElement(By.css('#ownerGroup-container .Select-placeholder'))
      .click();
    driver
      .findElement(
        By.xpath(
          '//*[@id="ownerGroup-container"]//div[@class="Select-menu"]//div[text()="everyone"]'
        )
      )
      .click();

    driver
      .findElement(By.css('form#onboarding-form button[type="submit"]'))
      .click();

    const headerText = await driver
      .findElement(By.id('project-heading'))
      .getText();
    expect(headerText).toContain(projectName);
  });

  it('can load the acl editor', async function() {
    driver.findElement(By.id('tools-dropdown-toggle')).click();
    driver.findElement(By.css('a[href$="/acl"]')).click();
    await driver.wait(until.elementLocated(By.id('project-acl-editor')));
  });

  it('wont let a person disown a project', async function() {
    const input = driver.findElement(
      By.xpath('//form//tbody/tr[1]//input[@type="text"]')
    );
    input.clear();
    input.sendKeys('blah');
    driver.findElement(By.css('button[type="submit"]')).click();

    driver.sleep(1000); // modal animation
    const errorText = await driver
      .findElement(By.css('#error-modal .modal-body'))
      .getText();
    expect(errorText).toContain('cannot remove yourself');
    driver.findElement(By.css('#error-modal button.btn-primary')).click(); // close button
    driver.wait(
      until.elementIsNotVisible(driver.findElement(By.css('#error-modal')))
    );
    driver.sleep(1000); // modal animation

    input.clear();
    await input.sendKeys('self:selenium');
  });

  it('can add some friends to the list', async function() {
    driver.findElement(By.id('acl-add')).click();
    const select2 = driver.findElement(By.xpath('//form//tbody/tr[2]//select'));
    const input2 = driver.findElement(
      By.xpath('//form//tbody/tr[2]//input[@type="text"]')
    );
    select2.click();
    const select2editor = driver.findElement(
      By.xpath('//form//tbody/tr[2]//select/option[@value="editor"]')
    );
    select2editor.click();
    input2.sendKeys('self:fake-editor');

    driver.findElement(By.id('acl-add')).click();
    const select3 = driver.findElement(By.xpath('//form//tbody/tr[3]//select'));
    const input3 = driver.findElement(
      By.xpath('//form//tbody/tr[3]//input[@type="text"]')
    );
    select3.click();
    const select3viewer = driver.findElement(
      By.xpath('//form//tbody/tr[3]//select/option[@value="viewer"]')
    );
    select3viewer.click();
    input3.sendKeys('self:fake-viewer');

    await driver.findElement(By.css('button[type="submit"]')).click();
  });

  it('cannot edit acl as editor', async function() {
    // switch users and return
    driver.wait(until.elementLocated(By.id('project-heading')));
    const projectUrl = await driver.getCurrentUrl();
    driver.setUser('fake-editor');
    await driver.get(projectUrl);

    // ensure the acl link isn't clickable
    const info = driver.findElement(By.id('acl-owner-info'));
    const classes = await info.getAttribute('class');
    const text = await info.getText();
    expect(classes).not.toContain('EditableText');
    expect(text).toContain('owned by');

    // but that main project details still are
    await driver.findElement(By.css('#project-heading .EditableText'));
  });

  it('cannot edit project as viewer', async function() {
    const projectUrl = await driver.getCurrentUrl();
    driver.setUser('fake-viewer');
    await driver.get(projectUrl);

    // nothing should be editable
    const numEditable = await driver.findElements(By.className('EditableText'));
    expect(numEditable.length).toEqual(0);
  });
});
