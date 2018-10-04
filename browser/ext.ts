// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

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
