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

type ReactSFC = (...args: any[]) => any;
interface ExtensionRegistry {
  [k: string]: ReactSFC[];
}

const registry: ExtensionRegistry = {};

export function register(extensionPoint: string, ext: ReactSFC) {
  const exts = registry[extensionPoint] || [];
  registry[extensionPoint] = exts.concat(ext);
}

export function getExtensions(extensionPoint: string): ReactSFC[] {
  return registry[extensionPoint] || [];
}

export function mapExtensions(extensionPoint: string, ...args: any[]): any[] {
  const exts = registry[extensionPoint] || [];
  return exts.map(e => e(...args));
}
